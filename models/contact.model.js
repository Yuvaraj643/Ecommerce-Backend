const mongoose = require("mongoose");

const ContactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  phone: String,
  date: { type: Date, default: Date.now },
  created_at: { type: Date, default: Date.now },
});

ContactSchema.pre("save", function (next) {
  if (this.isModified() && !this.isNew) {
    this.created_at = Date.now();
  }
  next();
});

const Contact = mongoose.model("Contact", ContactSchema);

module.exports = Contact;
