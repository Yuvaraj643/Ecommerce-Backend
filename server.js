const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const routes = require("./routes/index");

dotenv.config(); // Load environment variables

const app = express();
app.use(express.json());

// CORS options
const allowedOrigins = [
  "http://localhost:5173",
  "https://sklassics.netlify.app",
  "https://ecommerce-idea-backend-rakeshkandhis-projects.vercel.app"
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(compression());

// Database connection
connectDB();

// Routes
app.use("/api", routes);

app.get("/", (req, res) => {
  res.status(200).json({
    status: 1000,
    message: "Server is Live",
  });
});

app.get("/api/server", (req, res) => {
  res.status(200).json({
    status: 1000,
    message: "Welcome to the Home Page",
  });
});

// Error handling middleware (Optional)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
