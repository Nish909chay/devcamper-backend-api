const express = require('express');
const router = express.Router();  //initialize 

const {protect, authorize} = require('../middleware/auth');

const {getBootcamp, getBootcamps, createBootcamp, updateBootcamp, deleteBootcamp, getBootcampsInRadius, bootcampPhotoUpload} = require('../controllers/bootcamp');

const Bootcamp = require('../models/Bootcamp');
const advancedResults = require('../middleware/advancedResults');

// include other resource routers
const courseRouter = require('./courses');

// re-route to other resource routers
router.use('/:bootcampId/courses', courseRouter);




router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);
router.route('/:id/photo').put(protect,authorize('publisher','admin'),bootcampPhotoUpload);

router
  .route('/')
  .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
  .post(protect,authorize('publisher','admin'),createBootcamp);

router
  .route('/:id')
  .get(getBootcamp)
  .put(protect,authorize('publisher','admin'),  updateBootcamp)
  .delete(protect,authorize('publisher','admin'),  deleteBootcamp);

module.exports = router;