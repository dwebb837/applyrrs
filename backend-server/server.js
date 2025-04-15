const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3010;

// Enable CORS
app.use(cors());
app.use(express.json());

// Proxy endpoint
app.get('/api/jobs', async (req, res) => {
    try {
        const query = req.query.q; // Pass query parameters directly
        console.log(`https://www.remoterocketship.com/api/fetch_job_openings?q=${query}`);
        const response = await axios.get(`https://www.remoterocketship.com/api/fetch_job_openings?q=${query}`, {
            headers: {
                'User-Agent': 'PostmanRuntime/7.37.3',
                'Accept': '*/*',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive'
            },
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching jobs:', error.message);
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server running at http://localhost:${PORT}`);
});
