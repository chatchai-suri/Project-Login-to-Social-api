import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middlewares/error.middleware.js";

const app = express();

app.use(helmet()); // Use Helmet to help secure Express apps with various HTTP headers
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
); // Enable CORS for all routes and allow credentials (cookies, authorization headers, etc.)

app.use(express.json()); // Parse incoming JSON requests and put the parsed data in req.body

app.use(cookieParser()); // Parse Cookie header and populate req.cookies with an object keyed by the cookie names, req.cookies

// API routes
// ... your route handlers here ...

app.use((req, res) => {
  res.status(404).json({ message: `path not found ${req.method} ${req.url}` }); // Handle 404 errors for undefined routes
});
app.use(errorMiddleware); // Error handling middleware

export default app;