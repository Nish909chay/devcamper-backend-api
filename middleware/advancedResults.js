const advancedResults = (model, populate) => async (req, res, next) => {
    const reqQuery = { ...req.query };
    
        // Fields to exclude from filtering
        const removeFields = ['select', 'sort','limit','page'];
        removeFields.forEach(param => delete reqQuery[param]);
    
        // Build the query object for advanced filtering
        let queryObj = {};
        for (let key in reqQuery) {
            if (key.includes('[') && key.includes(']')) {
                const field = key.split('[')[0];
                const op = key.match(/\[(.*)\]/)[1];
                const mongoOp = `$${op}`;
                if (!queryObj[field]) queryObj[field] = {};
                if (mongoOp === '$in') {
                    queryObj[field][mongoOp] = Array.isArray(reqQuery[key]) ? reqQuery[key] : [reqQuery[key]];
                } else {
                    const val = isNaN(reqQuery[key]) ? reqQuery[key] : Number(reqQuery[key]);
                    queryObj[field][mongoOp] = val;
                }
            } else {
                queryObj[key] = reqQuery[key];
            }
        }
    
        // Build the initial query
        let query = model.find(queryObj);
    
        // Handle select fields
        if (req.query.select) {
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }
    
        // Handle sort
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }
    
        // Debug: log the parsed query
        console.log('Parsed Query:', queryObj);
    
        // pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 50;
        const startIndex = (page -1) * limit;
        const endIndex = page * limit;
        const total = await model.countDocuments();
    
        query = query.skip(startIndex).limit(limit);

        if(populate)
        {
            query = query.populate(populate);
        }
    
    
        const results = await query;
    
        // Pagination result
        const pagination ={};
    
        if(endIndex < total)
        {
                pagination.next = 
                {
                    page: page+1,
                    limit
                }
        }
        
        if(startIndex > 0)
        {
            pagination.prev = {
                page: page-1,
                limit
            }
        }

        res.advancedResults = {
            success: true,
            count: results.length,
            pagination,
            data: results
        };

        next();
    

}

module.exports = advancedResults;