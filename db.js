import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import {
  CREATE_REQUESTS_TABLE_SQL,
  CREATE_PRESETS_TABLE_SQL,
  CREATE_ENVIRONMENTS_TABLE_SQL,
  INSERT_REQUEST_SQL,
  GET_ALL_REQUESTS_SQL,
  GET_REQUEST_BY_ID_SQL,
  INSERT_PRESET_SQL,
  GET_ALL_PRESETS_SQL,
  INSERT_ENVIRONMENT_SQL,
  GET_ALL_ENVIRONMENTS_SQL,
  GET_ACTIVE_ENVIRONMENT_SQL,
  UPDATE_ENVIRONMENT_SQL,
  DEACTIVATE_ALL_ENVIRONMENTS_SQL,
  ACTIVATE_ENVIRONMENT_SQL,
  DELETE_ENVIRONMENT_SQL
} from './src/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, 'requests.db'));

// Create table if it doesn't exist
db.exec(CREATE_REQUESTS_TABLE_SQL);

db.exec(CREATE_PRESETS_TABLE_SQL);

db.exec(CREATE_ENVIRONMENTS_TABLE_SQL);

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
    presetData.body ? JSON.stringify(presetData.body) : null,
    presetData.collection || 'Uncategorized'
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

export const deletePreset = (id) => {
  const stmt = db.prepare('DELETE FROM presets WHERE id = ?');
  stmt.run(id);
};

// Environment functions
export const saveEnvironment = (envData) => {
  const stmt = db.prepare(INSERT_ENVIRONMENT_SQL);
  stmt.run(
    envData.name,
    JSON.stringify(envData.variables || {}),
    envData.is_active ? 1 : 0
  );
};

export const getAllEnvironments = () => {
  const stmt = db.prepare(GET_ALL_ENVIRONMENTS_SQL);
  return stmt.all().map(env => ({
    ...env,
    variables: JSON.parse(env.variables || '{}'),
    is_active: env.is_active === 1
  }));
};

export const getActiveEnvironment = () => {
  const stmt = db.prepare(GET_ACTIVE_ENVIRONMENT_SQL);
  const env = stmt.get();
  if (!env) return null;
  return {
    ...env,
    variables: JSON.parse(env.variables || '{}'),
    is_active: true
  };
};

export const updateEnvironment = (id, envData) => {
  const stmt = db.prepare(UPDATE_ENVIRONMENT_SQL);
  stmt.run(envData.name, JSON.stringify(envData.variables || {}), id);
};

export const deleteEnvironment = (id) => {
  const stmt = db.prepare(DELETE_ENVIRONMENT_SQL);
  stmt.run(id);
};

export const setActiveEnvironment = (id) => {
  // Deactivate all environments first
  db.prepare(DEACTIVATE_ALL_ENVIRONMENTS_SQL).run();
  // Activate the selected one
  if (id) {
    db.prepare(ACTIVATE_ENVIRONMENT_SQL).run(id);
  }
};

export default db;

