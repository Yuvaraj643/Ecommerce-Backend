const express = require("express");
const router = express.Router();
const userRoutes = require("./userRoutes");
const productRoutes = require("./productRoutes");
const contactRoutes = require("./contactRoutes");
const categoryRoutes = require("./categoryRoutes")
const cmsRoutes = require("./cmsRoutes")
const adminRoutes = require("./adminRoutes")
const cartRoutes = require("./cartRoutes")
const orderRoutes = require("./orderRoutes")

router.use("/auth", userRoutes);
router.use("/products", productRoutes);
router.use("/contact", contactRoutes);
router.use("/categories", categoryRoutes );
router.use("/admin", adminRoutes)
router.use("/cms", cmsRoutes)
router.use("/cart", cartRoutes)
router.use("/order", orderRoutes)

module.exports = router;
