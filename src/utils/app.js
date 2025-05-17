import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    optionsSuccessStatus: 200,
}));

app.get('/api', async (req, res) => {
    try {
        const response = await fetch(`https://api.vimeo.com/users/${process.env.USER_ID}/projects/${process.env.VIDEO_ID}/videos`, {
            headers: {
                'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`,
				'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

app.listen(process.env.PORT);