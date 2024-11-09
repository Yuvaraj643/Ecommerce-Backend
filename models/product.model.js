const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  prd_id: {
    type: String,
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0, // Ensure price cannot be negative
  },
  specialPrice: {
    type: Number,
    min: 0, // Ensure special price cannot be negative
  },
  discount: {
    type: Number,
    min: 0,
    max: 100,
  },
  stock: {
    type: Number,
    required: true,
    min: 0, // Ensure stock cannot be negative
  },
  thumbnail: {
    type: String,
    trim: true,
  },
  images: [
    {
      type: String,
      trim: true,
    },
  ],
  tags: [
    {
      type: String,
      trim: true,
    },
  ],
  brand: {
    type: String,
    trim: true,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      comment: {
        type: String,
        trim: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware to auto-generate prd_id
ProductSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified() || this.isModified('discount')) {
    console.log('New product or price/discount modified');
    if (this.discount) {
      const discountAmount = (this.discount / 100) * this.price;
      this.specialPrice = this.price - discountAmount;
      console.log(`Discount: ${this.discount}%, Discount Amount: ${discountAmount}, Calculated specialPrice: ${this.specialPrice}`);
    } else {
      this.specialPrice = null;
      console.log('No discount provided, specialPrice set to null');
    }
  }

  if (this.isNew) {
    try {
      const count = await mongoose.model("product").countDocuments();
      this.prd_id = `prd_${(count + 1).toString().padStart(2, '0')}`;
    } catch (error) {
      return next(error);
    }
  }
  
  // Update updatedAt if modified
  if (this.isModified() && !this.isNew) {
    this.updatedAt = Date.now();
  }

  next();
});

module.exports = mongoose.model("product", ProductSchema);
