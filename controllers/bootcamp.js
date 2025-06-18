const ErrorResponse = require('../utils/ErrorResponse');
const Bootcamp = require('../models/Bootcamp');
const mongoose = require('mongoose');
const asyncHandler = require('../middleware/async');

// GET all botcamps
// GET request to /api/v1/bootcamps
// public 
exports.getBootcamps = asyncHandler( async (req,res,next) => {

    // Create a copy of req.query so the original is not modified
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
    let query = Bootcamp.find(queryObj);

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
    const total = await Bootcamp.countDocuments();

    query = query.skip(startIndex).limit(limit);


    const bootcamps = await query;

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


    // Debug: log the number of results
    console.log('Bootcamps found:', bootcamps.length);

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        pagination,
        data: bootcamps
    });
});


    


// GET single botcamps
// GET request to /api/v1/bootcamps/:id
// public 
exports.getBootcamp = asyncHandler(async (req, res, next) => {
    const isValidObjectId = id => /^[a-fA-F0-9]{24}$/.test(id);
    if (!isValidObjectId(req.params.id)) {
        return res.status(404).json({ success: false, error: `Invalid Bootcamp ID :${req.params.id}` });
    }
        const bootcamp = await Bootcamp.findById(req.params.id);
        if (!bootcamp) {
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
        }
        res.status(200).json({
            success: true,
            data: bootcamp
        }); 
});

// POST create new botcamps
// POST request to /api/v1/bootcamps/:id
// private 
exports.createBootcamp = asyncHandler(async (req,res,next) => {

            const bootcamp = await Bootcamp.create(req.body);
            res.status(201).json({
            success: true,
            data: bootcamp
        });

});

// PUT update botcamps
// PUT request to /api/v1/bootcamps/:id
// private 
exports.updateBootcamp = asyncHandler(async (req,res,next) => {

    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if(!bootcamp)
    {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    }
    res.status(200).json({success: true, data: bootcamp});
    
});

//  delete botcamps
// DELETE request to /api/v1/bootcamps/:id
// private 
exports.deleteBootcamp = asyncHandler(async (req,res,next) => {

    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id); {
        
    if(!bootcamp)
    {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    }
    
    res.status(200).json({success: true, data: {}});
    }    
});

//  get botcamps within the range
//  GET request to /api/v1/bootcamps/:zipcode/:dist
// private 
// this does not have geocode funcions so it maps to direct zipcodes
// radius an distance logic does not work
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
    const { zipcode } = req.params;

    // Find all bootcamps with the given zipcode
    const bootcamps = await Bootcamp.find({ zipcode });

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps
    });
});