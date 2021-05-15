const authAdmin = require("../middleware/admin");
const Joi = require('joi');
const bcrypt = require("bcryptjs");
const _ = require("lodash");
const { Admin, validate, validatesignupOtp, validateforgotOtp, validateforgotOtpRequest, validateupdateProfile } = require("../models/admin");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  res.send("Hello Admins");
});

router.get("/me", authAdmin, async (req, res) => {
  const admin = await Admin.findById(req.admin._id).select("-password");
  //res.send("Me details");
  res.send(admin);
});

router.post('/', async (req, res) => {
  const { error } = validateAdmin(req.body);
  console.log("error", error)
  if (error) return res.status(400).send(error.details[0].message);

  let admin = await Admin.findOne({ email: req.body.email });
  console.log("admin", admin)
  if (!admin) {
    let contextField = {
      key: "invalid",
      vaule: true
    }
    const errorField = {
      "message": "Invalid email or password.",
      "field": contextField
    }
    return res.status(400).send(errorField);
  }

  const validPassword = await bcrypt.compare(req.body.password, admin.password);
  if (!validPassword) {
    let contextField = {
      key: "invalid",
      vaule: true
    }
    const errorField = {
      "message": "Invalid email or password.",
      "field": contextField
    }
    return res.status(400).send(errorField);
  }

  const token = admin.generateAuthToken();
  console.log("tokken", token)
  res.send(token);
});

router.post("/getOtp", async (req, res) => {
  //console.log("req.body", req.body)
  const { error } = validate(req.body);
  let admin;
  if (error) return res.status(400).send(error.details[0].message);

  // If admin is registered,has otp and not used earlier
  if (req.body.issignUpOtpUsed === false) {
    admin = await Admin.findOne({ phone: req.body.phone, issignUpOtpUsed: false });
  }

  if (admin) {
    const token = admin.generateAuthToken();
    res
      .header("x-auth-token", token)
      // .send(_.pick(admin, ["_id", "name", "email", "phone", "signUpOtp", "signUpOtpExp", "isOtp", "isOtpUsed"]));
      .send(admin);
  }
  else {
    const otp = _.random(100000, 999999)
    console.log(otp)
    if (req.body.issignUpOtpUsed === false) {
      // Later check for salt for otp option for both condition
      // Working with passwords need to check for otp version
      //const salt = await bcrypt.genSalt(10);
      //admin.signUpOtp = await bcrypt.hash(admin.signUpOtp, salt);
      req.body.signUpOtp = otp
      req.body.signUpOtpExp = Date.now()
      //req.body.issignUpOtpUsed = false

      //findAndUpdateAdmin
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

    // If admin is registered, generating Otp again for signup and forgot otp!
    admin = await Admin.findOneAndUpdate(filter, updateDoc, { new: true })
    if (admin) {
      console.log("updated admin with otp", admin)

    } else {
      // new admin is registering...
      console.log("new admin is registering");
      console.log("req.body", req.body)
      const addAdmin = {
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
      admin = new Admin(addAdmin);
      await admin.save();
    }
    const token = admin.generateAuthToken();
    res
      .header("x-auth-token", token)
      .send(admin);
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

  let admin = await Admin.findOneAndUpdate(filter, updateDoc, { new: true });
  if (admin) {
    const token = admin.generateAuthToken();
    res
      .header("x-auth-token", token)
      .send(admin);
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

  let admin = await Admin.findOneAndUpdate(filter, updateDoc, { new: true });
  if (admin) {
    const token = admin.generateAuthToken();
    res
      .header("x-auth-token", token)
      .send(admin);
  }
  else return res.status(400).send("Otp Already being used, Wrong Otp Entered or Otp is expired.");
})

router.post("/forgotOtp", async (req, res) => {
  //console.log("req.body", req.body)
  const { error } = validateforgotOtpRequest(req.body);
  let admin;
  if (error) return res.status(400).send(error.details[0].message);

  // If admin is registered,has otp and not used earlier
  if (req.body.isfpOtpUsed === false) {
    admin = await Admin.findOne({ phone: req.body.phone, isfpOtpUsed: false });
  }

  if (admin) {
    const token = admin.generateAuthToken();
    res
      .header("x-auth-token", token)
      // .send(_.pick(admin, ["_id", "name", "email", "phone", "signUpOtp", "signUpOtpExp", "isOtp", "isOtpUsed"]));
      .send(admin);
  }
  else {
    const otp = _.random(100000, 999999)
    let filter;
    let updateDoc;
    if (req.body.isfpOtpUsed === false) {
      req.body.fpOtp = otp
      req.body.fpOtpExp = Date.now()
      req.body.isfpOtpUsed = false

      //findAndUpdateAdmin
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
    // If admin is registered, generating Otp again for signup and forgot otp!
    admin = await Admin.findOneAndUpdate(filter, updateDoc, { new: true })
    console.log("admin", admin)
    if (admin) {
      console.log("updated admin with otp", admin)

    } else {
      // Admin is not registered with the number
      return res.status(400).send("You are not registered admin. Please register!");
    }
    const token = admin.generateAuthToken();
    res
      .header("x-auth-token", token)
      .send(admin);
  }
})


router.post("/register", async (req, res) => {
  //console.log("register req", req)
  const { error } = validate(req.body);

  //errorField[error.details[0].context.key] = error.details[0].message;
  if (error) {
    const errorField = {
      "message": error.details[0].message,
      "field": error.details[0].context
    }
    return res.status(400).send(errorField);
  }

  //const query = Admin.where({})
  let admin = await Admin.findOne({ email: req.body.email });
  if (admin) {
    let contextField = {
      key: "registered",
      vaule: true
    }
    const errorField = {
      "message": "Admin already registered.",
      "field": contextField
    }
    return res.status(400).send(errorField);
  }

  admin = new Admin(_.pick(req.body, ["name", "email", "password"]));
  const salt = await bcrypt.genSalt(10);
  admin.password = await bcrypt.hash(admin.password, salt);
  await admin.save();

  const token = admin.generateAuthToken();
  console.log("token", token)
  res
    .header("x-auth-token", token)
    .header("access-control-expose-headers", "x-auth-token")
    .send(_.pick(admin, ["_id", "name", "email", "phone"]));
});

router.post("/updateProfile", authAdmin, async (req, res) => {
  const { error } = validateupdateProfile(req.body);
  if (error) return res.status(400).send(error.details[0].message)
  console.log("req.admin", req.admin);
  console.log("req.body", req.body);
  filter = {
    _id: req.admin._id
  }

  updateDoc = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone
  }
  console.log("filter", filter)
  console.log("updateDoc", updateDoc)
  const admin = await Admin.findOneAndUpdate(filter, updateDoc, { new: true }).select("-password")
  if (admin) {
    const token = admin.generateAuthToken()
    res
      .header("x-auth-token", token)
      .send(admin);
  } else {
    res.status(400).send("Invalid request")
  }


});

function validateAdmin(req) {
  const schema = {
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required()
  };

  return Joi.validate(req, schema);
}


module.exports = router;
