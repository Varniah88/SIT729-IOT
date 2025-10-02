// rain_node.js
import net from "net";
const host = "127.0.0.1";
const port = 6000;

const region = process.argv[2] || "Melbourne";
const interval = parseInt(process.argv[3], 10) || 3000;
const id = process.argv[4] || `rain-${Math.floor(Math.random()*1000)}`;

function realisticRain(region) {
  const month = new Date().getMonth();
  // more rain in winter (months 5..8 in southern hemisphere approximate)
  const winterMonths = [5,6,7,8];
  const seasonal = winterMonths.includes(month) ? 1.2 : 0.6;
  // base mm/hr
  const base = Math.random() * 10 * seasonal;
  // occasional storm
  if (Math.random() < 0.05) return Math.round((base + Math.random()*100) * 10) / 10;
  return Math.round(base * 10) / 10;
}

const client = net.createConnection(port, host, () => {
  console.log(`[${id}] Connected to ${host}:${port} (${region})`);
  setInterval(() => {
    const rain = realisticRain(region);
    client.write(`rain,${region},${rain}`);
    process.stdout.write(`[${id}] sent rain=${rain}\r\n`);
  }, interval);
});

client.on("data", (data) => console.log(`[${id}] Received: ${data.toString()}`));
client.on("error", (err) => console.error(`[${id}] Error: ${err.message}`));
client.on("close", () => console.log(`[${id}] Connection closed`));
