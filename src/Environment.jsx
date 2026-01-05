import React, { useState, useEffect } from 'react'
import axios from 'axios'

function Environment() {
    const [environments, setEnvironments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [editingId, setEditingId] = useState(null)
    const [editForm, setEditForm] = useState({ name: '', variables: [] })
    const [newEnvForm, setNewEnvForm] = useState({ name: '', variables: [{ key: '', value: '' }] })
    const [showNewForm, setShowNewForm] = useState(false)

    useEffect(() => {
        fetchEnvironments()
    }, [])

    const fetchEnvironments = async () => {
        try {
            setLoading(true)
            const response = await axios.get('http://localhost:3000/api/environments')
            setEnvironments(response.data)
            setError(null)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const createEnvironment = async () => {
        try {
            // Convert variables array to object
            const variablesObj = {}
            newEnvForm.variables.forEach(v => {
                if (v.key.trim()) {
                    variablesObj[v.key.trim()] = v.value
                }
            })

            await axios.post('http://localhost:3000/api/environments', {
                name: newEnvForm.name,
                variables: variablesObj,
                is_active: environments.length === 0 // First environment is active by default
            })

            setNewEnvForm({ name: '', variables: [{ key: '', value: '' }] })
            setShowNewForm(false)
            fetchEnvironments()
        } catch (err) {
            alert('Failed to create environment: ' + err.message)
        }
    }

    const updateEnvironment = async (id) => {
        try {
            // Convert variables array to object
            const variablesObj = {}
            editForm.variables.forEach(v => {
                if (v.key.trim()) {
                    variablesObj[v.key.trim()] = v.value
                }
            })

            await axios.put(`http://localhost:3000/api/environments/${id}`, {
                name: editForm.name,
                variables: variablesObj
            })

            setEditingId(null)
            fetchEnvironments()
        } catch (err) {
            alert('Failed to update environment: ' + err.message)
        }
    }

    const deleteEnvironment = async (id) => {
        if (!confirm('Are you sure you want to delete this environment?')) return
        try {
            await axios.delete(`http://localhost:3000/api/environments/${id}`)
            fetchEnvironments()
        } catch (err) {
            alert('Failed to delete environment: ' + err.message)
        }
    }

    const activateEnvironment = async (id) => {
        try {
            await axios.post(`http://localhost:3000/api/environments/${id}/activate`)
            fetchEnvironments()
        } catch (err) {
            alert('Failed to activate environment: ' + err.message)
        }
    }

    const startEditing = (env) => {
        // Convert variables object to array for editing
        const variablesArray = Object.entries(env.variables || {}).map(([key, value]) => ({ key, value }))
        if (variablesArray.length === 0) {
            variablesArray.push({ key: '', value: '' })
        }
        setEditForm({ name: env.name, variables: variablesArray })
        setEditingId(env.id)
    }

    const addVariable = (formType) => {
        if (formType === 'new') {
            setNewEnvForm(prev => ({
                ...prev,
                variables: [...prev.variables, { key: '', value: '' }]
            }))
        } else {
            setEditForm(prev => ({
                ...prev,
                variables: [...prev.variables, { key: '', value: '' }]
            }))
        }
    }

    const removeVariable = (formType, index) => {
        if (formType === 'new') {
            setNewEnvForm(prev => ({
                ...prev,
                variables: prev.variables.filter((_, i) => i !== index)
            }))
        } else {
            setEditForm(prev => ({
                ...prev,
                variables: prev.variables.filter((_, i) => i !== index)
            }))
        }
    }

    const updateVariable = (formType, index, field, value) => {
        if (formType === 'new') {
            setNewEnvForm(prev => {
                const updated = [...prev.variables]
                updated[index][field] = value
                return { ...prev, variables: updated }
            })
        } else {
            setEditForm(prev => {
                const updated = [...prev.variables]
                updated[index][field] = value
                return { ...prev, variables: updated }
            })
        }
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Environments</h1>
                <div style={styles.headerButtons}>
                    <button onClick={() => setShowNewForm(!showNewForm)} style={styles.addButton}>
                        {showNewForm ? 'Cancel' : '+ New Environment'}
                    </button>
                    <button onClick={fetchEnvironments} style={styles.refreshButton}>
                        Refresh
                    </button>
                </div>
            </div>

            {loading && <div style={styles.loading}>Loading...</div>}
            {error && <div style={styles.error}>Error: {error}</div>}

            {/* New Environment Form */}
            {showNewForm && (
                <div style={styles.formCard}>
                    <h3 style={styles.formTitle}>Create New Environment</h3>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Environment Name</label>
                        <input
                            type="text"
                            value={newEnvForm.name}
                            onChange={(e) => setNewEnvForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., Development, Production"
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Variables</label>
                        {newEnvForm.variables.map((variable, index) => (
                            <div key={index} style={styles.variableRow}>
                                <input
                                    type="text"
                                    value={variable.key}
                                    onChange={(e) => updateVariable('new', index, 'key', e.target.value)}
                                    placeholder="Variable name (e.g., baseURL)"
                                    style={styles.variableKey}
                                />
                                <input
                                    type="text"
                                    value={variable.value}
                                    onChange={(e) => updateVariable('new', index, 'value', e.target.value)}
                                    placeholder="Value"
                                    style={styles.variableValue}
                                />
                                <button onClick={() => removeVariable('new', index)} style={styles.removeButton}>×</button>
                            </div>
                        ))}
                        <button onClick={() => addVariable('new')} style={styles.addVariableButton}>
                            + Add Variable
                        </button>
                    </div>
                    <button onClick={createEnvironment} style={styles.saveButton}>
                        Create Environment
                    </button>
                </div>
            )}

            {/* Environment List */}
            <div style={styles.envList}>
                {environments.length === 0 && !loading && (
                    <div style={styles.empty}>
                        No environments yet. Create one to start using variables like {'{baseURL}'} in your requests!
                    </div>
                )}

                {environments.map(env => (
                    <div key={env.id} style={{
                        ...styles.envCard,
                        ...(env.is_active ? styles.activeEnvCard : {})
                    }}>
                        {editingId === env.id ? (
                            // Edit Mode
                            <div style={styles.editForm}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Name</label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                        style={styles.input}
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Variables</label>
                                    {editForm.variables.map((variable, index) => (
                                        <div key={index} style={styles.variableRow}>
                                            <input
                                                type="text"
                                                value={variable.key}
                                                onChange={(e) => updateVariable('edit', index, 'key', e.target.value)}
                                                placeholder="Variable name"
                                                style={styles.variableKey}
                                            />
                                            <input
                                                type="text"
                                                value={variable.value}
                                                onChange={(e) => updateVariable('edit', index, 'value', e.target.value)}
                                                placeholder="Value"
                                                style={styles.variableValue}
                                            />
                                            <button onClick={() => removeVariable('edit', index)} style={styles.removeButton}>×</button>
                                        </div>
                                    ))}
                                    <button onClick={() => addVariable('edit')} style={styles.addVariableButton}>
                                        + Add Variable
                                    </button>
                                </div>
                                <div style={styles.editActions}>
                                    <button onClick={() => updateEnvironment(env.id)} style={styles.saveButton}>Save</button>
                                    <button onClick={() => setEditingId(null)} style={styles.cancelButton}>Cancel</button>
                                </div>
                            </div>
                        ) : (
                            // View Mode
                            <>
                                <div style={styles.envHeader}>
                                    <div style={styles.envTitleSection}>
                                        <h3 style={styles.envName}>{env.name}</h3>
                                        {env.is_active && <span style={styles.activeBadge}>Active</span>}
                                    </div>
                                    <div style={styles.envActions}>
                                        {!env.is_active && (
                                            <button onClick={() => activateEnvironment(env.id)} style={styles.activateButton}>
                                                Activate
                                            </button>
                                        )}
                                        <button onClick={() => startEditing(env)} style={styles.editButton}>Edit</button>
                                        <button onClick={() => deleteEnvironment(env.id)} style={styles.deleteButton}>Delete</button>
                                    </div>
                                </div>
                                <div style={styles.variablesPreview}>
                                    {Object.entries(env.variables || {}).length === 0 ? (
                                        <span style={styles.noVariables}>No variables defined</span>
                                    ) : (
                                        Object.entries(env.variables).map(([key, value]) => (
                                            <div key={key} style={styles.variablePreviewRow}>
                                                <code style={styles.variablePreviewKey}>{`{${key}}`}</code>
                                                <span style={styles.variablePreviewValue}>{value}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

const styles = {
    container: {
        width: '100%',
        maxWidth: '900px',
        margin: '0 auto',
        padding: '2rem',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
    },
    title: {
        fontSize: '2rem',
        fontWeight: 'bold',
        color: 'var(--text-primary)',
        margin: 0,
        fontFamily: "'Georgia', serif",
    },
    headerButtons: {
        display: 'flex',
        gap: '0.75rem',
    },
    addButton: {
        padding: '0.75rem 1.5rem',
        fontSize: '1rem',
        backgroundColor: '#2e7d32',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
    },
    refreshButton: {
        padding: '0.75rem 1.5rem',
        fontSize: '1rem',
        backgroundColor: 'var(--accent-color)',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
    },
    loading: {
        textAlign: 'center',
        padding: '2rem',
        color: 'var(--text-secondary)',
    },
    error: {
        padding: '1rem',
        backgroundColor: '#fee',
        border: '1px solid #fcc',
        borderRadius: '8px',
        color: 'var(--error-color)',
        marginBottom: '1rem',
    },
    empty: {
        textAlign: 'center',
        padding: '3rem',
        color: 'var(--text-secondary)',
        backgroundColor: 'var(--surface-color)',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
    },
    formCard: {
        backgroundColor: 'var(--surface-color)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
    },
    formTitle: {
        margin: '0 0 1rem 0',
        color: 'var(--text-primary)',
        fontSize: '1.2rem',
    },
    formGroup: {
        marginBottom: '1rem',
    },
    label: {
        display: 'block',
        marginBottom: '0.5rem',
        fontWeight: '600',
        color: 'var(--text-primary)',
        fontSize: '0.9rem',
    },
    input: {
        width: '100%',
        padding: '0.75rem',
        fontSize: '1rem',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        boxSizing: 'border-box',
    },
    variableRow: {
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '0.5rem',
        alignItems: 'center',
    },
    variableKey: {
        flex: '0 0 200px',
        padding: '0.5rem',
        fontSize: '0.9rem',
        border: '1px solid var(--border-color)',
        borderRadius: '6px',
        backgroundColor: '#1e1e1e',
        color: '#d4d4d4',
        fontFamily: 'monospace',
    },
    variableValue: {
        flex: 1,
        padding: '0.5rem',
        fontSize: '0.9rem',
        border: '1px solid var(--border-color)',
        borderRadius: '6px',
        backgroundColor: '#1e1e1e',
        color: '#d4d4d4',
        fontFamily: 'monospace',
    },
    removeButton: {
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
    addVariableButton: {
        padding: '0.5rem 1rem',
        fontSize: '0.85rem',
        backgroundColor: 'var(--success-color)',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '500',
    },
    saveButton: {
        padding: '0.75rem 1.5rem',
        fontSize: '1rem',
        backgroundColor: '#2e7d32',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
    },
    cancelButton: {
        padding: '0.75rem 1.5rem',
        fontSize: '1rem',
        backgroundColor: 'var(--bg-secondary)',
        color: 'var(--text-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
    },
    envList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    envCard: {
        backgroundColor: 'var(--surface-color)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '1.5rem',
        transition: 'border-color 0.2s',
    },
    activeEnvCard: {
        borderColor: '#2e7d32',
        borderWidth: '2px',
    },
    envHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
    },
    envTitleSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
    },
    envName: {
        margin: 0,
        fontSize: '1.2rem',
        fontWeight: '600',
        color: 'var(--text-primary)',
    },
    activeBadge: {
        padding: '0.25rem 0.75rem',
        fontSize: '0.75rem',
        backgroundColor: '#2e7d32',
        color: '#fff',
        borderRadius: '12px',
        fontWeight: '600',
    },
    envActions: {
        display: 'flex',
        gap: '0.5rem',
    },
    activateButton: {
        padding: '0.5rem 1rem',
        fontSize: '0.85rem',
        backgroundColor: '#d97706',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '500',
    },
    editButton: {
        padding: '0.5rem 1rem',
        fontSize: '0.85rem',
        backgroundColor: 'var(--text-secondary)',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '500',
    },
    deleteButton: {
        padding: '0.5rem 1rem',
        fontSize: '0.85rem',
        backgroundColor: 'var(--error-color)',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '500',
    },
    variablesPreview: {
        backgroundColor: '#1e1e1e',
        borderRadius: '8px',
        padding: '1rem',
    },
    noVariables: {
        color: '#6c757d',
        fontStyle: 'italic',
    },
    variablePreviewRow: {
        display: 'flex',
        gap: '1rem',
        marginBottom: '0.5rem',
        alignItems: 'center',
    },
    variablePreviewKey: {
        color: '#9cdcfe',
        fontFamily: 'monospace',
        fontSize: '0.9rem',
        minWidth: '150px',
    },
    variablePreviewValue: {
        color: '#ce9178',
        fontFamily: 'monospace',
        fontSize: '0.9rem',
    },
    editForm: {
        display: 'flex',
        flexDirection: 'column',
    },
    editActions: {
        display: 'flex',
        gap: '0.75rem',
        marginTop: '1rem',
    },
}

export default Environment
