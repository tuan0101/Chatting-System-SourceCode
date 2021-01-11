const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const LiveRooms = mongoose.model("liverooms");
const SchoolRooms = mongoose.model("schoolrooms");


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