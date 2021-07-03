//Imports
require("dotenv").config();

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

const mongoose = require("mongoose");
const session = require("express-session");

const { Server } = require("socket.io");
const io = new Server(server);

const PORT = process.env.PORT || 4000;

// const httpServer = require("http").createServer();
// const io = require("socket.io")(httpServer, {
//   cors: {
//     origin: "http://localhost:5000",
//   },
// });
// app.set("socketio", io);

io.on("connection", (socket) => {
  console.log("some client connected")



  socket.on("messages", (data) => {
    console.log(data)
    io.emit(data.receiver, { message: data.message, sender: data.sender, receiver: data.receiver })
  })
});


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
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));

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

server.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT} `);
});
