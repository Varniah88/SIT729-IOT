// load_generator.js
// Simple generator: spawns many virtual clients in this process (not child processes).
import net from "net";

const host = "127.0.0.1";
const port = 6000;
const regions = ["Melbourne","Ballarat","Geelong","Bendigo","Warrnambool"];
const totalSensors = parseInt(process.argv[2], 10) || 60;

function spawnVirtualSensor(type, region, id, interval) {
  const client = new net.Socket();
  client.connect(port, host, () => {
    // console.log(`[load] ${id} connected`);
    setInterval(() => {
      let payload;
      if (type === "temp") payload = `temp,${region},${(15 + Math.random()*20).toFixed(1)}`;
      if (type === "rain") payload = `rain,${region},${(Math.random()*50).toFixed(1)}`;
      if (type === "wind") payload = `wind,${region},${(Math.random()*50).toFixed(1)}`;
      if (type === "fire") payload = `fire,${region},${Math.floor(Math.random()*5)}`;
      client.write(payload);
    }, interval);
  });

  client.on("data", () => {});
  client.on("error", (e) => { /* ignore */ });
}

for (let i = 0; i < totalSensors; i++) {
  const region = regions[i % regions.length];
  const type = ["temp","rain","wind","temp","temp","wind","fire"][i % 7];
  const id = `gen-${i}`;
  const interval = 1000 + (Math.random()*2000)|0;
  spawnVirtualSensor(type, region, id, interval);
}

console.log(`Spawned ${totalSensors} virtual sensors (in-process).`);
