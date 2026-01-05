// I know i should use ORM but im lazy

export const CREATE_REQUESTS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    method TEXT NOT NULL,
    url TEXT NOT NULL,
    request_headers TEXT,
    request_body TEXT,
    response_status INTEGER,
    response_status_text TEXT,
    response_headers TEXT,
    response_body TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

export const CREATE_PRESETS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS presets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    method TEXT NOT NULL,
    url TEXT NOT NULL,
    headers TEXT,
    body TEXT,
    collection TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

export const INSERT_REQUEST_SQL = `
  INSERT INTO requests (
    method, url, request_headers, request_body,
    response_status, response_status_text, response_headers, response_body
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`;

export const GET_ALL_REQUESTS_SQL = 'SELECT* FROM requests ORDER BY timestamp DESC';

export const GET_REQUEST_BY_ID_SQL = 'SELECT * FROM requests WHERE id = ?';

export const INSERT_PRESET_SQL = `
  INSERT INTO presets (
    name, method, url, headers, body, collection
  ) VALUES (?, ?, ?, ?, ?, ?)
`;

export const GET_ALL_PRESETS_SQL = 'SELECT * FROM presets ORDER BY timestamp DESC';

// Environments table SQL
export const CREATE_ENVIRONMENTS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS environments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    variables TEXT DEFAULT '{}',
    is_active INTEGER DEFAULT 0,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

export const INSERT_ENVIRONMENT_SQL = `
  INSERT INTO environments (name, variables, is_active) VALUES (?, ?, ?)
`;

export const GET_ALL_ENVIRONMENTS_SQL = 'SELECT * FROM environments ORDER BY timestamp DESC';

export const GET_ACTIVE_ENVIRONMENT_SQL = 'SELECT * FROM environments WHERE is_active = 1 LIMIT 1';

export const UPDATE_ENVIRONMENT_SQL = 'UPDATE environments SET name = ?, variables = ? WHERE id = ?';

export const DEACTIVATE_ALL_ENVIRONMENTS_SQL = 'UPDATE environments SET is_active = 0';

export const ACTIVATE_ENVIRONMENT_SQL = 'UPDATE environments SET is_active = 1 WHERE id = ?';

export const DELETE_ENVIRONMENT_SQL = 'DELETE FROM environments WHERE id = ?';
