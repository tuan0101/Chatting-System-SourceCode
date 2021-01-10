const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const roomSchema = new mongoose.Schema({
    roomID: String,
    roomName: String,
    latestMessage: Object,
    password: String,
    participants: [{ type:ObjectId, ref:"User" }],
    roomHost: { type:ObjectId, ref:"User" },
});

mongoose.model("liverooms", roomSchema);


