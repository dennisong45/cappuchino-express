import express from 'express';
import cors from 'cors';
import axios from 'axios';
import {
  saveRequest, getAllRequests, getRequestById,
  savePreset, getAllPresets, deletePreset,
  saveEnvironment, getAllEnvironments, getActiveEnvironment,
  updateEnvironment, deleteEnvironment, setActiveEnvironment
} from './db.js';

const app = express();
const PORT = 3000;

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));
app.use(express.json());

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


app.post('/api/proxy', async (req, res) => {
  try {
    const { method, url, headers, data } = req.body;

    const response = await axios({
      method,
      url,
      headers,
      data,
      validateStatus: () => true // Allow any status code to resolution
    });

    res.json({
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/savePreset', async (req, res) => {
  try {
    const { name, method, url, headers, body, collection } = req.body;
    savePreset({ name, method, url, headers, body, collection });
    res.status(200).json({ message: 'Preset saved successfully!' });
  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/presets', (req, res) => {
  try {
    const presets = getAllPresets();
    res.json(presets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/presets/:id', (req, res) => {
  try {
    const deletedPreset = deletePreset(req.params.id);
    res.status(200).json({ message: 'Preset deleted successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/requests', (req, res) => {
  try {
    const requests = getAllRequests();
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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

app.get('/hello', (req, res) => {
  res.json({ message: 'Hello from Cappuchino Express API!' });
});

// Environment endpoints
app.get('/api/environments', (req, res) => {
  try {
    const environments = getAllEnvironments();
    res.json(environments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/environments/active', (req, res) => {
  try {
    const environment = getActiveEnvironment();
    res.json(environment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/environments', (req, res) => {
  try {
    const { name, variables, is_active } = req.body;
    saveEnvironment({ name, variables, is_active });
    res.status(201).json({ message: 'Environment created successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/environments/:id', (req, res) => {
  try {
    const { name, variables } = req.body;
    updateEnvironment(req.params.id, { name, variables });
    res.json({ message: 'Environment updated successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/environments/:id', (req, res) => {
  try {
    deleteEnvironment(req.params.id);
    res.json({ message: 'Environment deleted successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/environments/:id/activate', (req, res) => {
  try {
    setActiveEnvironment(req.params.id);
    res.json({ message: 'Environment activated successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
