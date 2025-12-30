import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import {
  CREATE_REQUESTS_TABLE_SQL,
  CREATE_PRESETS_TABLE_SQL,
  INSERT_REQUEST_SQL,
  GET_ALL_REQUESTS_SQL,
  GET_REQUEST_BY_ID_SQL,
  INSERT_PRESET_SQL,
  GET_ALL_PRESETS_SQL
} from './src/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, 'requests.db'));

// Create table if it doesn't exist
db.exec(CREATE_REQUESTS_TABLE_SQL);

db.exec(CREATE_PRESETS_TABLE_SQL);

export const saveRequest = (requestData, responseData) => {
  const stmt = db.prepare(INSERT_REQUEST_SQL);

  stmt.run(
    requestData.method || 'UNKNOWN',
    requestData.url || '',
    JSON.stringify(requestData.headers || {}),
    requestData.body ? JSON.stringify(requestData.body) : null,
    responseData.status,
    responseData.statusText || '',
    JSON.stringify(responseData.headers || {}),
    responseData.data ? JSON.stringify(responseData.data) : null
  );
};

export const getAllRequests = () => {
  const stmt = db.prepare(GET_ALL_REQUESTS_SQL);
  return stmt.all();
};

export const getRequestById = (id) => {
  const stmt = db.prepare(GET_REQUEST_BY_ID_SQL);
  return stmt.get(id);
};

export const savePreset = (presetData) => {
  const stmt = db.prepare(INSERT_PRESET_SQL);

  stmt.run(
    presetData.name,
    presetData.method,
    presetData.url,
    JSON.stringify(presetData.headers || {}),
    presetData.body ? JSON.stringify(presetData.body) : null
  );
};

export const getAllPresets = () => {
  const stmt = db.prepare(GET_ALL_PRESETS_SQL);
  return stmt.all().map(preset => ({
    ...preset,
    headers: JSON.parse(preset.headers || '{}'),
    body: preset.body ? JSON.parse(preset.body) : null
  }));
};

export default db;
