// dashboard.js
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createClient } from "redis";

const app = express();
const http = createServer(app);
const io = new Server(http);

const redis = createClient();
redis.on("error", (e)=> console.error("Redis error", e));
await redis.connect();

app.use(express.static("public")); // we'll create a small client below

io.on("connection", (socket) => {
  console.log("Dashboard client connected");
  // send initial snapshot
  socket.on("getSnapshot", async () => {
    const keys = await redis.keys("region:*");
    const data = {};
    for (const k of keys) {
      const region = k.split(":")[1];
      const fields = await redis.hGetAll(k);
      data[region] = fields;
    }
    socket.emit("snapshot", data);
  });
});

// push updates every 3 seconds
setInterval(async () => {
  const keys = await redis.keys("region:*");
  const data = {};
  for (const k of keys) {
    const region = k.split(":")[1];
    data[region] = await redis.hGetAll(k);
  }
  io.emit("update", data);
}, 3000);

const PORT = 3000;
http.listen(PORT, () => console.log(`Dashboard listening on http://localhost:${PORT}`));
