const ErrorResponse = require('../utils/ErrorResponse');
const Course = require('../models/Course');
const mongoose = require('mongoose');
const asyncHandler = require('../middleware/async');

// get all courses
// GET /API/V1/COURSES
// GET /bootcamps/bootcampId/courses

exports.getCourses = asyncHandler(async (req,res,next) => {

        let query;
        if(req.params.bootcampId)
        {
                query = Course.find({bootcamp: req.params.bootcampId});
        }
        else
        {
            query = Course.find().populate({
                path: 'bootcamp',
                select: 'name description'
            });
        }

        const courses = await query;
        
        res.status(200).json({
                success: true,
                count: courses.length,
                data: courses
        });

});
