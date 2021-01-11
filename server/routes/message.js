const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const requireLogin = require("../middleware/requireLogin");
const Messages = mongoose.model("messagecontents");


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