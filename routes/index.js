// import libraries
var express = require('express');
var router = express.Router();
// import controllers
var action = require('../controllers/ActionController.js');
/* GET home page. */
router.route('/').get(action.get);

module.exports = router;
