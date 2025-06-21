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
const users = require("./routes/users");
const reviews = require("./routes/reviews");
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');


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

// sanitize data 
app.use(mongoSanitize());

// set security headers
app.use(helmet());

// prevents cross site scripting attacks
app.use(xss());

// rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// prevent http param pollution
app.use(hpp());

// enable cors
app.use(cors());

// set static folder
app.use(express.static(path.join(__dirname, 'public')));

// route mounting
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);

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

