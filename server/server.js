import express from "express";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import sensorRoutes from "./routes/sensorRoutes.js";
import lampRoutes from "./routes/lampRoutes.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// middleware
app.use(cors());
app.use(express.json());

// inject io ke request biar bisa dipakai di route
app.use((req, res, next) => {
  req.io = io;
  next();
});

// routes
app.use("/api/sensor", sensorRoutes);
app.use("/api/sensors", sensorRoutes);
app.use("/api/lamp", lampRoutes)

// koneksi database
mongoose
  .connect("mongodb://127.0.0.1:27017/smart_home")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// socket.io connect
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("disconnect", () => console.log("Client disconnected:", socket.id));
});

// start server
const PORT = 3000;
server.listen(PORT, () => {
  console.log("Server running on http://localhost:" + PORT);
});
