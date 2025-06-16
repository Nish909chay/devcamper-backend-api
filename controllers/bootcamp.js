const Bootcamp = require('../models/Bootcamp');
const mongoose = require('mongoose');

// GET all botcamps
// GET request to /api/v1/bootcamps
// public 
exports.getBootcamps = async (req,res,next) => {

    try
    {
        const bootcamps = await Bootcamp.find();
        res.status(200).json({
            success: true,
            count: bootcamps.length,
            data: bootcamps
        });
    }
    catch(err)
    {
        res.status(400).json({
            success: false
        });
    }

    
}

// GET single botcamps
// GET request to /api/v1/bootcamps/:id
// public 
exports.getBootcamp = async (req, res, next) => {
    const isValidObjectId = id => /^[a-fA-F0-9]{24}$/.test(id);
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ success: false, error: 'Invalid Bootcamp ID' });
    }
    try {
        const bootcamp = await Bootcamp.findById(req.params.id);
        if (!bootcamp) {
            return res.status(404).json({ success: false, error: 'Bootcamp not found' });
        }
        res.status(200).json({
            success: true,
            data: bootcamp
        });
    } catch (err) {
        // res.status(400).json({
        //     success: false
        // });
        next(err);
    }
    
}

// POST create new botcamps
// POST request to /api/v1/bootcamps/:id
// private 
exports.createBootcamp = async (req,res,next) => {

    try{
            const bootcamp = await Bootcamp.create(req.body);
            res.status(201).json({
            success: true,
            data: bootcamp
        });
    }
    catch(err){
        res.status(400).json({
            success: false
        });
    }


}

// PUT update botcamps
// PUT request to /api/v1/bootcamps/:id
// private 
exports.updateBootcamp = async (req,res,next) => {

    try{
        const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if(!bootcamp)
    {
        return res.status(400).json({success: false});
    }
    res.status(200).json({success: true, data: bootcamp});
    }

    catch(err){
            res.status(400).json({success: false});

    }
    

    
}

//  delete botcamps
// DELETE request to /api/v1/bootcamps/:id
// private 
exports.deleteBootcamp = async (req,res,next) => {
    try{
        const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id); {
        
        if(!bootcamp)
        {
            return res.status(400).json({success: false});
        }
    
    res.status(200).json({success: true, data: {}});
    }
}

    catch(err){
            res.status(400).json({success: false});

    }
    
}