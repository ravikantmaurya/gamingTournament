const Joi = require('joi');
const mongoose = require('mongoose');

const Reward = mongoose.model('Rewards', new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50
  },
  isGold: {
    type: Boolean,
    default: false
  }
}));

function validateReward(reward) {
  const schema = {
    name: Joi.string().min(5).max(50).required(),
    isGold: Joi.boolean()
  };

  return Joi.validate(reward, schema);
}

exports.Reward = Reward;
exports.validate = validateReward;