const path = require('path');
const ErrorResponse = require('../utils/ErrorResponse');
const Bootcamp = require('../models/Bootcamp');
const mongoose = require('mongoose');
const asyncHandler = require('../middleware/async');

// GET all botcamps
// GET request to /api/v1/bootcamps
// public 
exports.getBootcamps = asyncHandler( async (req,res,next) => {

    // Create a copy of req.query so the original is not modified
    

    res.status(200).json(res.advancedResults);
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

    // add user to req.body
    req.body.user = req.user.id;

    // check for published bootcamp
    const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });
    // if the user is not an admin, they can only add one bootcamp
    if (publishedBootcamp && req.user.role !== 'admin') {
        return next(new ErrorResponse(`The user with ID ${req.user.id} has already published a bootcamp`, 400));
    }

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

    let bootcamp = await Bootcamp.findById(req.params.id);
    if(!bootcamp)
    {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    }

    // make sure user is the owner of the bootcamp
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this bootcamp`, 401));
    }   

    bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true, 
        runValidators: true
    }); 

    res.status(200).json({success: true, data: bootcamp});
    
});

//  delete botcamps
// DELETE request to /api/v1/bootcamps/:id
// private 
exports.deleteBootcamp = asyncHandler(async (req,res,next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if(!bootcamp)
    {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    }
    // Use deleteOne instead of remove (for compatibility with latest Mongoose)
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this bootcamp`, 401));
    }

    await bootcamp.deleteOne();
    // await bootcamp.deleteOne(); // Not needed if using findByIdAndDelete
    res.status(200).json({success: true, data: {}});
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


//  upload image
// PUT request to /api/v1/bootcamps/:id/photo
// private 
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    }

    // make sure user is the owner of the bootcamp
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this bootcamp`, 401));
    }   

    bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true, 
        runValidators: true
    }); 

    if (!req.files) {
        return next(new ErrorResponse(`Please upload a file`, 404));
    }

    const file = req.files.file;

    // make sure that the image is a photo
    if(!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse(`Please upload an image file`, 400));
    }

    //check file size
    if(file.size > process.env.MAX_FILE_UPLOAD) {
        return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 400));
    }

    // create custom filename
    file.name = `photo_${bootcamp._id}${require('path').extname(file.name)}`;
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if(err) {
            console.error(err);
            return next(new ErrorResponse(`Problem with file upload`, 500));
        }

        await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

        res.status(200).json({
            success: true,
            data: file.name
        });
    });


    
});