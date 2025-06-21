const ErrorResponse = require('../utils/ErrorResponse');
const Course = require('../models/Course');
const mongoose = require('mongoose');
const asyncHandler = require('../middleware/async');
const Bootcamp = require('../models/Bootcamp');

// get all courses
// GET /API/V1/COURSES
// GET /bootcamps/bootcampId/courses

exports.getCourses = asyncHandler(async (req,res,next) => {

        
        if(req.params.bootcampId)
        {
                const courses = await Course.find({bootcamp: req.params.bootcampId});

                return res.status(200).json({
                        sucess: true,
                        count: courses.length,
                        data: courses
                })
        }
        else
        {
            res.status(200).json(res.advancedResults);
        }

        

});



// get single course
// GET /API/V1/COURSES/:id
// Public

exports.getCourse = asyncHandler(async (req,res,next) => {

        const course = await Course.findById(req.params.id).populate({

                path: 'bootcamp',
                select: 'name description'

        });

        if(!course){
                return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
        }
        
        res.status(200).json({
                success: true,
                data: course
        });

});

// add a course
// POST /API/V1/bootcamps/:bootcamp:id/courses
// Private

exports.addCourse = asyncHandler(async (req,res,next) => {

        req.body.bootcamp = req.params.bootcampId;
        req.body.user = req.user.id;



        const bootcamp = await Bootcamp.findById(req.params.bootcampId);


        if(!bootcamp){
                return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.bootcampId}`, 404));
        }

         // make sure user is the owner of the bootcamp
            if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
                return next(new ErrorResponse(`User ${req.user.id} is not authorized to add this course to bootcamp ${bootcamp._id}`, 401));
            }   
        

        const course = await Course.create(req.body);
        
        res.status(200).json({
                success: true,
                data: course
        });

});


// update course
// PUT /API/V1/courses/:id
// Private

exports.updateCourse = asyncHandler(async (req,res,next) => {

        let course = await Course.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
                runValidators: true
        });
        if(!course){
                return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
        }

         // make sure user is the course owner
            if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
                return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this course to ${course._id}`, 401));
            }   


        course = await Course.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
                runValidators: true
        })
        
        res.status(200).json({
                success: true,
                data: course
        });

});



// delete course
// DELETE /API/V1/courses/:id
// Private

exports.deleteCourse = asyncHandler(async (req,res,next) => {

        const course = await Course.findById(req.params.id) 

        if(!course){
                return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
        }

        // make sure user is the course owner
            if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
                return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this course to ${course._id}`, 401));
            }   

       
        await course.deleteOne();
        
        res.status(200).json({
                success: true,
                data: {}
        });

});
