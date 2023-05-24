const express = require("express");
const router = express.Router();
const { handleLogin, attemptLogin, attemptSignup } = require('../controllers/authController');
const { validateForm } = require('../controllers/validateForm');

router.route("/login").get(handleLogin).post(validateForm, attemptLogin);

router.post("/signup", validateForm, attemptSignup);

module.exports = router;