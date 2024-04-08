const cookieParser = require("cookie-parser");
const express = require("express");
const upload = require("./middlewares/multer");
const userRoute = require("./Routes/userRoute");
const courseRoute = require("./Routes/courseRoute");
const categoryRoute = require("./Routes/categoryRoute");
const enrollmentRoute = require("./Routes/enrollmentRoute");
const app = express();

//Regular middlewares
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
//app.use(upload.any()); //This parse form data with no files or with file...
app.use(express.static("Public"));
app.use(cookieParser());

//Importing Routes
app.use("/user", userRoute);
app.use("/course", courseRoute);
app.use("/category", categoryRoute);
app.use("/enrollment", enrollmentRoute);

module.exports = app;
