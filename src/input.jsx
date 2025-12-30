import { useState } from 'react'
import React from 'react'
import axios from 'axios'

function Input() {
    const [method, setMethod] = useState('GET')
    const [url, setUrl] = useState('http://localhost:3000/hello')
    const [response, setResponse] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [headers, setHeaders] = useState([{ key: '', value: '' }])
    const [noCache, setNoCache] = useState(false)
    const [bodyType, setBodyType] = useState('none') // 'none', 'json', 'form-data'
    const [jsonBody, setJsonBody] = useState('{\n  \n}')
    const [formData, setFormData] = useState([{ key: '', value: '' }])

    const addHeader = () => {
        setHeaders([...headers, { key: '', value: '' }])
    }

    const removeHeader = (index) => {
        // Sync checkbox if Cache-Control header is being removed
        if (headers[index].key.toLowerCase() === 'cache-control') {
            setNoCache(false)
        }
        setHeaders(headers.filter((_, i) => i !== index))
    }

    const updateHeader = (index, field, value) => {
        const updated = [...headers]
        updated[index][field] = value

        // Sync checkbox if Cache-Control header is changed
        if (updated[index].key.toLowerCase() === 'cache-control') {
            if (field === 'key' && value.toLowerCase() !== 'cache-control') {
                setNoCache(false)
            } else if (field === 'value') {
                setNoCache(value === 'no-cache')
            }
        }

        setHeaders(updated)
    }

    const handleNoCacheChange = (checked) => {
        setNoCache(checked)
        if (checked) {
            // Check if Cache-Control already exists
            const cacheControlIndex = headers.findIndex(h => h.key.toLowerCase() === 'cache-control')
            if (cacheControlIndex === -1) {
                // Add Cache-Control header
                setHeaders([...headers, { key: 'Cache-Control', value: 'no-cache' }])
            } else {
                // Update existing Cache-Control header
                const updated = [...headers]
                updated[cacheControlIndex].value = 'no-cache'
                setHeaders(updated)
            }
        } else {
            // Remove Cache-Control header
            setHeaders(headers.filter(h => h.key.toLowerCase() !== 'cache-control'))
        }
    }

    const addFormData = () => {
        setFormData([...formData, { key: '', value: '' }])
    }

    const removeFormData = (index) => {
        setFormData(formData.filter((_, i) => i !== index))
    }

    const updateFormData = (index, field, value) => {
        const updated = [...formData]
        updated[index][field] = value
        setFormData(updated)
    }

    const handleSend = async () => {
        setLoading(true);
        setError(null);
        setResponse(null);

        try {
            const headersObj = {};
            headers.forEach(header => {
                if (header.key.trim()) { // Just a fail safe method, incase if the user enters a blank header
                    headersObj[header.key.trim()] = header.value.trim();
                }
            });

            let data = null;
            if (bodyType === 'json') {
                try {
                    data = JSON.parse(jsonBody);
                } catch (e) {
                    alert('Invalid JSON in request body');
                    setLoading(false);
                    return;
                }
            } else if (bodyType === 'form-data') {
                data = {};
                formData.forEach(field => {
                    if (field.key.trim()) {
                        data[field.key.trim()] = field.value;
                    }
                });
            }

            const requestConfig = {
                url: url,
                method: method,
                headers: headersObj,
                data: data,
            };

            const res = await axios(requestConfig);

            const responseState = {
                status: res.status,
                statusText: res.statusText,
                data: res.data,
            };
            setResponse(responseState);

            const historyLog = {
                timestamp: new Date().toISOString(),
                request: requestConfig,
                response: responseState
            };

            try {
                // My "holy grail" -> it saved the request and response to the database ( going to be huge maybe? need to test)
                // TODO: need to test or optimize this
                await axios.post('http://localhost:3000/saveData', historyLog);
            } catch (saveErr) {
                console.error('Failed to log to history:', saveErr);
            }

        } catch (err) {
            if (err.response) {
                // Handle cases where the external API returns 4xx or 5xx
                const errorState = {
                    status: err.response.status,
                    statusText: err.response.statusText,
                    data: err.response.data,
                };
                setResponse(errorState);

                // Optional: Save failed attempts to history too
                const errorLog = {
                    timestamp: new Date().toISOString(),
                    request: { url, method, headers: headersObj },
                    response: errorState
                };
                axios.post('http://localhost:3000/saveData', errorLog).catch(() => { });

            } else {
                setError(err.request ? `No response: ${err.message}` : `Error: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSavePreset = async () => {
        const name = prompt("Enter a name for this preset:");
        if (!name) return;

        try {
            const headersObj = {};
            headers.forEach(header => {
                if (header.key.trim()) {
                    headersObj[header.key.trim()] = header.value.trim();
                }
            });

            const presetData = {
                name,
                method,
                url,
                headers: headersObj,
                body: bodyType === 'json' ? jsonBody : (bodyType === 'form-data' ? JSON.stringify(formData) : null), // Simplified storage for now
                // ideally we should store the bodyType and raw values properly, 
                // but for this quick refactor I'm mostly mapping to the existing DB schema which has a single 'body' text column.
                // You might want to update the schema to store bodyType separately later.
                // For now, let's just store the body content if applicable.
            };

            const res = await axios.post('http://localhost:3000/savePreset', presetData);
            alert(res.data.message);
        } catch (err) {
            console.error('Failed to save preset:', err);
            alert('Failed to save preset');
        }
    };

    return (
        <div style={styles.wrapper}>
            <div style={styles.requestSection}>
                <div style={styles.methodUrlRow}>
                    <select
                        value={method}
                        onChange={(e) => setMethod(e.target.value)}
                        style={styles.methodSelect}
                    >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                        <option value="PATCH">PATCH</option>
                    </select>
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="http://localhost:3000/hello"
                        style={styles.urlInput}
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading}
                        style={styles.sendButton}
                    >
                        {loading ? 'Sending...' : 'Send'}
                    </button>
                    <button
                        onClick={handleSavePreset}
                        style={styles.savePresetButton}
                    >
                        Save Preset
                    </button>
                </div>

                <div style={styles.headersSection}>
                    <div style={styles.headersTitle}>
                        Headers
                        <button
                            onClick={addHeader}
                            style={styles.addHeaderButton}
                        >
                            + Add Header
                        </button>
                    </div>
                    <div style={styles.checkboxContainer}>
                        <label style={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={noCache}
                                onChange={(e) => handleNoCacheChange(e.target.checked)}
                                style={styles.checkbox}
                            />
                            Cache-Control: no-cache
                        </label>
                    </div>
                    {headers.map((header, index) => (
                        <div key={index} style={styles.headerRow}>
                            <input
                                type="text"
                                placeholder="Key (e.g., Authorization)"
                                value={header.key}
                                onChange={(e) => updateHeader(index, 'key', e.target.value)}
                                style={styles.headerKey}
                            />
                            <input
                                type="text"
                                placeholder="Value"
                                value={header.value}
                                onChange={(e) => updateHeader(index, 'value', e.target.value)}
                                style={styles.headerValue}
                            />
                            {headers.length > 1 && (
                                <button
                                    onClick={() => removeHeader(index)}
                                    style={styles.removeHeaderButton}
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div style={styles.bodySection}>
                <div style={styles.bodyTabs}>
                    <button
                        style={bodyType === 'none' ? styles.activeBodyTab : styles.bodyTab}
                        onClick={() => setBodyType('none')}
                    >
                        None
                    </button>
                    <button
                        style={bodyType === 'json' ? styles.activeBodyTab : styles.bodyTab}
                        onClick={() => setBodyType('json')}
                    >
                        Raw JSON
                    </button>
                    <button
                        style={bodyType === 'form-data' ? styles.activeBodyTab : styles.bodyTab}
                        onClick={() => setBodyType('form-data')}
                    >
                        Form Data
                    </button>
                </div>

                {bodyType === 'json' && (
                    <textarea
                        value={jsonBody}
                        onChange={(e) => setJsonBody(e.target.value)}
                        onBlur={() => {
                            try {
                                const formatted = JSON.stringify(JSON.parse(jsonBody), null, 2);
                                setJsonBody(formatted);
                            } catch (e) {
                                // ignore invalid json on blur, wait for user to fix
                            }
                        }}
                        placeholder="Enter JSON body here..."
                        style={styles.jsonEditor}
                        spellCheck="false"
                    />
                )}

                {bodyType === 'form-data' && (
                    <div style={styles.formDataList}>
                        {formData.map((field, index) => (
                            <div key={index} style={styles.headerRow}>
                                <input
                                    type="text"
                                    placeholder="Key"
                                    value={field.key}
                                    onChange={(e) => updateFormData(index, 'key', e.target.value)}
                                    style={styles.headerKey}
                                />
                                <input
                                    type="text"
                                    placeholder="Value"
                                    value={field.value}
                                    onChange={(e) => updateFormData(index, 'value', e.target.value)}
                                    style={styles.headerValue}
                                />
                                <button
                                    onClick={addFormData}
                                    style={styles.addHeaderButton}
                                    title="Add another field"
                                >
                                    +
                                </button>
                                {formData.length > 1 && (
                                    <button
                                        onClick={() => removeFormData(index)}
                                        style={styles.removeHeaderButton}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                        {formData.length === 0 && (
                            <button onClick={addFormData} style={styles.addHeaderButton}>
                                + Add Field
                            </button>
                        )}
                    </div>
                )}
            </div>

            {
                error && (
                    <div style={styles.errorDisplay}>
                        <strong>Error:</strong> {error}
                    </div>
                )
            }

            {
                response && (
                    <div style={styles.responseSection}>
                        <div style={styles.responseHeader}>
                            <span style={styles.statusCode}>
                                Status: {response.status} {response.statusText}
                            </span>
                        </div>
                        <pre style={styles.responseBody}>
                            {JSON.stringify(response.data, null, 2)}
                        </pre>
                    </div>
                )
            }
        </div >
    )
}

const styles = {
    wrapper: {
        width: '100%',
        maxWidth: '900px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    requestSection: {
        backgroundColor: '#fff',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '1rem',
    },
    headersSection: {
        marginTop: '1.5rem',
        paddingTop: '1.5rem',
        borderTop: '1px solid #e0e0e0',
    },
    checkboxContainer: {
        marginBottom: '1rem',
    },
    checkboxLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.9rem',
        color: '#333',
        cursor: 'pointer',
    },
    checkbox: {
        cursor: 'pointer',
        width: '18px',
        height: '18px',
    },
    headersTitle: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.75rem',
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#333',
    },
    addHeaderButton: {
        padding: '0.5rem 1rem',
        fontSize: '0.85rem',
        backgroundColor: '#28a745',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: '500',
    },
    headerRow: {
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '0.5rem',
        alignItems: 'center',
    },
    headerKey: {
        flex: '0 0 200px',
        padding: '0.5rem',
        fontSize: '0.9rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        outline: 'none',
    },
    headerValue: {
        flex: 1,
        padding: '0.5rem',
        fontSize: '0.9rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        outline: 'none',
    },
    removeHeaderButton: {
        padding: '0.5rem 0.75rem',
        fontSize: '1.2rem',
        backgroundColor: '#dc3545',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
        lineHeight: '1',
    },
    methodUrlRow: {
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center',
    },
    methodSelect: {
        padding: '0.75rem 1rem',
        fontSize: '0.9rem',
        border: '2px solid #ddd',
        borderRadius: '6px',
        outline: 'none',
        backgroundColor: '#f9f9f9',
        cursor: 'pointer',
        fontWeight: '600',
        minWidth: '100px',
    },
    urlInput: {
        flex: 1,
        padding: '0.75rem 1rem',
        fontSize: '1rem',
        border: '2px solid #ddd',
        borderRadius: '6px',
        outline: 'none',
        transition: 'border-color 0.3s ease',
    },
    sendButton: {
        padding: '0.75rem 2rem',
        fontSize: '1rem',
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'background-color 0.3s ease',
    },
    savePresetButton: {
        padding: '0.75rem 1rem',
        fontSize: '0.9rem',
        backgroundColor: '#6c757d',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'background-color 0.3s ease',
    },
    errorDisplay: {
        padding: '1rem',
        backgroundColor: '#fee',
        border: '1px solid #fcc',
        borderRadius: '8px',
        color: '#c33',
    },
    responseSection: {
        backgroundColor: '#fff',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        overflow: 'hidden',
    },
    responseHeader: {
        padding: '0.75rem 1rem',
        backgroundColor: '#f5f5f5',
        borderBottom: '1px solid #e0e0e0',
    },
    statusCode: {
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#333',
    },
    responseBody: {
        padding: '1rem',
        margin: 0,
        backgroundColor: '#fafafa',
        fontSize: '0.9rem',
        overflow: 'auto',
        maxHeight: '500px',
        fontFamily: 'monospace',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
    },
    bodySection: {
        marginTop: '1.5rem',
        paddingTop: '1rem',
        borderTop: '1px solid #e0e0e0',
    },
    bodyTabs: {
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1rem',
        borderBottom: '1px solid #ddd',
    },
    bodyTab: {
        padding: '0.5rem 1rem',
        cursor: 'pointer',
        border: 'none',
        background: 'none',
        fontSize: '0.9rem',
        fontWeight: '500',
        color: '#666',
        borderBottom: '2px solid transparent',
        marginBottom: '-1px',
    },
    activeBodyTab: {
        padding: '0.5rem 1rem',
        cursor: 'pointer',
        border: 'none',
        background: 'none',
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#007bff',
        borderBottom: '2px solid #007bff',
        marginBottom: '-1px',
    },
    jsonEditor: {
        width: '100%',
        minHeight: '200px',
        padding: '0.75rem',
        fontFamily: 'monospace',
        fontSize: '0.9rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        resize: 'vertical',
        outline: 'none',
    },
    formDataList: {
        display: 'flex',
        flexDirection: 'column',
    },
}

export default Input