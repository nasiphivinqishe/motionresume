//defining messages schema
const mongoose = require("mongoose");
const messageSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    from: {
        type: String,
        required: true,
    },
    to: {
        type: String,
        required: true,
    },
    isRead: {
        type: Boolean,
        required: false,
    },
    created: {
        type: Date,
        required: true,
        default: Date.now,
    },
})
module.exports = mongoose.model("messages", messageSchema);
