const express = require('express');
const axios = require('axios');
const net = require('net');
const NumberWindow = require('./models/NumberWindow');

const app = express();
const basePort = process.env.PORT || 9876;
const WINDOW_SIZE = 10;
const API_BASE_URL = 'http://20.244.56.144/evaluation-service';
const numberWindow = new NumberWindow(WINDOW_SIZE);

function isPortAvailable(port) {
    return new Promise((resolve) => {
        const server = net.createServer()
            .once('error', () => resolve(false))
            .once('listening', () => {
                server.close();
                resolve(true);
            })
            .listen(port);
    });
}

async function findAvailablePort(startPort) {
    let port = startPort;
    while (!(await isPortAvailable(port))) {
        port++;
        if (port > startPort + 100) {
            throw new Error('No available ports found');
        }
    }
    return port;
}

const validateNumberType = (req, res, next) => {
    const { numberType } = req.params;
    const validTypes = new Map([
        ['p', 'primesResponse'],
        ['f', 'fibo'],
        ['e', 'even'],
        ['r', 'rand']
    ]);
    
    if (!validTypes.has(numberType)) {
        return res.status(400).json({
            error: 'Invalid number type',
            validOptions: 'Use p (prime), f (fibonacci), e (even), or r (random)'
        });
    }
    req.apiEndpoint = validTypes.get(numberType);
    next();
};

const API_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ0MjA0NjI0LCJpYXQiOjE3NDQyMDQzMjQsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6ImIwYTg3MDQ2LTE0N2MtNGYyNy1iMTYzLTU2ZDIzZTI5Mjg3NCIsInN1YiI6Impsb2tlc2hwcmFidTA2NTUuc3NlQHNhdmVldGhhLmNvbSJ9LCJlbWFpbCI6Impsb2tlc2hwcmFidTA2NTUuc3NlQHNhdmVldGhhLmNvbSIsIm5hbWUiOiJqIGxva2VzaHByYWJ1Iiwicm9sbE5vIjoiMTkyMjEwNjU1IiwiYWNjZXNzQ29kZSI6IlZtR1JqdCIsImNsaWVudElEIjoiYjBhODcwNDYtMTQ3Yy00ZjI3LWIxNjMtNTZkMjNlMjkyODc0IiwiY2xpZW50U2VjcmV0IjoidmNOeHNLS1pLZkFNbVJ3RyJ9.r2fpG7V1WTWQGJZV2f67q0Kxb-HdkQ6-3kD0-y2YmAI';

async function fetchNumbers(apiEndpoint) {
    try {
        if (apiEndpoint === 'even') {
            return Array.from({ length: 25 }, (_, i) => (i + 4) * 2);
        }

        const url = `${API_BASE_URL}/${apiEndpoint === 'rand' ? 'rand' : apiEndpoint}`;
        const config = {
            timeout: 500,
            headers: apiEndpoint !== 'rand' ? { 'Authorization': `Bearer ${API_TOKEN}` } : {}
        };

        const { data } = await axios.get(url, config);
        return Array.isArray(data.numbers) ? data.numbers : [];
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        console.error(`API Error (${apiEndpoint}):`, errorMessage);
        return [];
    }
}

app.get('/numbers/:numberType', validateNumberType, async (req, res) => {
    try {
        const numbers = await fetchNumbers(req.apiEndpoint);
        numbers.forEach(num => numberWindow.addNumber(num));
        res.json(numberWindow.getWindowStates());
    } catch (error) {
        console.error('Request processing error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

findAvailablePort(basePort)
    .then(port => {
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    })
    .catch(error => {
        console.error('Failed to start server:', error);
        process.exit(1);
    });