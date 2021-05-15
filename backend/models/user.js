const config = require("config");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 50
  },
  email: {
    type: String,
    minlength: 5,
    maxlength: 255
  },
  password: {
    type: String,
    minlength: 5,
    maxlength: 1024
  },
  phone: {
    type: String,
    minlength: 10,
    maxlength: 13
  },
  signUpOtp: {
    type: String,
    minlength: 6
  },
  signUpOtpExp: {
    type: Date
  },
  fpOtp: {
    type: String,
    // minlength: 6
  },
  fpOtpExp: {
    type: Date
  },
  status: Boolean,
  isOtp: Boolean,
  issignUpOtpUsed: Boolean,
  isfpOtpUsed: Boolean,
  isAdmin: Boolean,
  OtpCount: String,
  PasswordCount: String,
  lastLoggedIn: Date,
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      name: this.name,
      email: this.email,
      password: this.password,
      phone: this.phone,
      signUpOtp: this.signUpOtp,
      signUpOtpExp: this.signUpOtpExp,
      fpOtp: this.fpOtp,
      fpOtpExp: this.fpOtpExp,
      status: this.status,
      isOtp: Boolean,
      issignUpOtpUsed: Boolean,
      isfpOtpUsed: Boolean,
      isAdmin: Boolean,
      OtpCount: String,
      PasswordCount: String,
      lastLoggedIn: Date,
    },
    config.get("jwtPrivateKey")
  );
  return token;
};

const User = mongoose.model("User", userSchema);

function validateUser(user) {
  if (user.isOtp) {
    if (user.issignUpOtpUsed === false) {
      console.log("in !user.issignUpOtpUsed")
      const schema = {
        phone: Joi.string()
          .min(10)
          .max(13)
          .required(),
        isOtp: Joi.boolean().valid(true),
        issignUpOtpUsed: Joi.boolean().valid(false).required()
      }
      return Joi.validate(user, schema);
    } else {
      console.log("in user.issignUpOtpUsed")
      const schema = {
        phone: Joi.string()
          .min(10)
          .max(13)
          .required(),
        isOtp: Joi.boolean().valid(true),
        issignUpOtpUsed: Joi.boolean().valid(false).required()
      }
      return Joi.validate(user, schema);
    }
  }
  if (!user.isOtp) {
    const schema = {
      name: Joi.string()
        .min(2)
        .max(50)
        .required(),
      email: Joi.string()
        .min(5)
        .max(255)
        .required()
        .email(),
      password: Joi.string()
        .min(5)
        .max(1024)
        .required(),
      phone: Joi.string()
        .min(10)
        .max(13),
      status: Joi.boolean().valid(true)
    };
    return Joi.validate(user, schema);
  }

}

function validateforgotOtpRequest(user) {
  if (user.isfpOtpUsed === false) {
    const schema = {
      phone: Joi.string()
        .min(10)
        .max(13)
        .required(),
      isOtp: Joi.boolean().valid(true),
      isfpOtpUsed: Joi.boolean().valid(false).required()
    }
    return Joi.validate(user, schema);
  } else {
    const schema = {
      phone: Joi.string()
        .min(10)
        .max(13)
        .required(),
      isOtp: Joi.boolean().valid(true),
      isfpOtpUsed: Joi.boolean().valid(false).required()
    }
    return Joi.validate(user, schema);
  }
}


function validatesignupOtp(validatesignupOtp) {
  const schema = {
    phone: Joi.string()
      .min(10)
      .max(13)
      .required(),
    isOtp: Joi.boolean().valid(true),
    signUpOtp: Joi.string()
      .min(6)
      .required(),
    issignUpOtpUsed: Joi.boolean().valid(false).required()
  };
  return Joi.validate(validatesignupOtp, schema);
}

function validateforgotOtp(validateOtp) {
  const schema = {
    phone: Joi.string()
      .min(10)
      .max(13)
      .required(),
    isOtp: Joi.boolean().valid(true),
    fpOtp: Joi.string()
      .min(6)
      .required(),
    isfpOtpUsed: Joi.boolean().valid(false).required()
  };
  return Joi.validate(validateOtp, schema);
}

function validateupdateProfile(user) {
  const schema = {
    name: Joi.string(),
    email: Joi.string()
      .min(5)
      .max(255)
      .email(),
    phone: Joi.string()
      .min(10)
      .max(13)
  };
  return Joi.validate(user, schema);
}

exports.User = User;
exports.validate = validateUser;
exports.validatesignupOtp = validatesignupOtp;
exports.validateforgotOtp = validateforgotOtp;
exports.validateforgotOtpRequest = validateforgotOtpRequest;
exports.validateupdateProfile = validateupdateProfile;