const express = require("express");
const { sessionMiddleware, wrap, corsConfig } = require("./controllers/serverController");
const { initializeUser, authorizeUser, addFriend, onDisconnect, dm } = require("./controllers/socketController");
const app = express();
const server = require("http").createServer(app);
const helmet = require("helmet");
const cors = require("cors");
const authRouter = require("./routers/authRouter");

app.use(helmet());
app.use(cors(corsConfig));
app.use(express.json());
app.use(sessionMiddleware);
app.use("/auth", authRouter);
app.set("trust proxy", 1);

const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  }
});

io.use(wrap(sessionMiddleware));
io.use(authorizeUser);
io.on("connect", socket => {
  initializeUser(socket);
  
  socket.on("add_friend", (friendName, callback) => {
    addFriend(socket, friendName, callback);
  });

  socket.on("dm", (message) => {
    dm(socket, message);
  });

  socket.on("disconnecting", () => {
    onDisconnect(socket);
  });
});

server.listen(4000, () => {
  console.log("Server listening on port 4000");
});