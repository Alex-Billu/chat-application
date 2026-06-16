const User = require('../models/User');

// @desc    Get or Search all users
// @route   GET /api/users?search=
// @access  Public
const allUsers = async (req, res) => {
    const keyword = req.query.search
        ? {
            $or: [
                { name: { $regex: req.query.search, $options: "i" } },
                { email: { $regex: req.query.search, $options: "i" } },
            ],
        }
        : {};

    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
    res.send(users);
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
    const { name, profilePic } = req.body;
    
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = name || user.name;
        user.profilePic = profilePic || user.profilePic;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            profilePic: updatedUser.profilePic,
        });
    } else {
        res.status(404).json({ message: "User not found" });
    }
};

module.exports = { allUsers, updateProfile };
