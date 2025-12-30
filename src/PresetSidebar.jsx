import React, { useState, useEffect } from 'react'
import axios from 'axios'

function PresetSidebar({ onSelectPreset, onPresetsLoaded }) {
    const [presets, setPresets] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchPresets()
    }, [])

    // Group presets by collection
    const groupedPresets = presets.reduce((acc, preset) => {
        const collection = preset.collection || 'Uncategorized';
        if (!acc[collection]) acc[collection] = [];
        acc[collection].push(preset);
        return acc;
    }, {});

    // State for expanded collections (default all expanded)
    const [expandedCollections, setExpandedCollections] = useState({});

    useEffect(() => {
        // Expand all by default when presets load
        const collections = Object.keys(groupedPresets);
        const initialExpanded = collections.reduce((acc, col) => ({ ...acc, [col]: true }), {});
        setExpandedCollections(initialExpanded);
    }, [presets]);

    const fetchPresets = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/presets')
            // Assuming default API sort is DESC (newest first), if not we should sort here
            const data = response.data;
            setPresets(data)
            setError(null)

            // Notify parent about loaded presets for auto-select logic
            if (onPresetsLoaded) {
                onPresetsLoaded(data);
            }
        } catch (err) {
            setError('Failed to load presets')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const deletePreset = async (id) => {
        try {
            await axios.delete(`http://localhost:3000/api/presets/${id}`)
            fetchPresets()
        } catch (err) {
            console.error(err)
        }
    }

    const toggleCollection = (collection) => {
        setExpandedCollections(prev => ({
            ...prev,
            [collection]: !prev[collection]
        }));
    };

    return (
        <div style={styles.sidebar}>
            <div style={styles.header}>
                <h2 style={styles.title}>Saved Presets</h2>
                <button onClick={fetchPresets} style={styles.refreshButton}>↻</button>
            </div>

            {loading && <div style={styles.loading}>Loading...</div>}
            {error && <div style={styles.error}>{error}</div>}

            <div style={styles.list}>
                {Object.entries(groupedPresets).map(([collection, presets]) => (
                    <div key={collection} style={styles.collectionGroup}>
                        <div
                            style={styles.collectionHeader}
                            onClick={() => toggleCollection(collection)}
                        >
                            <span style={styles.collectionTitle}>{collection}</span>
                            <span style={styles.chevron}>{expandedCollections[collection] ? '▼' : '▶'}</span>
                        </div>

                        {expandedCollections[collection] && (
                            <div style={styles.collectionItems}>
                                {presets.map(preset => (
                                    <div
                                        key={preset.id}
                                        style={styles.presetItem}
                                        onClick={() => onSelectPreset && onSelectPreset(preset)}
                                    >
                                        <div style={styles.presetHeader}>
                                            <span style={{
                                                ...styles.methodBadge,
                                                backgroundColor: getMethodColor(preset.method)
                                            }}>{preset.method}</span>
                                            <span style={styles.presetName}>{preset.name}</span>
                                            <span onClick={(e) => { e.stopPropagation(); deletePreset(preset.id) }} style={{ cursor: 'pointer', color: 'red', marginLeft: 'auto' }}> Delete </span>
                                        </div>
                                        <div style={styles.presetUrl}>{preset.url}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                {!loading && presets.length === 0 && (
                    <div style={styles.empty}>No presets saved yet</div>
                )}
            </div>
        </div>
    )
}

const getMethodColor = (method) => {
    switch (method) {
        case 'GET': return '#007bff'
        case 'POST': return '#28a745'
        case 'PUT': return '#ffc107'
        case 'DELETE': return '#dc3545'
        default: return '#6c757d'
    }
}

const styles = {
    sidebar: {
        width: '300px',
        backgroundColor: 'var(--surface-color)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 80px)', // adjust based on navbar height
        position: 'sticky',
        top: 0,
    },
    header: {
        padding: '1.5rem',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'var(--bg-secondary)',
    },
    title: {
        fontSize: '1.2rem',
        fontWeight: 'bold',
        color: 'var(--text-primary)',
        margin: 0,
        fontFamily: "'Georgia', serif",
    },
    refreshButton: {
        background: 'none',
        border: 'none',
        fontSize: '1.2rem',
        cursor: 'pointer',
        color: 'var(--text-secondary)',
        padding: '0.2rem',
    },
    list: {
        overflowY: 'auto',
        flex: 1,
        padding: '1rem',
    },
    loading: {
        padding: '1rem',
        textAlign: 'center',
        color: 'var(--text-secondary)',
    },
    error: {
        padding: '1rem',
        color: 'var(--error-color)',
        textAlign: 'center',
    },
    empty: {
        padding: '2rem',
        textAlign: 'center',
        color: 'var(--text-secondary)',
        fontStyle: 'italic',
    },
    presetItem: {
        padding: '1rem',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        marginBottom: '0.75rem',
        cursor: 'pointer',
        backgroundColor: 'var(--bg-primary)',
        transition: 'all 0.2s ease',
        ':hover': {
            borderColor: 'var(--accent-color)',
            transform: 'translateY(-2px)',
        }
    },
    presetHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '0.5rem',
    },
    methodBadge: {
        fontSize: '0.7rem',
        padding: '0.2rem 0.5rem',
        borderRadius: '4px',
        color: '#fff',
        fontWeight: 'bold',
        minWidth: '50px',
        textAlign: 'center',
    },
    presetName: {
        fontWeight: '600',
        color: 'var(--text-primary)',
        fontSize: '0.95rem',
    },
    presetUrl: {
        fontSize: '0.8rem',
        color: 'var(--text-secondary)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    collectionGroup: {
        marginBottom: '1rem',
    },
    collectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
        color: 'var(--text-secondary)',
        marginBottom: '0.5rem',
        transition: 'background-color 0.2s ease',
        ':hover': {
            backgroundColor: 'var(--border-color)',
        },
    },
    collectionTitle: {
        fontSize: '0.95rem',
    },
    chevron: {
        fontSize: '0.8rem',
        color: 'var(--accent-color)',
    },
    collectionItems: {
        paddingLeft: '0.5rem',
    },
}

export default PresetSidebar
