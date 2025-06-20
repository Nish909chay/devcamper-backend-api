const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: [true, 'Please add Description']
  },
  weeks: {
    type: String,
    required: [true, 'Please add no. of weeks']
  },
  tuition: {
    type: Number,
    required: [true, 'Please add Tuition fee']
  },
  minimumSkill: {
    type: String,
    required: [true, 'Please add minimum Skill req'],
    enum: ['beginner','intermediate','advanced']
  },
  scholarshipAvailable: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref:'Bootcamp',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref:'User',
    required: true
  }

});


CourseSchema.statics.getAverageCost = async function(bootcampId)
{

    const obj = await this.aggregate([
      {
        $match: {bootcamp: bootcampId}
      },
      {
        $group: {
          _id: '$bootcamp',
          averageCost: {$avg : '$tuition'}
        }
      }
    ]);

    try {
      await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
        averageCost: Math.ceil(obj[0].averageCost / 10) * 10
      });
    } 
    catch (err) {
      console.error(err);
    }
}

// middleware that calls getAverageCost after save
CourseSchema.post('save', function(){
  this.constructor.getAverageCost(this.bootcamp);

});

// middleware that calls getAverageCost before remove
CourseSchema.pre('remove', function(){
  this.constructor.getAverageCost(this.bootcamp);
  
});



module.exports = mongoose.model('Course', CourseSchema);

