const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const logger = require('./middleware/logger');
dotenv.config({ path: './config/config.env'});
const morgan = require('morgan');
const colors = require('colors');
const errorHandler = require('./middleware/error');
const bootcamps = require("./routes/bootcamps");
const connectDB = require('./config/db');
const courses = require("./routes/courses");
const auth = require("./routes/auth");
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');

// connect to db
connectDB();


const app = express();  // initialize

// body parser
app.use(express.json());

// ccookie parser
app.use(cookieParser());


// dev logging middleware
if(process.env.NODE_ENV === 'development')
{
    app.use(morgan('dev'));
}

// file upload middleware
app.use(fileupload());


// set static folder
app.use(express.static(path.join(__dirname, 'public')));


app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);

app.use(errorHandler);




const PORT = process.env.PORT || 5000; 

const server = app.listen(PORT,
     console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold)
);

//handle unhandles rejection exception
process.on('unhandledRejection', (err, promise) => {
    console.log("error");
    server.close(() => process.exit(1));
});

