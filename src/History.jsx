import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

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


    let date

    if (dateString.includes('Z') || dateString.includes('+') || dateString.includes('T')) {
      date = new Date(dateString)
    } else {

      const isoString = dateString.replace(' ', 'T') + 'Z'
      date = new Date(isoString)
    }

    if (isNaN(date.getTime())) {
      return dateString
    }

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
                                    <SyntaxHighlighter
                                      language="json"
                                      style={vscDarkPlus}
                                      customStyle={styles.jsonPre}
                                      wrapLongLines={true}
                                    >
                                      {JSON.stringify(JSON.parse(request.request_headers || '{}'), null, 2)}
                                    </SyntaxHighlighter>
                                  </div>
                                  {request.request_body && (
                                    <div style={styles.detailsRow}>
                                      <strong>Body:</strong>
                                      <SyntaxHighlighter
                                        language="json"
                                        style={vscDarkPlus}
                                        customStyle={styles.jsonPre}
                                        wrapLongLines={true}
                                      >
                                        {JSON.stringify(JSON.parse(request.request_body), null, 2)}
                                      </SyntaxHighlighter>
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
                                    <SyntaxHighlighter
                                      language="json"
                                      style={vscDarkPlus}
                                      customStyle={styles.jsonPre}
                                      wrapLongLines={true}
                                    >
                                      {JSON.stringify(JSON.parse(request.response_headers || '{}'), null, 2)}
                                    </SyntaxHighlighter>
                                  </div>
                                  {request.response_body && (
                                    <div style={styles.detailsRow}>
                                      <strong>Body:</strong>
                                      <SyntaxHighlighter
                                        language="json"
                                        style={vscDarkPlus}
                                        customStyle={styles.jsonPre}
                                        wrapLongLines={true}
                                      >
                                        {JSON.stringify(JSON.parse(request.response_body), null, 2)}
                                      </SyntaxHighlighter>
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
    color: 'var(--text-primary)',
    margin: 0,
    fontFamily: "'Georgia', serif",
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
    transition: 'background-color 0.2s',
  },
  loading: {
    textAlign: 'center',
    padding: '2rem',
    fontSize: '1.1rem',
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
    fontSize: '1.1rem',
    color: 'var(--text-secondary)',
    backgroundColor: 'var(--surface-color)',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
  },
  tableContainer: {
    overflowX: 'auto',
    backgroundColor: 'var(--surface-color)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(62, 39, 35, 0.05)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '1rem',
    textAlign: 'left',
    borderBottom: '2px solid var(--border-color)',
    backgroundColor: 'var(--bg-secondary)',
    fontWeight: '600',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
  },
  tr: {
    borderBottom: '1px solid var(--border-color)',
  },
  td: {
    padding: '1rem',
    fontSize: '0.9rem',
    color: 'var(--text-primary)',
  },
  methodBadge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '6px',
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
    color: 'var(--text-secondary)',
  },
  viewButton: {
    padding: '0.5rem 1rem',
    fontSize: '0.85rem',
    backgroundColor: 'var(--text-secondary)',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  detailsCell: {
    padding: 0,
    backgroundColor: 'var(--bg-primary)',
  },
  detailsContainer: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  detailsSection: {
    backgroundColor: 'var(--surface-color)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '1rem',
  },
  detailsTitle: {
    margin: '0 0 1rem 0',
    fontSize: '1.1rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    borderBottom: '2px solid var(--border-color)',
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
    color: 'var(--text-primary)',
  },
  jsonPre: {
    margin: 0,
    padding: '1rem',
    backgroundColor: '#1e1e1e',
    border: '1px solid #404040',
    borderRadius: '6px',
    fontSize: '0.85rem',
    fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace",
    overflow: 'auto',
    maxHeight: '300px',
  },
}

export default History

