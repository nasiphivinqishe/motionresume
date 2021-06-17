//Imports
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 4000;

// const httpServer = require("http").createServer();
// const io = require("socket.io")(httpServer, {
//   cors: {
//     origin: "http://localhost:5000",
//   },
// });
// app.set("socketio", io);

// io.on("connection", (socket) => {
//   socket.on("interview_received", (data) => {
//     io.emit(data.userId, { jobId: "jobId", notificationType: "got_interview" });
//   });
// });
// socket.on("accepted", (data) => {
//   io.emit(data.userId, {
//     jobId: "sdee",
//     notificationType: "offered_job",
//   });
// });

// io.on("connection", (socket) => {
//   socket.on("rejected", (data) => {
//     io.emit(data.userId, {
//       jobId: "sdee",
//       notificationType: "not_offered_job",
//     });
//   });
// });
// socket.on("interview_answered", (data) => {
//   io.emit(data.userId, {
//     jobId: "sdee",
//     notificationType: "answered_interview_questions",
//   });
// });
// socket.on("user_applied_for_job", (data) => {
//   io.emit(data.userId, {
//     jobId: "sdee",
//     notificationType: "applied_users",
//   });
// });

// socket.on("global_notifications", (data) => {
//   io.emit("global_notif", {
//     jobId: "users",
//     notificationType: "globalnot",
//   });
// });


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
// app.use(express.urlencoded({  }));
// app.use(express.json());
app.use(express.json({limit: '500mb'}));
app.use(express.urlencoded({limit: '500mb', extended: true}));

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
