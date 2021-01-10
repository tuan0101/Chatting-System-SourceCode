const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const messageSchema = mongoose.Schema({
    //key: String,
    roomID: String,
    message: String,
    timestamp: String,    
    sender: { type:ObjectId, ref:"User" },
    receiverID: String,
});

mongoose.model("messagecontents", messageSchema); 