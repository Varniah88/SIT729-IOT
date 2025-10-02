// wind_node.js
import net from "net";
const host = "127.0.0.1";
const port = 6000;

const region = process.argv[2] || "Melbourne";
const interval = parseInt(process.argv[3], 10) || 2500;
const id = process.argv[4] || `wind-${Math.floor(Math.random()*1000)}`;

function realisticWind(region) {
  const hour = new Date().getHours();
  // slightly windier afternoons
  const base = 8 + (hour >= 12 && hour <= 18 ? 4 : 0);
  const gust = Math.random() < 0.05 ? Math.random()*60 : Math.random()*8;
  return Math.round((base + gust) * 10) / 10;
}

const client = net.createConnection(port, host, () => {
  console.log(`[${id}] Connected to ${host}:${port} (${region})`);
  setInterval(() => {
    const wind = realisticWind(region);
    client.write(`wind,${region},${wind}`);
    process.stdout.write(`[${id}] sent wind=${wind}\r\n`);
  }, interval);
});

client.on("data", (data) => console.log(`[${id}] Received: ${data.toString()}`));
client.on("error", (err) => console.error(`[${id}] Error: ${err.message}`));
client.on("close", () => console.log(`[${id}] Connection closed`));
