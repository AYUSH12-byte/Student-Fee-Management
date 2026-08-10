const express = require("express");

const {
  register,
  login,
  getUsers,
  deleteUser,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
//router.get("/users", getUsers);
//router.delete("/users/:id", deleteUser);

module.exports = router;