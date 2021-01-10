const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const requireLogin = require("../middleware/requireLogin");
const Messages = mongoose.model("messagecontents");
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
        //     console.log("New message is inserted");
        // } else if (change.operationType === 'delete') {
        //     console.log('Message is deleted');
        // } else {
        //     console.log('Error triggering Pusher')
        // }
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
});

// router.get('/messages/sync', (req, res)=>{
//     Messages.find({roomID: req.query.roomID}, (err, data)=> {
//         if(err){
//             res.status(500).send(err)
//         } else {
//             res.status(200).send(data)
//         }
//     })
// })

router.get('/messages/sync', (req, res) => {
    Messages.find({ roomID: req.query.roomID })
        .populate("sender", "name pic")
        .then(data => {
            res.status(200).send(data)
        })
        .catch(err => {
            res.status(500).send(err)
        })
})

router.get('/messages/last', (req, res) => {
    Messages.find({ roomID: req.query.roomID }, (err, data) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(200).send(data)
        }
    }).sort({ timestamp: -1 }).limit(1)
})

router.post('/messages/new', (req, res) => {
    const dbMessage = req.body;
    // save data to MongoDB
    Messages.create(dbMessage, (err, data) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(201).send(`new message created: \n ${data}`)
        }
    })
})

router.delete('/messages/delete/:roomID', (req, res) => {
    Messages.deleteMany({ roomID: { $in: req.params.roomID } }, (err, data) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(201).send(`the messages are deleted: \n ${data}`)
        }
    })
})


module.exports = router