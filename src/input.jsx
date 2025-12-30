import { useState, useEffect } from 'react'
import React from 'react'
import axios from 'axios'
import SavePresetModal from './SavePresetModal';

function Input({ selectedPreset }) {
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

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSaveClick = () => {
        setIsModalOpen(true);
    };

    const handleModalSave = async (name, collection) => {
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
                body: bodyType === 'json' ? jsonBody : (bodyType === 'form-data' ? JSON.stringify(formData) : null),
                collection
            };

            const res = await axios.post('http://localhost:3000/savePreset', presetData);
            alert(res.data.message);
        } catch (err) {
            console.error('Failed to save preset:', err);
            alert('Failed to save preset');
        }
    };

    // Load preset when selectedPreset changes
    useEffect(() => {
        if (selectedPreset) {
            setMethod(selectedPreset.method || 'GET')
            setUrl(selectedPreset.url || '')

            // Parse headers
            let loadedHeaders = [{ key: '', value: '' }]
            if (selectedPreset.headers) {
                try {
                    const parsedHeaders = typeof selectedPreset.headers === 'string'
                        ? JSON.parse(selectedPreset.headers)
                        : selectedPreset.headers

                    if (Object.keys(parsedHeaders).length > 0) {
                        loadedHeaders = Object.entries(parsedHeaders).map(([key, value]) => ({ key, value }))
                    }
                } catch (e) {
                    console.error("Failed to parse preset headers", e)
                }
            }
            setHeaders(loadedHeaders)

            // Handle Body
            // Note: Current DB schema might just store 'body' as text. 
            // We need to infer logic or if we stored it properly in new structure.
            // For now assuming primitive storage from previous implementation:
            if (selectedPreset.body) {
                try {
                    // Try to detect if it's JSON
                    const parsed = JSON.parse(selectedPreset.body)
                    // If it is an array and looks like form data (array of {key, value} objects is NOT how we stored form data in previous step, 
                    // we stored it as stringified object for form data? No, line 165 stored JSON.stringify(formData) which is array)
                    // Let's safe check based on structure.
                    if (Array.isArray(parsed) && parsed.length > 0 && 'key' in parsed[0] && 'value' in parsed[0]) {
                        setBodyType('form-data')
                        setFormData(parsed)
                    } else {
                        // Assume JSON body
                        setBodyType('json')
                        setJsonBody(JSON.stringify(parsed, null, 2))
                    }
                } catch (e) {
                    // If not valid JSON, treat as raw text or just set JSON body
                    setBodyType('json')
                    setJsonBody(selectedPreset.body)
                }
            } else {
                setBodyType('none')
                setJsonBody('{\n  \n}')
                setFormData([{ key: '', value: '' }])
            }
        }
    }, [selectedPreset])

    const handleClear = () => {
        setMethod('GET')
        setUrl('')
        setHeaders([{ key: '', value: '' }])
        setBodyType('none')
        setJsonBody('{\n  \n}')
        setFormData([{ key: '', value: '' }])
        setResponse(null)
        setError(null)
    }

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

        // Prepare headers
        const headersObj = {};
        headers.forEach(header => {
            if (header.key.trim()) {
                headersObj[header.key.trim()] = header.value.trim();
            }
        });

        // Prepare Body
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

        try {
            // Use the proxy endpoint instead of direct call
            const res = await axios.post('http://localhost:3000/api/proxy', requestConfig);

            // Proxy always returns 200 if it successfully contacted the target
            // The actual target status is inside res.data.status
            const responseState = {
                status: res.data.status,
                statusText: res.data.statusText,
                data: res.data.data,
                headers: res.data.headers,
            };
            setResponse(responseState);

            // Log successful proxy interaction (which contains target request/response)
            const historyLog = {
                timestamp: new Date().toISOString(),
                request: requestConfig,
                response: responseState
            };

            try {
                await axios.post('http://localhost:3000/saveData', historyLog);
            } catch (saveErr) {
                console.error('Failed to log to history:', saveErr);
            }

        } catch (err) {
            // This catch block handles errors contacting the PROXY itself (e.g. backend down)
            const errorMessage = err.response?.data?.error || err.message;
            setError(`Proxy connection failed: ${errorMessage}`);
            console.error("Proxy Error:", err);
        } finally {
            setLoading(false);
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
                        placeholder="Enter URL"
                        style={styles.urlInput}
                    />
                    <button onClick={handleSend} style={styles.sendButton}>
                        {loading ? 'Sending...' : 'Send'}
                    </button>
                    <button onClick={handleSaveClick} style={styles.savePresetButton}>
                        Save Preset
                    </button>
                    <button onClick={handleClear} style={styles.clearButton}>
                        Clear
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

            <SavePresetModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleModalSave}
            />
        </div>
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
        backgroundColor: 'var(--surface-color)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(62, 39, 35, 0.05)',
    },
    headersSection: {
        marginTop: '1.5rem',
        paddingTop: '1.5rem',
        borderTop: '1px solid var(--border-color)',
    },
    checkboxContainer: {
        marginBottom: '1rem',
    },
    checkboxLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.9rem',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
    },
    checkbox: {
        cursor: 'pointer',
        width: '18px',
        height: '18px',
        accentColor: 'var(--accent-color)',
    },
    headersTitle: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.75rem',
        fontSize: '0.9rem',
        fontWeight: '600',
        color: 'var(--text-primary)',
    },
    addHeaderButton: {
        padding: '0.5rem 1rem',
        fontSize: '0.85rem',
        backgroundColor: 'var(--success-color)',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '500',
        transition: 'background-color 0.2s',
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
        border: '1px solid var(--border-color)',
        borderRadius: '6px',
        outline: 'none',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
    },
    headerValue: {
        flex: 1,
        padding: '0.5rem',
        fontSize: '0.9rem',
        border: '1px solid var(--border-color)',
        borderRadius: '6px',
        outline: 'none',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
    },
    removeHeaderButton: {
        padding: '0.5rem 0.75rem',
        fontSize: '1.2rem',
        backgroundColor: 'var(--error-color)',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
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
        border: '2px solid var(--border-color)',
        borderRadius: '8px',
        outline: 'none',
        backgroundColor: 'var(--bg-primary)',
        cursor: 'pointer',
        fontWeight: '600',
        minWidth: '100px',
        color: 'var(--text-primary)',
    },
    urlInput: {
        flex: 1,
        padding: '0.75rem 1rem',
        fontSize: '1rem',
        border: '2px solid var(--accent-color)', // Stronger border
        borderRadius: '8px',
        outline: 'none',
        transition: 'border-color 0.3s ease',
        backgroundColor: '#ffffff', // Stark white to pop against cream
        color: 'var(--text-primary)',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
    },
    sendButton: {
        padding: '0.75rem 2rem',
        fontSize: '1rem',
        backgroundColor: '#2e7d32', // Forest Green
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'background-color 0.3s ease',
    },
    savePresetButton: {
        padding: '0.75rem 1rem',
        fontSize: '0.9rem',
        backgroundColor: '#d97706', // Warm Caramel
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'background-color 0.3s ease',
    },
    clearButton: {
        padding: '0.75rem 1rem',
        fontSize: '0.9rem',
        backgroundColor: 'var(--bg-secondary)',
        color: 'var(--text-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'background-color 0.3s ease',
    },
    errorDisplay: {
        padding: '1rem',
        backgroundColor: '#fee',
        border: '1px solid #fcc',
        borderRadius: '8px',
        color: 'var(--error-color)',
    },
    responseSection: {
        backgroundColor: 'var(--surface-color)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        overflow: 'hidden',
        marginTop: '1.5rem',
    },
    responseHeader: {
        padding: '0.75rem 1rem',
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
    },
    statusCode: {
        fontSize: '0.9rem',
        fontWeight: '600',
        color: 'var(--text-primary)',
    },
    responseBody: {
        padding: '1rem',
        margin: 0,
        backgroundColor: 'var(--surface-color)',
        fontSize: '0.9rem',
        overflow: 'auto',
        maxHeight: '500px',
        fontFamily: 'monospace',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        color: 'var(--text-primary)',
    },
    bodySection: {
        marginTop: '1.5rem',
        paddingTop: '1rem',
        borderTop: '1px solid var(--border-color)',
    },
    bodyTabs: {
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1rem',
        borderBottom: '1px solid var(--border-color)',
    },
    bodyTab: {
        padding: '0.5rem 1rem',
        cursor: 'pointer',
        border: 'none',
        background: 'none',
        fontSize: '0.9rem',
        fontWeight: '500',
        color: 'var(--text-secondary)',
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
        color: 'var(--accent-color)',
        borderBottom: '2px solid var(--accent-color)',
        marginBottom: '-1px',
    },
    jsonEditor: {
        width: '100%',
        minHeight: '200px',
        padding: '0.75rem',
        fontFamily: 'monospace',
        fontSize: '0.9rem',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        resize: 'vertical',
        outline: 'none',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
    },
    formDataList: {
        display: 'flex',
        flexDirection: 'column',
    },
}

export default Input