const Contact = require("../models/contact.model");

const saveContact = async (req, res) => {
  const { name, email, message, phone } = req.body;

  try {
    const newContact = new Contact({ name, email, message, phone });
    await newContact.save();
    res.status(200).json({
      message: "Contact information submitted successfully.",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error: "An error occurred while saving the contact information.",
    });
  }
};

const getContact = async (req, res) => {
  try {
    let filter = {};
    if (req.query.name) {
      filter.name = { $regex: req.query.name, $options: "i" };
    }
    if (req.query.email) {
      filter.email = { $regex: req.query.email, $options: "i" };
    }
    const contacts = await Contact.find(filter);
    res.status(200).json({ contacts });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error: "An error occurred while retrieving the contact information.",
    });
  }
};

const deleteContact = async (req, res) => {
  try {
    const filter = {};
    if (req.query.name) {
      filter.name = { $regex: req.query.name, $options: "i" };
    }
    if (req.query.email) {
      filter.email = { $regex: req.query.email, $options: "i" };
    }

    const result = await Contact.deleteMany(filter);
    res.status(200).json({
      message: `${result.deletedCount} contact(s) deleted.`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "An error occurred while deleting the contact information.",
    });
  }
};

module.exports = {
  saveContact,
  getContact,
  deleteContact,
};
