const mongoose = require("mongoose");

// Define the schema for the Category model
const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true, // Ensure category names are unique
    },
    description: {
      type: String,
      trim: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    image: {
      type: String,
      trim: true,
    },
    meta: {
      title: {
        type: String,
        trim: true,
      },
      description: {
        type: String,
        trim: true,
      },
      slug: {
        type: String,
        trim: true,
        unique: true, // Ensure slugs are unique
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" }, // Automatically manage timestamps
  }
);

// Create a text index for searching by name or meta title/description
CategorySchema.index({
  name: "text",
  "meta.title": "text",
  "meta.description": "text",
});

// Create and export the model
module.exports = mongoose.model("Category", CategorySchema);
