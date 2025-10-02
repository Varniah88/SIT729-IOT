// weather_service_cluster.js
// Run with: node weather_service_cluster.js
import cluster from "cluster";
import os from "os";
import net from "net";
import { createClient } from "redis";

const PORT = 6000;
const NUM_CPUS = os.cpus().length;
const fireLevels = ["NO RATING", "MODERATE", "HIGH", "EXTREME", "CATASTROPHIC"];

async function startWorker() {
  // each worker gets its own redis client
  const redis = createClient();
  redis.on("error", (err) => console.error("Redis Client Error", err));
  await redis.connect();

  const server = net.createServer((socket) => {
    const remote = `${socket.remoteAddress}:${socket.remotePort}`;
    console.log(`[${process.pid}] Client connected ${remote}`);

    socket.on("data", async (buf) => {
      try {
        const str = buf.toString().trim();
        // support messages with region: type,region,value
        const parts = str.split(",");
        const type = parts[0];

        if (type === "temp" || type === "rain" || type === "wind") {
          // if client sent type,region,value or type,value (backwards compatible)
          let region, value;
          if (parts.length >= 3) {
            region = parts[1];
            value = parts[2];
          } else {
            // fallback to old format: type,value (no region) -> use "GLOBAL"
            region = "GLOBAL";
            value = parts[1];
          }
          const key = `region:${region}`;
          await redis.hSet(key, type, value);
          await redis.hSet(key, "last_update", Date.now().toString());
          socket.write("ok");
          console.log(`[${process.pid}] Updated ${region} ${type}=${value}`);
          return;
        }

        if (type === "fire") {
          // fire,Area,levelIndex
          const area = parts[1] || "GLOBAL";
          const level = parseInt(parts[2], 10);
          const key = `region:${area}`;
          if (!Number.isNaN(level) && fireLevels[level]) {
            await redis.hSet(key, "fire", level.toString());
            await redis.hSet(key, "last_update", Date.now().toString());
            socket.write("ok");
            console.log(`[${process.pid}] Updated fire ${area} -> ${fireLevels[level]}`);
          } else {
            socket.write("error");
          }
          return;
        }

        if (type === "request") {
          const region = parts[1] || "GLOBAL";
          const key = `region:${region}`;
          const data = await redis.hGetAll(key); // values are strings
          const temp = parseFloat(data.temp ?? "0");
          const rain = parseFloat(data.rain ?? "9999");
          const wind = parseFloat(data.wind ?? "0");
          const fireIndex = data.fire !== undefined ? parseInt(data.fire, 10) : undefined;
          const fireText = fireIndex !== undefined && fireLevels[fireIndex] ? fireLevels[fireIndex] : "No data";

          // Simple, explainable decision rule — could be extended
          const weatherWarning = (temp > 35 && wind > 40 && rain < 20) ? "Weather Warning" : "Everything fine";

          const response = `${weatherWarning}; Fire Level in ${region}: ${fireText}; last_update:${data.last_update ?? "N/A"}`;
          socket.write(response);
          console.log(`[${process.pid}] Responded to request for ${region}: ${response}`);
          return;
        }

        // unknown
        socket.write("Unknown command");
      } catch (err) {
        console.error("Processing error", err);
        socket.write("error");
      }
    });

    socket.on("end", () => console.log(`[${process.pid}] Client disconnected ${remote}`));
    socket.on("error", (err) => console.log(`[${process.pid}] Socket error: ${err.message}`));
  });

  server.listen(PORT, () => console.log(`[${process.pid}] Worker server listening on ${PORT}`));
}

// Primary / master creates worker processes
if (cluster.isPrimary) {
  console.log(`Master ${process.pid} starting ${NUM_CPUS} workers...`);
  for (let i = 0; i < NUM_CPUS; i++) {
    cluster.fork();
  }
  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died — restarting...`);
    cluster.fork();
  });
} else {
  // Worker starts the server and Redis connection
  startWorker().catch((err) => {
    console.error("Worker failed to start:", err);
    process.exit(1);
  });
}
