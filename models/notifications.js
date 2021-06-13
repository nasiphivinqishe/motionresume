//defining notifications schema
const mongoose = require("mongoose");
const notificationSchema = new mongoose.Schema({
    notificationType :{
        type : String,
        required :  true,
    },
    from : {
        type : String,
        required : false,
    },
    to : {
        type : String,
        required : false,
    },
    isRead : {
        type : Boolean,
        required : false,
    },
    jobId : {
        type : String,
        required : false,
    },
})
module.exports = mongoose.model("notifications", notificationSchema);
