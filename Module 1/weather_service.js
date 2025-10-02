//weather_services.js

const net = require("net");
const port = 6000;

let temp;
let wind;
let rain;

const fireWarnings = {}; // Dictionary to store area: level

const fireLevels = ["NO RATING", "MODERATE", "HIGH", "EXTREME", "CATASTROPHIC"];

const server = net.createServer((socket) => {
    console.log("Client connected");

    socket.on("data", (data) => {
        const strData = data.toString().trim();
        console.log(`Received: ${strData}`);

        const command = strData.split(",");
        const name = command[0];
        let result;

        switch (name) {
            case "temp":
                temp = parseFloat(command[1]);
                console.log(`Updated temp: ${temp}`);
                result = "ok";
                break;

            case "rain":
                rain = parseFloat(command[1]);
                console.log(`Updated rain: ${rain}`);
                result = "ok";
                break;

            case "wind":
                wind = parseFloat(command[1]);
                console.log(`Updated wind: ${wind}`);
                result = "ok";
                break;

            case "fire":
                const area = command[1];
                const level = parseInt(command[2]); // level is integer index 0–4
                if (!isNaN(level) && fireLevels[level]) {
                    fireWarnings[area] = level; // save area and fire level index
                    console.log(`Updated fire warning: Area=${area}, Level=${fireLevels[level]}`);
                    result = "ok";
                } else {
                    console.log(`Invalid fire data received`);
                    result = "error";
                }
                break;

            case "request":
                const requestedArea = command[1];
                let fireLevelText = "No data";

                if (fireWarnings[requestedArea] !== undefined) {
                    const levelIndex = fireWarnings[requestedArea];
                    fireLevelText = fireLevels[levelIndex]; // convert index to text
                }

                if (temp > 20 && rain < 50 && wind > 30) {
                    result = `Weather Warning; Fire Level in ${requestedArea}: ${fireLevelText}`;
                } else {
                    result = `Everything fine; Fire Level in ${requestedArea}: ${fireLevelText}`;
                }
                console.log(`Response to client: ${result}`);
                break;

            default:
                console.log("Unknown command received");
                result = "Unknown command";
        }

        socket.write(result.toString());
    });

    socket.on("end", () => {
        console.log("Client disconnected");
    });

    socket.on("error", (error) => {
        console.log(`Socket Error: ${error.message}`);
    });
});

server.on("error", (error) => {
    console.log(`Server Error: ${error.message}`);
});

server.listen(port, () => {
    console.log(`TCP socket server is running on port: ${port}`);
});
