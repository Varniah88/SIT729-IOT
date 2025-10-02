// fire_service_node.js
import net from "net";
const host = "127.0.0.1";
const port = 6000;

const fireLevels = ["NO RATING", "MODERATE", "HIGH", "EXTREME", "CATASTROPHIC"];
const areas = ["Melbourne", "Ballarat", "Geelong", "Bendigo", "Warrnambool"];
const interval = parseInt(process.argv[2], 10) || 5000;
const id = process.argv[3] || `fire-${Math.floor(Math.random()*1000)}`;

const client = net.createConnection(port, host, () => {
  console.log(`[${id}] Connected to ${host}:${port}`);
  setInterval(() => {
    const area = areas[Math.floor(Math.random()*areas.length)];
    // bias: hottest months produce higher chance of severe ratings
    const month = new Date().getMonth();
    const summerBias = (month >= 10 || month <= 1) ? 0.5 : 0.1;
    let level = Math.floor(Math.random() * fireLevels.length);
    if (Math.random() < summerBias) level = Math.min(fireLevels.length - 1, level + 1);

    console.log(`[${id}] Sending fire: ${area} -> ${fireLevels[level]} (${level})`);
    client.write(`fire,${area},${level}`);
  }, interval);
});

client.on("data", (data) => console.log(`[${id}] Received: ${data.toString()}`));
client.on("error", (err) => console.error(`[${id}] Error: ${err.message}`));
client.on("close", () => console.log(`[${id}] Connection closed`));
