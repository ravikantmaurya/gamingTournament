const express = require("express");
const router = express.Router();
const authAdmin = require("../middleware/admin");
const { GameModes, validateId, validateModeId, validateNewGameMode, validateEditGameMode, validateDeleteGameMode } = require("../models/gameModes");


router.get('/allModes', async (req, res) => {
    //const
    let modes = await GameModes.find({});
    if (modes) {
        res.send(modes)
    } else {
        res.status(404).send("There aren't any modes. Please create one.")
    }
});

router.get('/bymodeId', async (req, res) => {
    console.log("req", req.query._id)
    const validateBody = {
        _id: req.query._id
    }
    const { error } = validateModeId(validateBody)
    if (error) return res.status(400).send(error.details[0].message);
    console.log()
    filter = {
        _id: req.query._id
    }
    let modes = await GameModes.find(filter);
    if (modes) {
        res.send(modes)
    } else {
        res.status(404).send("Something went wrong!!!");
    }
});

router.get('/bycreatorId', authAdmin, async (req, res) => {
    const validateBody = {
        creator: req.admin._id
    }
    const { error } = validateId(validateBody)
    if (error) return res.status(400).send(error.details[0].message);

    filter = {
        creator: req.admin._id
    }
    let modes = await GameModes.find(filter);
    if (modes) {
        res.send(modes)
    } else {
        res.status(404).send("Modes are not created by the creator");
    }
});

router.post('/addNew', authAdmin, async (req, res) => {
    const validateBody = {
        name: req.body.name,
        creator: req.admin._id
    }
    const { error } = validateNewGameMode(validateBody)
    if (error) return res.status(400).send(error.details[0].message)
    console.log('req', req.body)
    let mode = await GameModes.findOne({ name: req.body.name });
    if (mode) return res.status(400).send("Game Mode is already exists with the name");

    const addnewMode = {
        name: req.body.name,
        creator: req.admin._id
    }
    newMode = new GameModes(addnewMode)
    await newMode.save();
    res.send(newMode);
});

router.post("/editMode", authAdmin, async (req, res) => {
    const validateBody = {
        name: req.body.name,
        _id: req.body._id,
        creator: req.admin._id
    }
    const { error } = validateEditGameMode(validateBody);
    if (error) return res.status(400).send(error.details[0].message)
    console.log("error", error)
    // edit Mode can be done by the creator only
    filter = {
        _id: req.body._id,
        creator: req.admin._id
    }
    updateDoc = {
        name: req.body.name,
        updateDate: Date.now
    }
    console.log(filter);
    console.log(updateDoc);
    let mode = await GameModes.findOneAndUpdate(filter, updateDoc, { new: true })
    if (mode) {
        res.send(mode)
    } else {
        res.send("Mode is not created by the admin. Please create a new mode");
    }

});

router.post("/deleteMode", authAdmin, async (req, res) => {
    const validateBody = {
        _id: req.body._id,
        creator: req.admin._id
    }
    const { error } = validateDeleteGameMode(validateBody)
    if (error) return res.status(400).send(error.details[0].message)

    filter = {
        _id: req.body._id,
        creator: req.admin._id
    }

    let mode = await GameModes.findOneAndDelete(filter);
    if (mode) {
        res.send(mode)
    } else {
        res.status(400).send("Mode can't be deleted.")
    }
});

module.exports = router;