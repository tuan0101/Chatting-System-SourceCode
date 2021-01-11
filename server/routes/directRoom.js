const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const DirectRooms = mongoose.model("directrooms");


router.get('/directrooms/sync', (req, res) => {
    DirectRooms.find({ participants: { $in: req.query.userID } })
        .populate("participants", "name pic")
        .then(data => {
            res.status(200).send(data)
        })
        .catch(err => {
            res.status(500).send(err)
        })
})

router.post('/directrooms/new', (req, res) => {
    const dbRoom = req.body;
    DirectRooms.create(dbRoom, (err, data) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(201).send(`new direct room created: \n ${data}`)
        }
    })
})

router.get('/directrooms/check', (req, res) => {
    DirectRooms.find({ roomID: req.query.roomID })
        .populate("participants", "_id name")
        .then(data => {
            res.status(200).send(data)
        })
        .catch(err => {
            res.status(500).send(err)
        })
})

// update the latest message for the current room
router.post('/directrooms/latestmessage', (req, res) => {
    const { roomID, latestMessage } = req.body;
    if (latestMessage) {
        DirectRooms.updateOne(
            { roomID: roomID },
            { $set: { latestMessage: latestMessage } },
            (err, data) => {
                if (err) {
                    res.status(500).send(err)
                } else {
                    res.status(201).send(`the latest DM updated: \n ${data}`)
                }
            })
    }

})


router.post('/directrooms/updatenotif', (req, res) => {
    const { roomID, directNotif } = req.body;
    if (directNotif === 0)
        DirectRooms.updateOne(
            { roomID: roomID },
            { $set: { directNotif: directNotif } },
            (err, data) => {
                if (err) {
                    res.status(500).send(err)
                } else {
                    res.status(201).send(`direct notification updated: \n ${data}`)
                }
            })
    else
        DirectRooms.updateOne(
            { roomID: roomID },
            { $inc: { directNotif: directNotif } },
            (err, data) => {
                if (err) {
                    res.status(500).send(err)
                } else {
                    res.status(201).send(`direct notification updated: \n ${data}`)
                }
            })
})


router.get('/directrooms/getnotif/:roomID', (req, res) => {
    DirectRooms.find({ roomID: req.params.roomID })
        .then(data => {
            res.status(200).send(data)
        })
        .catch(err => {
            res.status(500).send(err)
        })
})

router.delete('/directrooms/delete/:roomID', (req, res) => {
    DirectRooms.deleteOne({ roomID: req.params.roomID }, (err, data) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(201).send(`the room is deleted: \n ${data}`)
        }
    })
})

module.exports = router