const mongoose = require('mongoose');
const slugify = require('slugify');

// database schema
const BootcampSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name can not be more than 50 characters']
    },
    slug: String,
    description:{
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [500, 'Description can not be more than 500 characters']
    },
    website: {
        type: String,
        match: [
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
            'Please use a valid URL with HTTP or HTTPS'
        ]
    },
    phone: {
        type: String,
        maxlength: [20, 'Phone number can not be longer than 20 characters']
    },
    email: {
        type: String,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,]
    },
    address:   {
        type: String,
        required: [true, 'Please add an address']
    },
    careers: {
        type: [String],
        required: true,
        enum: [
            'Web Development',
            'Mobile Development',
            'UI/UX',
            'Data Science',
            'Business',
            'Other'
        ]
    },

    averageRating: {
        type: Number,
        min: [1, 'Rating must be at least'],
        max: [10, 'Rating can not be more than 10']
    },
    averageCost: Number,

    photo: {
        type: String,
        default: 'no-photo.jpg'
    },
    housing: {
        type: Boolean,
        default: false
    },
    jobAssssistance: {
        type: Boolean,
        default: false
    },
    jobGuarantee: {
        type: Boolean,
        default: false
    },
    acceptGi: {
        type: Boolean,
        default: false
    },
    zipcode: {
     type: String,
     required: false // or true if you want it to be mandatory
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


// create bootcamp slug
BootcampSchema.pre('save', function(next) {
    this.slug = slugify(this.name, {lower: true});
    next();
});



module.exports = mongoose.model('Bootcamp', BootcampSchema);








