const express = require('express');
const router = express.Router();  //initialize 

const {getBootcamp, getBootcamps, createBootcamp, updateBootcamp, deleteBootcamp, getBootcampsInRadius} = require('../controllers/bootcamp')

// include other resource routers
const courseRouter = require('./courses');

// re-route to other resource routers
router.use('/:bootcampId/courses', courseRouter);




router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

router
  .route('/')
  .get(getBootcamps)
  .post(createBootcamp);

router
  .route('/:id')
  .get(getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);

module.exports = router;