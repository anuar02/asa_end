const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json()); // Parse JSON bodies

const pool = new Pool({
    user: 'asa_admin',
    host: 'asa.postgres.database.azure.com',
    database: 'postgres',
    password: 'postgres_1',
    port: '5432',
    ssl: true // enable SSL
});

pool.connect()
    .then(() => console.log('Connected to database'))
    .catch(err => console.error('Error connecting to database:', err));

function interpolatePoints(startLat, startLng, endLat, endLng, numberOfPoints) {
    const points = [];
    for (let i = 0; i <= numberOfPoints; i++) {
        const fraction = i / numberOfPoints;
        // Calculate interpolated latitude and longitude
        const interpolatedLat = Number(startLat) + (Number(endLat) - Number(startLat)) * fraction;
        const interpolatedLng = Number(startLng) + (Number(endLng) - Number(startLng)) * fraction;
        // Add the point to the array
        points.push({ lat: interpolatedLat.toFixed(7), lng: interpolatedLng.toFixed(7) });
    }

    return points;
}

// Define the SQL queries to insert data into the tables
async function insertStartEndCoords(startLat, startLng, endLat, endLng) {
    const query = `
        INSERT INTO anuarstartendcoords (start_lat, start_lng, end_lat, end_lng)
        VALUES ($1, $2, $3, $4)
        RETURNING id;
    `;
    const values = [startLat, startLng, endLat, endLng];

    try {
        const result = await pool.query(query, values);
        return result.rows[0].id;
    } catch (error) {
        console.error('Error inserting start/end coordinates:', error);
        throw error;
    }
}

async function insertInterpolatedCoords(startEndCoordsId, interpolatedCoords) {
    const query = `
        INSERT INTO anuarinterpolatedcoords (start_end_coords_id, interpolated_lat, interpolated_lng)
        VALUES ($1, $2, $3);
    `;

    try {
        for (const coord of interpolatedCoords) {
            const values = [startEndCoordsId, coord.lat, coord.lng];
            await pool.query(query, values);
        }
        console.log('Interpolated coordinates inserted successfully');
    } catch (error) {
        console.error('Error inserting interpolated coordinates:', error);
        throw error;
    }
}

// Route handler to receive POST requests with coordinates
app.post('/route', async (req, res) => {
    const { startLat, startLng, endLat, endLng } = req.body;

    try {
        const startEndCoordsId = await insertStartEndCoords(startLat, startLng, endLat, endLng);

        const interpolatedCoords = interpolatePoints(startLat, startLng, endLat, endLng, 10); // Adjust the number of points as needed
        await insertInterpolatedCoords(startEndCoordsId, interpolatedCoords);

        res.json({ success: true });
    } catch (error) {
        console.error('Error inserting coordinates:', error);
        res.status(500).json({ success: false, error: 'Error inserting coordinates' });
    }
});

// WebSocket server setup
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        const { startLat, startLng, endLat, endLng, numberOfPoints } = JSON.parse(message);
        const pointsAlongRoute = interpolatePoints(startLat, startLng, endLat, endLng, numberOfPoints);
        pointsAlongRoute.push({ lat: endLat, lng: endLng });
        let index = 0;

        const intervalId = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN && index < pointsAlongRoute.length) {
                ws.send(JSON.stringify(pointsAlongRoute[index]));
                index++;
            } else {
                clearInterval(intervalId);
                ws.close();
            }
        }, 1000);
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// Start the server
server.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
