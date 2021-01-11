const mongoose = require("mongoose");
const Pusher = require('pusher');

const pusher = new Pusher({
    // pusher API key
});

const db = mongoose.connection;
db.once("open", () => {
    const msgCollection = db.collection("messagecontents");
    const changeStream = msgCollection.watch();

    changeStream.on("change", (change) => {

        if (change.operationType === 'insert') {
            const messageDetails = change.fullDocument;
            pusher.trigger('messages', 'newMessage',
                {   // just need to notify the front-end      
                    sender: messageDetails.sender,
                    receiverID: messageDetails.receiverID,
                    roomID: messageDetails.roomID,
                })  // dont need to send the whole data
        }

    });

    const notifCollection = db.collection("notifications");
    const notifStream = notifCollection.watch();

    notifStream.on("change", (change) => {
        const notifDetails = change.fullDocument;
        if (change.operationType === 'insert') {
            pusher.trigger('notifChannel', 'newNotif',
            {
                _id: notifDetails._id,
            })
        }
    });

    const roomCollection = db.collection("liverooms");
    const changeStream = roomCollection.watch();


    changeStream.on("change", (change) => {
        if (change.operationType === 'insert') {
            const roomInfo = change.fullDocument;
            pusher.trigger('liveRooms', 'newRoom',
                {
                    'change': change,
                })
        } else if (change.operationType === 'update') {
            pusher.trigger('liveRooms', 'newLastMessage',
                {
                    'change': change,
                })
        } else if (change.operationType === 'delete') {
            pusher.trigger('liveRooms', 'delete',
                {
                    'change': change,
                })
        } else {
            console.log('Error triggering Pusher from Live Rooms')
        }
    });

    const directRoomCollection = db.collection("directrooms");
    const directRoomStream = directRoomCollection.watch();
    
    directRoomStream.on("change", (change) => {
        if (change.operationType === 'delete') {
            pusher.trigger('directRooms', 'deleteDR',
                {
                    'change': change,
                })
        
        } 
    });
});