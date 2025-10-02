// warning_request.js
import net from "net";
const host = "127.0.0.1";
const port = 6000;

const area = process.argv[2] || "Melbourne";
const interval = parseInt(process.argv[3], 10) || 5000;
const id = process.argv[4] || `req-${Math.floor(Math.random()*1000)}`;

const client = net.createConnection(port, host, () => {
  console.log(`[${id}] Connected. Requesting warnings for ${area}`);
  setInterval(() => {
    client.write(`request,${area}`);
  }, interval);
});

client.on("data", (data) => console.log(`[${id}] Received: ${data.toString()}`));
client.on("error", (err) => console.error(`[${id}] Error: ${err.message}`));
client.on("close", () => console.log(`[${id}] Connection closed`));
