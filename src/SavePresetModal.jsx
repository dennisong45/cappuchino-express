import React, { useState, useEffect } from 'react';
import axios from 'axios';

function SavePresetModal({ isOpen, onClose, onSave }) {
    if (!isOpen) return null;

    const [name, setName] = useState('');
    const [collection, setCollection] = useState('');
    const [newCollection, setNewCollection] = useState('');
    const [existingCollections, setExistingCollections] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            fetchCollections();
            setName('');
            setCollection('Uncategorized');
            setNewCollection('');
        }
    }, [isOpen]);

    const fetchCollections = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/presets');
            const data = res.data;
            const uniqueCollections = [...new Set(data.map(p => p.collection || 'Uncategorized'))];
            // Ensure Uncategorized is always an option
            if (!uniqueCollections.includes('Uncategorized')) {
                uniqueCollections.push('Uncategorized');
            }
            setExistingCollections(uniqueCollections.sort());
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch collections", err);
            setExistingCollections(['Uncategorized']);
            setLoading(false);
        }
    };

    const handleSave = () => {
        if (!name.trim()) {
            alert("Please enter a preset name");
            return;
        }

        const finalCollection = collection === 'CREATE_NEW'
            ? newCollection.trim() || 'Uncategorized'
            : collection;

        onSave(name, finalCollection);
        onClose();
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <h2 style={styles.title}>Save Preset</h2>

                <div style={styles.field}>
                    <label style={styles.label}>Preset Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        style={styles.input}
                        placeholder="e.g. Get User Profile"
                        autoFocus
                    />
                </div>

                <div style={styles.field}>
                    <label style={styles.label}>Collection</label>
                    <select
                        value={collection}
                        onChange={e => setCollection(e.target.value)}
                        style={styles.select}
                    >
                        {existingCollections.map(col => (
                            <option key={col} value={col}>{col}</option>
                        ))}
                        <option value="CREATE_NEW">+ Create New Collection...</option>
                    </select>
                </div>

                {collection === 'CREATE_NEW' && (
                    <div style={styles.field}>
                        <label style={styles.label}>New Collection Name</label>
                        <input
                            type="text"
                            value={newCollection}
                            onChange={e => setNewCollection(e.target.value)}
                            style={styles.input}
                            placeholder="e.g. Auth API"
                        />
                    </div>
                )}

                <div style={styles.buttons}>
                    <button onClick={onClose} style={styles.cancelButton}>Cancel</button>
                    <button onClick={handleSave} style={styles.saveButton}>Save</button>
                </div>
            </div>
        </div>
    );
}

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(62, 39, 35, 0.5)', // Coffee overlay
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(2px)',
    },
    modal: {
        backgroundColor: 'var(--surface-color)',
        padding: '2rem',
        borderRadius: '12px',
        width: '400px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        border: '1px solid var(--border-color)',
    },
    title: {
        marginTop: 0,
        marginBottom: '1.5rem',
        color: 'var(--text-primary)',
        fontFamily: "'Georgia', serif",
        borderBottom: '2px solid var(--accent-color)', // Underline decoration
        paddingBottom: '0.5rem',
        display: 'inline-block',
    },
    field: {
        marginBottom: '1rem',
    },
    label: {
        display: 'block',
        marginBottom: '0.5rem',
        color: 'var(--text-secondary)',
        fontSize: '0.9rem',
        fontWeight: 'bold',
    },
    input: {
        width: '100%',
        padding: '0.75rem',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        fontSize: '1rem',
        outline: 'none',
        boxSizing: 'border-box', // Fix padding issue
    },
    select: {
        width: '100%',
        padding: '0.75rem',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        fontSize: '1rem',
        outline: 'none',
        backgroundColor: '#fff',
        cursor: 'pointer',
    },
    buttons: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '1rem',
        marginTop: '2rem',
    },
    cancelButton: {
        padding: '0.75rem 1.5rem',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        backgroundColor: 'transparent',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        fontSize: '1rem',
    },
    saveButton: {
        padding: '0.75rem 1.5rem',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#d97706', // Warm Caramel
        color: '#fff',
        fontWeight: 'bold',
        cursor: 'pointer',
        fontSize: '1rem',
    }
};

export default SavePresetModal;
