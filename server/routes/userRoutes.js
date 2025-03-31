// filepath: d:\HACKATHON_25_2\fraud-detection-dashboard\server\routes\userRoutes.js
const express = require('express');
const { registerUser, loginUser, getUserDetails } = require('../controllers/userController'); // Import getUserDetails
const authenticate = require('../middleware/authenticate'); // Assuming you have an authentication middleware

const router = express.Router();

// User registration route
router.post('/register', registerUser);

// User login route
router.post('/login', loginUser);

// Fetch logged-in user details
router.get('/user', authenticate, getUserDetails); // Use getUserDetails here

module.exports = router;