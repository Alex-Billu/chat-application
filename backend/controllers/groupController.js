const Chat = require('../models/Chat');
const User = require('../models/User');

// @desc    Create a Group Chat
// @route   POST /api/chats/group
// @access  Private
const createGroupChat = async (req, res) => {
    if (!req.body.users || !req.body.name) {
        return res.status(400).send({ message: "Please fill all the fields" });
    }

    var users = JSON.parse(req.body.users);

    if (users.length < 2) {
        return res.status(400).send("More than 2 users are required to form a group chat");
    }

    users.push(req.user);

    try {
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user,
        });

        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        res.status(200).json(fullGroupChat);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
};

// @desc    Rename a Group
// @route   PUT /api/chats/rename
// @access  Private
const renameGroup = async (req, res) => {
    const { chatId, chatName } = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        { chatName: chatName },
        { new: true }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

    if (!updatedChat) {
        res.status(404).send({ message: "Chat Not Found" });
    } else {
        res.json(updatedChat);
    }
};

// @desc    Add member to group
// @route   PUT /api/chats/groupadd
// @access  Private
const addToGroup = async (req, res) => {
    const { chatId, userId } = req.body;

    const added = await Chat.findByIdAndUpdate(
        chatId,
        { $push: { users: userId } },
        { new: true }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

    if (!added) {
        res.status(404).send({ message: "Chat Not Found" });
    } else {
        res.json(added);
    }
};

// @desc    Remove member from group
// @route   PUT /api/chats/groupremove
// @access  Private
const removeFromGroup = async (req, res) => {
    const { chatId, userId } = req.body;

    const removed = await Chat.findByIdAndUpdate(
        chatId,
        { $pull: { users: userId } },
        { new: true }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

    if (!removed) {
        res.status(404).send({ message: "Chat Not Found" });
    } else {
        res.json(removed);
    }
};

module.exports = {
    createGroupChat,
    renameGroup,
    addToGroup,
    removeFromGroup
};
