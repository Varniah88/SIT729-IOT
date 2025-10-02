// temperature_node.js
import net from "net";

const host = "127.0.0.1";
const port = 6000;

const region = process.argv[2] || "Melbourne";
const interval = parseInt(process.argv[3], 10) || 2000;
const id = process.argv[4] || `temp-${Math.floor(Math.random()*1000)}`;

function realisticTempForRegion(region) {
  // month affects seasonal baseline
  const month = new Date().getMonth(); // 0..11
  const seasonalOffset = (month >= 10 || month <= 1) ? -6 : 4; // summer vs winter (simple)
  const hour = new Date().getHours();
  // diurnal sine-like pattern (warmest ~15:00)
  const diurnal = 6 * Math.sin(((hour - 15) / 24) * Math.PI * 2);
  const noise = (Math.random() * 2 - 1);
  const base = 18 + seasonalOffset; // base for example
  return Math.round((base + diurnal + noise) * 10) / 10;
}

const client = net.createConnection(port, host, () => {
  console.log(`[${id}] Connected to ${host}:${port} (${region})`);
  setInterval(() => {
    const temp = realisticTempForRegion(region);
    // send with region: type,region,value
    client.write(`temp,${region},${temp}`);
    // optional logging locally
    process.stdout.write(`[${id}] sent temp=${temp} to ${region}\r\n`);
  }, interval);
});

client.on("data", (data) => console.log(`[${id}] Received: ${data.toString()}`));
client.on("error", (err) => console.error(`[${id}] Error: ${err.message}`));
client.on("close", () => console.log(`[${id}] Connection closed`));
