const pool = require("../db");
const bcrypt = require("bcrypt");
const {v4: uuidv4} = require("uuid");

module.exports.handleLogin = (req, res) => {
  if (req.session.user && req.session.user.username) {
    res.json({ loggedIn: true, username: req.session.user.username });
  } else {
    res.json({ loggedIn: false });
  }
}

module.exports.attemptLogin = async (req, res) => {
  const potentialLogin = await pool.query(
    "SELECT id, username, passhash, userid FROM users u WHERE u.username=$1",
    [req.body.username]
  );

  if (potentialLogin.rowCount > 0) {
    req.session.user = {
      username: req.body.username,
      id: potentialLogin.rows[0].id,
      userid: potentialLogin.rows[0].userid
    }

    res.json({ loggedIn: true, username: req.body.username });
  } else {
    console.log("not good");
    res.json({ loggedIn: false, status: "Wrong username or password!" });
  }
}

module.exports.attemptSignup = async (req, res) => {
  const existingUser = await pool.query(
    "SELECT username from users WHERE username=$1",
    [req.body.username]
  );

  if (existingUser.rowCount === 0) {
    const hashedPass = await bcrypt.hash(req.body.password, 10);

    const newUserQuery = await pool.query(
      "INSERT INTO users(username, passhash, userid, connected) values($1,$2,$3,$4) RETURNING id, username, userid, connected",
      [req.body.username, hashedPass, uuidv4(), true]
    );

    req.session.user = {
      username: req.body.username,
      id: newUserQuery.rows[0].id,
      userid: newUserQuery.rows[0].userid
    };

    res.json({ loggedIn: true, username: req.body.username });
  } else {
    res.json({ loggedIn: false, status: "Username taken" });
  }
}