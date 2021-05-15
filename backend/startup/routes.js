const express = require('express');
const games = require('../routes/games');
const categories = require('../routes/categories');
const rewards = require('../routes/rewards');
//const tournaments = require('../routes/tournaments');
const users = require('../routes/users');
const auth = require('../routes/auth');
const admin = require('../routes/admin');
const gameModes = require('../routes/gameModes');
const gameTypes = require('../routes/gameTypes');
//const adminAuth = require('../routes/authAdmin')
// const returns = require('../routes/returns');
const error = require('../middleware/error');
const home = require('../routes/home');

module.exports = function (app) {
  app.use(express.json());
  app.use('/api/', home);
  app.use('/api/games', games);
  app.use('/api/categories', categories);
  app.use('/api/rewards', rewards);
  //  app.use('/api/tournaments', tournaments);
  app.use('/api/users', users);
  app.use('/api/auth', auth);
  app.use('/api/admin', admin);
  app.use('/api/gameModes', gameModes);
  app.use('/api/gameTypes', gameTypes);
  app.use(error);
}