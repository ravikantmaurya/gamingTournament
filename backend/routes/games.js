const { Game, validate } = require("../models/games");
const { Category } = require("../models/category");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validateObjectId = require("../middleware/validateObjectId");
const moment = require("moment");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const games = await Game.find()
    .select("-__v")
    .sort("name");
  res.send(games);
});

router.post("/", [auth], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const category = await Category.findById(req.body.categoryId);
  if (!category) return res.status(400).send("Invalid category.");

  const game = new Game({
    title: req.body.title,
    category: {
      _id: category._id,
      name: category.name
    },
    numberInStock: req.body.numberInStock,
    dailyRentalRate: req.body.dailyRentalRate,
    publishDate: moment().toJSON()
  });
  await game.save();

  res.send(game);
});

router.put("/:id", [auth], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const category = await Category.findById(req.body.categoryId);
  if (!category) return res.status(400).send("Invalid category.");

  const game = await Game.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      category: {
        _id: category._id,
        name: category.name
      },
      numberInStock: req.body.numberInStock,
      dailyRentalRate: req.body.dailyRentalRate
    },
    { new: true }
  );

  if (!game)
    return res.status(404).send("The game with the given ID was not found.");

  res.send(game);
});

router.delete("/:id", [auth, admin], async (req, res) => {
  const game = await Game.findByIdAndRemove(req.params.id);

  if (!game)
    return res.status(404).send("The game with the given ID was not found.");

  res.send(game);
});

router.get("/:id", validateObjectId, async (req, res) => {
  const game = await Game.findById(req.params.id).select("-__v");

  if (!game)
    return res.status(404).send("The game with the given ID was not found.");

  res.send(game);
});

module.exports = router;
