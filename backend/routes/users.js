const auth = require("../middleware/auth");
const bcrypt = require("bcryptjs");
const _ = require("lodash");
const { User, validate, validatesignupOtp, validateforgotOtp, validateforgotOtpRequest, validateupdateProfile } = require("../models/user");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  res.send("Hello Users");
});

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  //res.send("Me details");
  res.send(user);
});

router.post("/getOtp", async (req, res) => {
  //console.log("req.body", req.body)
  const { error } = validate(req.body);
  let user;
  if (error) return res.status(400).send(error.details[0].message);

  // If user is registered,has otp and not used earlier
  if (req.body.issignUpOtpUsed === false) {
    user = await User.findOne({ phone: req.body.phone, issignUpOtpUsed: false });
  }

  if (user) {
    const token = user.generateAuthToken();
    res
      .header("x-auth-token", token)
      // .send(_.pick(user, ["_id", "name", "email", "phone", "signUpOtp", "signUpOtpExp", "isOtp", "isOtpUsed"]));
      .send(user);
  }
  else {
    const otp = _.random(100000, 999999)
    console.log(otp)
    if (req.body.issignUpOtpUsed === false) {
      // Later check for salt for otp option for both condition
      // Working with passwords need to check for otp version
      //const salt = await bcrypt.genSalt(10);
      //user.signUpOtp = await bcrypt.hash(user.signUpOtp, salt);
      req.body.signUpOtp = otp
      req.body.signUpOtpExp = Date.now()
      //req.body.issignUpOtpUsed = false

      //findAndUpdateUser
      filter = {
        phone: req.body.phone,
        isOtp: true,
        issignUpOtpUsed: true
      }
      updateDoc = {
        signUpOtp: otp,
        signUpOtpExp: Date.now(),
        issignUpOtpUsed: false
      }
    }

    // If user is registered, generating Otp again for signup and forgot otp!
    user = await User.findOneAndUpdate(filter, updateDoc, { new: true })
    if (user) {
      console.log("updated user with otp", user)

    } else {
      // new User is registering...
      console.log("new user is registering");
      console.log("req.body", req.body)
      const addUser = {
        phone: req.body.phone,
        isOtp: req.body.isOtp,
        signUpOtp: otp,
        signUpOtpExp: Date.now(),
        issignUpOtpUsed: req.body.issignUpOtpUsed,
        fpOtp: otp,
        fpOtpExp: Date.now(),
        status: true,
        isfpOtpUsed: false
      }
      user = new User(addUser);
      await user.save();
    }
    const token = user.generateAuthToken();
    res
      .header("x-auth-token", token)
      .send(user);
  }
})

router.post("/validatesignupOtp", async (req, res) => {
  const { error } = validatesignupOtp(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  //Validate expiry date with signUpOtpExp for 30 mins

  if (req.body.issignUpOtpUsed === false) {
    filter = {
      phone: req.body.phone,
      signUpOtp: req.body.signUpOtp,
      isOtp: true,
      issignUpOtpUsed: false
    }
    updateDoc = { issignUpOtpUsed: true, lastLoggedIn: Date.now() }
  }

  let user = await User.findOneAndUpdate(filter, updateDoc, { new: true });
  if (user) {
    const token = user.generateAuthToken();
    res
      .header("x-auth-token", token)
      .send(user);
  }
  else return res.status(400).send("Otp Already being used, Wrong Otp Entered or Otp is expired.");
})

router.post("/validateforgotOtp", async (req, res) => {
  const { error } = validateforgotOtp(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  //Validate expiry date with forgotOtpExp for 30 mins


  if (req.body.isfpOtpUsed === false) {
    filter = {
      phone: req.body.phone,
      fpOtp: req.body.fpOtp,
      isOtp: true,
      isfpOtpUsed: false
    }
    updateDoc = { isfpOtpUsed: true, lastLoggedIn: Date.now() }
  }

  let user = await User.findOneAndUpdate(filter, updateDoc, { new: true });
  if (user) {
    const token = user.generateAuthToken();
    res
      .header("x-auth-token", token)
      .send(user);
  }
  else return res.status(400).send("Otp Already being used, Wrong Otp Entered or Otp is expired.");
})

router.post("/forgotOtp", async (req, res) => {
  //console.log("req.body", req.body)
  const { error } = validateforgotOtpRequest(req.body);
  let user;
  if (error) return res.status(400).send(error.details[0].message);

  // If user is registered,has otp and not used earlier
  if (req.body.isfpOtpUsed === false) {
    user = await User.findOne({ phone: req.body.phone, isfpOtpUsed: false });
  }

  if (user) {
    const token = user.generateAuthToken();
    res
      .header("x-auth-token", token)
      // .send(_.pick(user, ["_id", "name", "email", "phone", "signUpOtp", "signUpOtpExp", "isOtp", "isOtpUsed"]));
      .send(user);
  }
  else {
    const otp = _.random(100000, 999999)
    let filter;
    let updateDoc;
    if (req.body.isfpOtpUsed === false) {
      req.body.fpOtp = otp
      req.body.fpOtpExp = Date.now()
      req.body.isfpOtpUsed = false

      //findAndUpdateUser
      filter = {
        phone: req.body.phone,
        isOtp: true,
        isfpOtpUsed: true
      }
      updateDoc = {
        fpOtp: otp,
        fpOtpExp: Date.now(),
        isfpOtpUsed: false
      }
    }

    console.log("filter", filter)
    console.log("updateDoc", updateDoc)
    // If user is registered, generating Otp again for signup and forgot otp!
    user = await User.findOneAndUpdate(filter, updateDoc, { new: true })
    console.log("user", user)
    if (user) {
      console.log("updated user with otp", user)

    } else {
      // User is not registered with the number
      return res.status(400).send("You are not registered user. Please register!");
    }
    const token = user.generateAuthToken();
    res
      .header("x-auth-token", token)
      .send(user);
  }
})


router.post("/register", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //const query = User.where({})
  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered.");

  user = new User(_.pick(req.body, ["name", "email", "password"]));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

  const token = user.generateAuthToken();
  res
    .header("x-auth-token", token)
    .send(_.pick(user, ["_id", "name", "email", "phone"]));
});

router.post("/updateProfile", auth, async (req, res) => {
  const { error } = validateupdateProfile(req.body);
  if (error) return res.status(400).send(error.details[0].message)
  console.log("req.user", req.user);
  console.log("req.body", req.body);
  filter = {
    _id: req.user._id
  }

  updateDoc = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone
  }
  console.log("filter", filter)
  console.log("updateDoc", updateDoc)
  const user = await User.findOneAndUpdate(filter, updateDoc, { new: true }).select("-password")
  if (user) {
    const token = user.generateAuthToken()
    res
      .header("x-auth-token", token)
      .send(user);
  } else {
    res.status(400).send("Invalid request")
  }


});


module.exports = router;
