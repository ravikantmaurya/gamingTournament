
const express = require("express");
const router = express.Router();
const authAdmin = require("../middleware/admin");
const { GameTypes, ObjectId, validateId, validateTypeId, validateNewGameType, validateEditGameType, validateDeleteGameType } = require("../models/gameTypes");


router.get('/allType', async (req, res) => {
    //const
    let type = await GameTypes.aggregate([{ $lookup: { from: "gamemodes", localField: "gameModeIds", foreignField: "_id", as: "gameModeList" } }]);
    if (type) {
        res.send(type)
    } else {
        res.status(404).send("There aren't any game types. Please create one.")
    }
});

router.get('/bytypeId', async (req, res) => {
    console.log("req", req.query._id)
    const validateBody = {
        _id: req.query._id
    }
    const { error } = validateTypeId(validateBody)
    if (error) return res.status(400).send(error.details[0].message);
    //console.log()
    filter = { _id: ObjectId(req.query._id) }
    //let types = await GameTypes.aggregate([{ $lookup: { from: "gameModes", let: { gameModeIds: "$_id", id: req.query._id }, pipeline: [{ $match: { $expr: { $and: [{ $eq: ["$_id", "$$gameModeIds"] }, { $eq: ["$_id", req.query._id] }] } } }], as: "gameModeList" } }]);
    let types = await GameTypes.aggregate([{ $match: filter }, { $lookup: { from: "gamemodes", localField: "gameModeIds", foreignField: "_id", as: "gameModeList" } }]);
    if (types) {
        res.send(types)
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

    filter = { creator: ObjectId(req.admin._id) }
    //let types = await GameTypes.aggregate([{ $lookup: { from: "gameModes", let: { gameModeIds: "$_id", id: req.query._id }, pipeline: [{ $match: { $expr: { $and: [{ $eq: ["$_id", "$$gameModeIds"] }, { $eq: ["$_id", req.query._id] }] } } }], as: "gameModeList" } }]);
    let types = await GameTypes.aggregate([{ $match: filter }, { $lookup: { from: "gamemodes", localField: "gameModeIds", foreignField: "_id", as: "gameModeList" } }]);
    if (types) {
        res.send(types)
    } else {
        res.status(404).send("Types are not created by the creator");
    }
});

//Needs to be changed accordingly

router.post('/addNew', authAdmin, async (req, res) => {
    const validateBody = {
        name: req.body.name,
        creator: req.admin._id,
        gameModeIds: req.body.gameModeIds
    }
    const { error } = validateNewGameType(validateBody)
    if (error) return res.status(400).send(error.details[0].message)
    console.log('req', req.body)
    let mode = await GameTypes.findOne({ name: req.body.name });
    if (mode) return res.status(400).send("Game Type is already exists with the name");

    const addnewType = {
        name: req.body.name,
        creator: req.admin._id,
        gameModeIds: req.body.gameModeIds
    }
    newGameType = new GameTypes(addnewType)
    await newGameType.save();
    res.send(newGameType);
});

router.post("/editGameType", authAdmin, async (req, res) => {
    const validateBody = {
        name: req.body.name,
        _id: req.body._id,
        creator: req.admin._id,
        gameModeIds: req.body.gameModeIds
    }
    const { error } = validateEditGameType(validateBody);
    if (error) return res.status(400).send(error.details[0].message)
    console.log("error", error)
    // edit Mode can be done by the creator only
    filter = {
        _id: req.body._id,
        creator: req.admin._id
    }
    updateDoc = {
        name: req.body.name,
        gameModeIds: req.body.gameModeIds,
        updateDate: Date.now
    }
    console.log(filter);
    console.log(updateDoc);
    let type = await GameTypes.findOneAndUpdate(filter, updateDoc, { new: true })
    if (type) {
        res.send(type)
    } else {
        res.send("Type is not created by the admin. Please create a new type");
    }

});

router.delete("/deleteType", authAdmin, async (req, res) => {
    const validateBody = {
        _id: req.body._id,
        creator: req.admin._id
    }
    const { error } = validateDeleteGameType(validateBody)
    if (error) return res.status(400).send(error.details[0].message)

    filter = {
        _id: req.body._id,
        creator: req.admin._id
    }

    let type = await GameTypes.findOneAndDelete(filter);
    if (type) {
        res.send(type)
    } else {
        res.status(400).send("Type can't be deleted.")
    }
});

module.exports = router;