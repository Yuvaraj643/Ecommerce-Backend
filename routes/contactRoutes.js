const express = require("express");
const router = express.Router();
const {
  saveContact,
  getContact,
  deleteContact,
} = require("../controllers/contactControllers");

router.post("/createContact", saveContact);
router.get("/getContact", getContact);
router.delete("/deleteContact/:id", deleteContact);

module.exports = router;
