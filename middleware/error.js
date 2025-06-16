const errorHandler = (err,req,res,next) => { //next passes control to the next niddleware in stack
    // log to console for devveloper
    console.log(err.stack.red);

    res.status(500).json({
        success: false,
        error: err.message
    });

}

module.exports = errorHandler;