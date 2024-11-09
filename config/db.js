const mongoose = require("mongoose");
const db = process.env.MONGO_URI_DB;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      db,
      autoIndex: true,
    });
    console.log(`Connected to ${conn.connection.db.databaseName}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
};

module.exports = connectDB;
