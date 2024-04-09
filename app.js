const cookieParser = require("cookie-parser");
const express = require("express");
const userRoute = require("./Routes/userRoute");
const courseRoute = require("./Routes/courseRoute");
const categoryRoute = require("./Routes/categoryRoute");
const enrollmentRoute = require("./Routes/enrollmentRoute");
const { requestLogger, errorHandler } = require("./middlewares/logger");
const app = express();

//Regular middlewares
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(express.static("Public"));
app.use(cookieParser());

//Logger
app.use(requestLogger);

//Importing Routes
app.use("/user", userRoute);
app.use("/course", courseRoute);
app.use("/category", categoryRoute);
app.use("/enrollment", enrollmentRoute);

//Error handler(Logger)
app.use(errorHandler);

module.exports = app;
