const ErrorResponse = require('../utils/ErrorResponse');
const Bootcamp = require('../models/Bootcamp');
const mongoose = require('mongoose');
const asyncHandler = require('../middleware/async');

// GET all botcamps
// GET request to /api/v1/bootcamps
// public 
exports.getBootcamps = asyncHandler( async (req,res,next) => {

        let queryObj = {};
        for (let key in req.query) {
            if (key.includes('[') && key.includes(']')) {
                // Advanced query: field[operator]
                const field = key.split('[')[0];
                const op = key.match(/\[(.*)\]/)[1];
                const mongoOp = `$${op}`;
                if (!queryObj[field]) queryObj[field] = {};
                // Handle $in as array
                if (mongoOp === '$in') {
                    queryObj[field][mongoOp] = Array.isArray(req.query[key]) ? req.query[key] : [req.query[key]];
                } else {
                    // Convert to number if possible
                    const val = isNaN(req.query[key]) ? req.query[key] : Number(req.query[key]);
                    queryObj[field][mongoOp] = val;
                }
            } else {
                // Simple query
                queryObj[key] = req.query[key];
            }
        }

        // Debug: log the parsed query
        console.log('Parsed Query:', queryObj);

        const bootcamps = await Bootcamp.find(queryObj);
        // Debug: log the number of results
        console.log('Bootcamps found:', bootcamps.length);

        res.status(200).json({
            success: true,
            count: bootcamps.length,
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