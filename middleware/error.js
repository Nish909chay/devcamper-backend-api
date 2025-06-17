const ErrorResponse = require('../utils/ErrorResponse');
const errorHandler = (error,req,res,next) => { //next passes control to the next niddleware in stack
    
    // log to console for devveloper
    console.log(error);

    console.log(error.name);

    if(error.name === 'CastError')
    {
        const message = `Bootcamp not found with id of ${error.value}`;
        error = new ErrorResponse(message, 404);
    }

    // mongoose duplicate key 
    if(error.code === 11000){
        const message = "duplicate value entered";
        error = new ErrorResponse(message, 400);
    }

    //mongoose validation error - missing input field
    if(error.name === 'ValidationError'){
        const message = Object.values(error.errors).map(val => val.message);
        error = new ErrorResponse(message, 400);
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error'
    });

}

module.exports = errorHandler;