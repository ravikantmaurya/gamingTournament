const { Reward, validate } = require("../models/rewards");
const auth = require("../middleware/auth");
const express = require("express");
const router = express.Router();

router.get("/", auth, async (req, res) => {
  const rewards = await Reward.find()
    .select("-__v")
    .sort("name");
  res.send(rewards);
});

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let reward = new Reward({
    name: req.body.name,
    isGold: req.body.isGold
  });
  reward = await reward.save();

  res.send(reward);
});

router.put("/:id", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const reward = await Reward.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      isGold: req.body.isGold
    },
    { new: true }
  );

  if (!reward)
    return res
      .status(404)
      .send("The reward with the given ID was not found.");

  res.send(reward);
});

router.delete("/:id", auth, async (req, res) => {
  const reward = await Reward.findByIdAndRemove(req.params.id);

  if (!reward)
    return res
      .status(404)
      .send("The reward with the given ID was not found.");

  res.send(reward);
});

router.get("/:id", auth, async (req, res) => {
  const reward = await Reward.findById(req.params.id).select("-__v");

  if (!reward)
    return res
      .status(404)
      .send("The reward with the given ID was not found.");

  res.send(reward);
});

module.exports = router;
