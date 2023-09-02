const Message = require('../models/messageModel');
const User = require('../models/userModel');
const Chat = require('../models/chatModel')

//sending new message
const sendMessageController = async(req, res) => {
    const {content, chatId} = req.body;

    if(!content || !chatId) {
        console.log('Invalid data passed into request');
        return res.status(400)
    }

    var newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatId
    }
    try {
        var message = await new Message( newMessage ).save()

        message = await message.populate("sender", "name pic");
        message = await message.populate("chat");
        message = await User.populate(message, {
            path: 'chat.users',
            select: 'name pic email'
        });

        await Chat.findByIdAndUpdate(req.body.chatId, {
            latestMessage: message
        })

        res.json(message)

    } catch (error) {
        res.status(400).send(error)
    }
}

//getting all messages
const getAllMessages = async(req, res) => {
    try {
        const messages = await Message.find({chat: req.params.chatId}).populate("sender", "name pic email").populate("chat")

        res.json(messages)
        
    } catch (error) {
        res.status(400).send(error)
    }
}

module.exports = {sendMessageController, getAllMessages}