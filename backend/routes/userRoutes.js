const express = require('express');
const { allUsers, updateProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').get(protect, allUsers);
router.route('/profile').put(protect, updateProfile);

module.exports = router;
