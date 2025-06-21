const ErrorResponse = require('../utils/ErrorResponse');
const Review = require('../models/Review');
const asyncHandler = require('../middleware/async');
const Bootcamp = require('../models/Bootcamp');

// get reviewd
// GET /API/V1/reviews
// GET /bootcamps/bootcampId/reviews

exports.getReviews = asyncHandler(async (req,res,next) => {

        
        if(req.params.bootcampId)
        {
                const reviews = await Review.find({bootcamp: req.params.bootcampId});

                return res.status(200).json({
                        sucess: true,
                        count: reviews.length,
                        data: reviews
                })
        }
        else
        {
            res.status(200).json(res.advancedResults);
        }

});

// get single review
// GET /API/V1/reviews/:id
// Public

exports.getReview = asyncHandler(async (req,res,next) => {

        const review = await Review.findById(req.params.id).populate({
                path: 'bootcamp',
                select: 'name description'

        })

        if(!review){
                return next(new ErrorResponse(`No review found with the id of ${req.params.id}`, 404)); 
        }

        res.status(200).json({
                sucess: true,
                data: review
        });

});

// add a review
// POST /API/V1/bootcamps/:bootcampId/reviews
// Private

exports.addReview = asyncHandler(async (req,res,next) => {
        req.body.bootcamp = req.params.bootcampId;      // get bootcamp id from body
        req.body.user = req.user.id;            //get user id as private- user has to logged in

        const bootcamp = await Bootcamp.findById(req.params.bootcampId);
        if(!bootcamp){
                return next(new ErrorResponse(`No bootcamp found with the id of ${req.params.bootcampId}`, 404));
        }

        const review = await Review.create(req.body);

        

        res.status(201).json({
                sucess: true,
                data: review
        });

});

// update a review
// PUT /API/V1/reviews/:id
// Private

exports.updateReview = asyncHandler(async (req,res,next) => {
       

        let review = await Review.findById(req.params.id);
        if(!review){
                return next(new ErrorResponse(`No review found with the id of ${req.params.id}`, 404));
        }
        // make sure user is the owner of the review
        if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
                return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this review`, 401));
        }

        review = await Review.findByIdAndUpdate(req.params.id, req.body, {
                new: true, 
                runValidators: true
        });

        res.status(201).json({
                sucess: true,
                data: review
        });

});

// delete review
// DELETE /API/V1/reviews/:id
// Private

exports.deleteReview = asyncHandler(async (req,res,next) => {
        
        const review = await Review.findById(req.params.id);
        if(!review){
                return next(new ErrorResponse(`No review found with the id of ${req.params.id}`, 404));
        }
        // make sure user is the owner of the review
        if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
                return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this review`, 401));
        }

        await review.deleteOne();

        res.status(201).json({
                sucess: true,
                data: {}
        });

});