const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const LiveRooms = mongoose.model("liverooms");
const SchoolRooms = mongoose.model("schoolrooms");
const DirectRooms = mongoose.model("directrooms");
const Pusher = require('pusher');

const pusher = new Pusher({
    appId: '1080334',
    key: 'cb908631b197c8834d00',
    secret: '7a2a4f6e5cf55520809d',
    cluster: 'us2',
    useTLS: true
});

const db = mongoose.connection;
db.once("open", () => {
    const roomCollection = db.collection("liverooms");
    const changeStream = roomCollection.watch();

    // const directRoomCollection = db.collection("directrooms");
    // const directRoomStream = directRoomCollection.watch();

    changeStream.on("change", (change) => {
        if (change.operationType === 'insert') {
            const roomInfo = change.fullDocument;
            pusher.trigger('liveRooms', 'newRoom',
                {
                    'change': change,
                    // roomID: roomInfo.roomID,
                    // hostName: roomInfo.hostName,
                    // roomName: roomInfo.roomName,
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
            // console.log('Error triggering Pusher from Live Rooms')
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
        
        } else if (change.operationType === 'insert') {
            //console.log('Create a direct room');
        } else if (change.operationType === 'update') {
            //console.log('Update a direct room');
        } else {
            //console.log('Error triggering Pusher from Direct Rooms')
        }
    });
    // directRoomStream.on("change", (change) => {
    //     if (change.operationType === 'delete') {
    //         pusher.trigger('directRooms', 'deleteDR',
    //             {
    //                 'change': change,
    //             })
    //     } else if (change.operationType === 'insert') {
    //         pusher.trigger('directRooms', 'newDR',
    //             {
    //                 'change': change,
    //             })
    //     }else {
    //         console.log('Error triggering Pusher from Direct Rooms')
    //     }
    // });
});

// send all room data to the client
router.get('/rooms/sync', (req, res) => {
    LiveRooms.find()
        .populate("roomHost", "name pic")
        .populate("participants", "_id name pic")
        .then(data => {
            res.status(200).send(data)
        })
        .catch(err => {
            res.status(500).send(err)
        })
})

router.post('/rooms/new', (req, res) => {
    const dbRoom = req.body;
    LiveRooms.create(dbRoom, (err, data) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(201).send(`new room created: \n ${data}`)
        }
    })
})

// update the latest message for the current room
router.post('/rooms/latestmessage', (req, res) => {
    const { roomID, latestMessage } = req.body;
    if (latestMessage) {
        LiveRooms.updateOne(
            { roomID: roomID },
            { $set: { latestMessage: latestMessage } },// {new: true},
            (err, data) => {
                if (err) {
                    res.status(500).send(err)
                } else {
                    res.status(201).send(`the latest message updated: \n ${data}`)
                }
            })
    }

})

// update the latest message for the current room
// router.post('/rooms/beforedelete/:roomID', (req, res) => {
//     LiveRooms.updateOne(
//         { roomID: req.params.roomID },
//         { $set: { roomID: "delete" } },// {new: true},
//         (err, data) => {
//             if (err) {
//                 res.status(500).send(err)
//             } else {
//                 res.status(201).send(`alert room deletion: \n ${data}`)
//             }
//         })


// })

router.delete('/rooms/delete/:roomID', (req, res) => {
    LiveRooms.deleteOne({ roomID: req.params.roomID }, (err, data) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(201).send(`the room is deleted: \n ${data}`)
        }
    })
})

// add a new user to private room participants
router.post('/rooms/participants', (req, res) => {
    const { roomID, participants } = req.body;


    LiveRooms.updateOne(
        { roomID: roomID },
        { $set: { participants: participants } },// {new: true},
        (err, data) => {
            if (err) {
                res.status(500).send(err)
            } else {
                res.status(201).send(`the latest message updated: \n ${data}`)
            }
        })


})

/****************** School ********************/
router.get('/schoolroom/sync', (req, res) => {
    SchoolRooms.find({ school: req.query.school })
        .then(data => {
            res.status(200).send(data)
        })
        .catch(err => {
            res.status(500).send(err)
        })
})
/**************** End School ******************/

module.exports = router