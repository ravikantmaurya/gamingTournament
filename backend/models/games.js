const Joi = require('joi');
const mongoose = require('mongoose');
const { categorySchema } = require('./category');

const Game = mongoose.model('Games', new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 255
  },
  category: {
    type: categorySchema,
    required: true
  },
  numberInStock: {
    type: Number,
    required: true,
    min: 0,
    max: 255
  },
  dailyRentalRate: {
    type: Number,
    required: true,
    min: 0,
    max: 255
  }
}));

function validateGame(game) {
  const schema = {
    title: Joi.string().min(5).max(50).required(),
    gameId: Joi.objectId().required(),
    numberInStock: Joi.number().min(0).required(),
    dailyRentalRate: Joi.number().min(0).required()
  };

  return Joi.validate(game, schema);
}

exports.Game = Game;
exports.validate = validateGame;