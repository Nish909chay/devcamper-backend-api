const express = require('express');
const {protect, authorize} = require('../middleware/auth');

const {
    getReviews, getReview
        } = require('../controllers/reviews')

const Review = require('../models/Review');
const advancedResults = require('../middleware/advancedResults');   
const router = express.Router({mergeParams: true});  //initialize 

router.route('/').get(advancedResults(Review, {
                path: 'bootcamp',
                select: 'name description'
            }),getReviews)

router.route('/:id').get(getReview);
            


module.exports = router;