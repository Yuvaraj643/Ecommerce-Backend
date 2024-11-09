const express = require("express");
const router = express.Router();
const userRoutes = require("./userRoutes");
const productRoutes = require("./productRoutes");
const contactRoutes = require("./contactRoutes");
const categoryRoutes = require("./categoryRoutes");
const cmsRoutes = require("./cmsRoutes");
const adminRoutes = require("./adminRoutes");

router.use("/user", userRoutes);
router.use("/products", productRoutes);
router.use("/contact", contactRoutes);
router.use("/categories", categoryRoutes);
router.use("/admin", adminRoutes);
router.use("/cms", cmsRoutes);

module.exports = router;
