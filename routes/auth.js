const express = require('express');
const {register, login, getMe, forgotPassword, resetpassword, updateDetails, updatepassword, logout} = require('../controllers/auth');

const router = express.Router();
const {protect} = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetpassword);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatepassword);

module.exports = router;