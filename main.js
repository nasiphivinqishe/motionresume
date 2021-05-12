//Imports
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 4000;

//database connection with the URL given on the .env
mongoose.connect(process.env.DB_URI, {
  useNewParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", (error) => {
  console.log(error);
});

db.once("open", () => {
  console.log("Connected to the database!");
});

//Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: "my secrete key",
    saveUninitialized: true,
    resave: false,
  })
);
app.use(express.static("public")); //tells where to render files like images used

//Set template engine
app.set("view engine", "ejs"); //used to dynamically display content

//Routes prefix
app.use("", require("./routes/routes"));

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT} `);
});
