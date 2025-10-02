const express = require('express');
const app = express();
app.use(express.json());

const port = 3001;

app.post('/setHVAC', (req, res) => {
    const { temperature, fanSpeed } = req.body;
    console.log(`HVAC set to Temperature: ${temperature}°C, Fan Speed: ${fanSpeed}`);
    res.json({ status: "success", temperature, fanSpeed });
});

app.listen(port, () => console.log(`HVAC Node running on port ${port}`));
