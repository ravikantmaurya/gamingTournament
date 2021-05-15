const Joi = require("joi");
const mongoose = require("mongoose");

const gameModeSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 2,
        maxlength: 255,
        required: true
    },
    status: { type: Boolean, default: true },
    creator: { type: mongoose.Schema.ObjectId, ref: 'Admin' },
    createdDate: { type: Date, default: Date.now },
    updatedDate: { type: Date }
});

const GameModes = mongoose.model('gameModes', gameModeSchema)

function validateId(validateId) {
    const schema = {
        creator: Joi.objectId().required()
    }
    return Joi.validate(validateId, schema)
}

function validateModeId(validateModeId) {
    const schema = {
        _id: Joi.objectId().required()
    }
    return Joi.validate(validateModeId, schema)
}

function validateNewGameMode(validateNewGameMode) {
    const schema = {
        name: Joi.string()
            .min(2)
            .required(),
        creator: Joi.objectId().required()
    }
    return Joi.validate(validateNewGameMode, schema)
}


function validateEditGameMode(validateEditGameMode) {
    const schema = {
        name: Joi.string()
            .min(2)
            .required(),
        _id: Joi.objectId().required(),
        creator: Joi.objectId().required()
    }
    return Joi.validate(validateEditGameMode, schema)
}

function validateDeleteGameMode(validateDeleteGameMode) {
    const schema = {
        creator: Joi.objectId().required(),
        _id: Joi.objectId().required()
    }
    return Joi.validate(validateDeleteGameMode, schema)
}

exports.GameModes = GameModes;
exports.validateId = validateId;
exports.validateModeId = validateModeId;
exports.validateNewGameMode = validateNewGameMode;
exports.validateEditGameMode = validateEditGameMode;
exports.validateDeleteGameMode = validateDeleteGameMode;