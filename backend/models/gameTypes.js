const Joi = require("joi");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const gameTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 2,
        maxlength: 255,
        required: true
    },
    gameModeIds: [{ type: mongoose.Schema.ObjectId, ref: 'gameModes' }],
    status: { type: Boolean, default: true },
    creator: { type: mongoose.Schema.ObjectId, ref: 'Admin' },
    createdDate: { type: Date, default: Date.now },
    updatedDate: { type: Date }
});

const GameTypes = mongoose.model('gameTypes', gameTypeSchema)

function validateId(validateId) {
    const schema = {
        creator: Joi.objectId().required()
    }
    return Joi.validate(validateId, schema)
}

function validateTypeId(validateTypeId) {
    const schema = {
        _id: Joi.objectId().required()
    }
    return Joi.validate(validateTypeId, schema)
}

function validateNewGameType(validateNewGameType) {
    const schema = {
        name: Joi.string()
            .min(2)
            .required(),
        creator: Joi.objectId().required(),
        gameModeIds: Joi.array().required()
    }
    return Joi.validate(validateNewGameType, schema)
}


function validateEditGameType(validateEditGameType) {
    const schema = {
        name: Joi.string()
            .min(2)
            .required(),
        _id: Joi.objectId().required(),
        creator: Joi.objectId().required(),
        gameModeIds: Joi.array().required()
    }
    return Joi.validate(validateEditGameType, schema)
}

function validateDeleteGameType(validateDeleteGameType) {
    const schema = {
        creator: Joi.objectId().required(),
        _id: Joi.objectId().required()
    }
    return Joi.validate(validateDeleteGameType, schema)
}

exports.GameTypes = GameTypes;
exports.ObjectId = ObjectId;
exports.validateId = validateId;
exports.validateTypeId = validateTypeId;
exports.validateNewGameType = validateNewGameType;
exports.validateEditGameType = validateEditGameType;
exports.validateDeleteGameType = validateDeleteGameType;