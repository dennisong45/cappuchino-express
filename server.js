import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { saveRequest, getAllRequests, getRequestById, savePreset, getAllPresets } from './db.js';

const app = express();
const PORT = 3000;

// Enable CORS for React app
app.use(cors());
app.use(express.json());

// endpoint to save request and response to database
app.post('/saveData', async (req, res) => {
  try {
    // req.body is the 'historyLog' object { timestamp, request, response }
    const { request, response } = req.body;

    if (!request || !response) {
      return res.status(400).json({ error: "Missing request or response data" });
    }

    saveRequest(request, response);

    res.status(200).json({ message: 'Data saved successfully!' });
  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// endpoint to save a new preset
app.post('/savePreset', async (req, res) => {
  try {
    const { name, method, url, headers, body } = req.body;

    if (!name || !method || !url) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    savePreset({ name, method, url, headers, body });
    res.status(200).json({ message: 'Preset saved successfully!' });
  } catch (error) {
    console.error('Preset Save Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get all saved presets
app.get('/api/presets', (req, res) => {
  try {
    const presets = getAllPresets();
    res.json(presets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all saved requests
app.get('/api/requests', (req, res) => {
  try {
    const requests = getAllRequests();
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific request by ID
app.get('/api/requests/:id', (req, res) => {
  try {
    const request = getRequestById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint
app.get('/hello', (req, res) => {
  res.json({ message: 'Hello from Cappuchino Express API!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

