const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const directRoomSchema = new mongoose.Schema({
    roomID: String,
    latestMessage: Object,
    participants: [{ type:ObjectId, ref:"User" }],
    directNotif: { type: Number, default: 0},
});

mongoose.model("directrooms", directRoomSchema);


