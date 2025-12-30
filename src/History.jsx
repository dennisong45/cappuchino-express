import React, { useState, useEffect } from 'react'
import axios from 'axios'

function History() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await axios.get('http://localhost:3000/api/requests')
      setRequests(response.data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    
    // SQLite returns timestamps in format "YYYY-MM-DD HH:MM:SS" (UTC)
    // We need to explicitly treat it as UTC before converting to Mountain Time
    let date
    
    // Check if it's already in ISO format with timezone
    if (dateString.includes('Z') || dateString.includes('+') || dateString.includes('T')) {
      date = new Date(dateString)
    } else {
      // SQLite format: "YYYY-MM-DD HH:MM:SS" - treat as UTC
      // Replace space with 'T' and add 'Z' to make it ISO format (UTC)
      const isoString = dateString.replace(' ', 'T') + 'Z'
      date = new Date(isoString)
    }
    
    // If date is invalid, return original string
    if (isNaN(date.getTime())) {
      return dateString
    }
    
    // Convert to Mountain Time
    return date.toLocaleString('en-US', {
      timeZone: 'America/Denver',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
  }

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return '#28a745'
    if (status >= 300 && status < 400) return '#ffc107'
    if (status >= 400) return '#dc3545'
    return '#6c757d'
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Request History</h1>
        <button onClick={fetchRequests} style={styles.refreshButton}>
          Refresh
        </button>
      </div>

      {loading && <div style={styles.loading}>Loading...</div>}
      {error && <div style={styles.error}>Error: {error}</div>}

      {!loading && !error && (
        <>
          {requests.length === 0 ? (
            <div style={styles.empty}>No requests found. Start making API requests to see them here!</div>
          ) : (
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Method</th>
                    <th style={styles.th}>URL</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Timestamp</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <React.Fragment key={request.id}>
                      <tr style={styles.tr}>
                        <td style={styles.td}>{request.id}</td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.methodBadge,
                            backgroundColor: request.method === 'GET' ? '#007bff' :
                                           request.method === 'POST' ? '#28a745' :
                                           request.method === 'PUT' ? '#ffc107' :
                                           request.method === 'DELETE' ? '#dc3545' : '#6c757d'
                          }}>
                            {request.method}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.urlCell}>{request.url}</div>
                        </td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.statusBadge,
                            color: getStatusColor(request.response_status)
                          }}>
                            {request.response_status || 'N/A'}
                          </span>
                        </td>
                        <td style={styles.td}>{formatDate(request.timestamp)}</td>
                        <td style={styles.td}>
                          <button
                            onClick={() => setExpandedId(expandedId === request.id ? null : request.id)}
                            style={styles.viewButton}
                          >
                            {expandedId === request.id ? 'Hide Details' : 'View Details'}
                          </button>
                        </td>
                      </tr>
                      {expandedId === request.id && (
                        <tr>
                          <td colSpan="6" style={styles.detailsCell}>
                            <div style={styles.detailsContainer}>
                              <div style={styles.detailsSection}>
                                <h3 style={styles.detailsTitle}>Request</h3>
                                <div style={styles.detailsContent}>
                                  <div style={styles.detailsRow}>
                                    <strong>Method:</strong> {request.method}
                                  </div>
                                  <div style={styles.detailsRow}>
                                    <strong>URL:</strong> {request.url}
                                  </div>
                                  <div style={styles.detailsRow}>
                                    <strong>Headers:</strong>
                                    <pre style={styles.jsonPre}>
                                      {JSON.stringify(JSON.parse(request.request_headers || '{}'), null, 2)}
                                    </pre>
                                  </div>
                                  {request.request_body && (
                                    <div style={styles.detailsRow}>
                                      <strong>Body:</strong>
                                      <pre style={styles.jsonPre}>
                                        {JSON.stringify(JSON.parse(request.request_body), null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div style={styles.detailsSection}>
                                <h3 style={styles.detailsTitle}>Response</h3>
                                <div style={styles.detailsContent}>
                                  <div style={styles.detailsRow}>
                                    <strong>Status:</strong> {request.response_status} {request.response_status_text}
                                  </div>
                                  <div style={styles.detailsRow}>
                                    <strong>Headers:</strong>
                                    <pre style={styles.jsonPre}>
                                      {JSON.stringify(JSON.parse(request.response_headers || '{}'), null, 2)}
                                    </pre>
                                  </div>
                                  {request.response_body && (
                                    <div style={styles.detailsRow}>
                                      <strong>Body:</strong>
                                      <pre style={styles.jsonPre}>
                                        {JSON.stringify(JSON.parse(request.response_body), null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}

const styles = {
  container: {
    width: '100%',
    maxWidth: '1400px',
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
    color: '#333',
    margin: 0,
  },
  refreshButton: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  loading: {
    textAlign: 'center',
    padding: '2rem',
    fontSize: '1.1rem',
    color: '#666',
  },
  error: {
    padding: '1rem',
    backgroundColor: '#fee',
    border: '1px solid #fcc',
    borderRadius: '8px',
    color: '#c33',
    marginBottom: '1rem',
  },
  empty: {
    textAlign: 'center',
    padding: '3rem',
    fontSize: '1.1rem',
    color: '#666',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
  },
  tableContainer: {
    overflowX: 'auto',
    backgroundColor: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '1rem',
    textAlign: 'left',
    borderBottom: '2px solid #e0e0e0',
    backgroundColor: '#f5f5f5',
    fontWeight: '600',
    color: '#333',
    fontSize: '0.9rem',
  },
  tr: {
    borderBottom: '1px solid #e0e0e0',
  },
  td: {
    padding: '1rem',
    fontSize: '0.9rem',
    color: '#333',
  },
  methodBadge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '4px',
    color: '#fff',
    fontWeight: '600',
    fontSize: '0.85rem',
  },
  statusBadge: {
    fontWeight: '600',
    fontSize: '0.9rem',
  },
  urlCell: {
    maxWidth: '400px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  viewButton: {
    padding: '0.5rem 1rem',
    fontSize: '0.85rem',
    backgroundColor: '#6c757d',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  detailsCell: {
    padding: 0,
    backgroundColor: '#f9f9f9',
  },
  detailsContainer: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  detailsSection: {
    backgroundColor: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '1rem',
  },
  detailsTitle: {
    margin: '0 0 1rem 0',
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#333',
    borderBottom: '2px solid #e0e0e0',
    paddingBottom: '0.5rem',
  },
  detailsContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  detailsRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  jsonPre: {
    margin: 0,
    padding: '1rem',
    backgroundColor: '#f5f5f5',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '0.85rem',
    fontFamily: 'monospace',
    overflow: 'auto',
    maxHeight: '300px',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
}

export default History

