import React, { useState, useEffect } from 'react';

function DirectSoftwareBrowser() {
  const [software, setSoftware] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(process.env.REACT_APP_API_URL || 'http://localhost:5000/api'+ '/posts')
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('API Response:', data);
        setSoftware(data.posts || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('API Error:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px', color: 'white', background: '#0f1419', minHeight: '100vh' }}>
        <h1>Loading Software...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'white', background: '#0f1419', minHeight: '100vh' }}>
        <h1>Error Loading Software</h1>
        <p style={{ color: '#ff4444' }}>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          style={{ padding: '10px', marginTop: '10px' }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px', 
      color: 'white', 
      background: '#0f1419', 
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>🎯 Available Software ({software.length})</h1>
      
      {software.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <h2>No Software Available</h2>
          <p>No software has been uploaded yet.</p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '20px',
          marginTop: '20px'
        }}>
          {software.map((item, index) => (
            <div key={item._id || index} style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '10px',
              padding: '20px',
              transition: 'transform 0.2s'
            }}>
              <h3 style={{ color: '#ff4444', marginBottom: '10px' }}>
                {item.title || 'Untitled'}
              </h3>
              
              <div style={{ fontSize: '14px', marginBottom: '15px' }}>
                <p><strong>Category:</strong> {item.category || 'Unknown'}</p>
                <p><strong>Version:</strong> {item.version || 'N/A'}</p>
                <p><strong>Size:</strong> {item.fileSize || 'Unknown'}</p>
                <p><strong>Downloads:</strong> {item.downloadCount || 0}</p>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <p style={{ color: '#ccc', fontSize: '13px', lineHeight: '1.4' }}>
                  {item.description ? 
                    (item.description.length > 100 ? 
                      `${item.description.substring(0, 100)}...` : 
                      item.description
                    ) : 'No description available'
                  }
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {item.downloadUrl && (
                  <a 
                    href={process.env.REACT_APP_API_URL || 'http://localhost:5000'+ `${item.downloadUrl}`}
                    download
                    style={{
                      background: '#ff4444',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '5px',
                      textDecoration: 'none',
                      fontSize: '14px',
                      display: 'inline-block'
                    }}
                  >
                    📥 Download
                  </a>
                )}
                
                <button 
                  onClick={() => alert(`More info about: ${item.title}`)}
                  style={{
                    background: 'transparent',
                    color: '#ccc',
                    border: '1px solid #ccc',
                    padding: '8px 16px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  ℹ️ Details
                </button>
              </div>

              {item.tags && item.tags.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  {item.tags.map((tag, i) => (
                    <span key={i} style={{
                      background: '#333',
                      color: '#ccc',
                      padding: '3px 8px',
                      borderRadius: '3px',
                      fontSize: '12px',
                      marginRight: '5px',
                      display: 'inline-block'
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '40px', padding: '20px' }}>
        <button 
          onClick={() => window.location.href = '/admin-login'}
          style={{
            background: '#ff4444',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            marginRight: '10px'
          }}
        >
          🔐 Admin Login
        </button>
        
        <button 
          onClick={() => window.location.reload()}
          style={{
            background: 'transparent',
            color: '#ccc',
            border: '1px solid #ccc',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          🔄 Refresh
        </button>
      </div>
    </div>
  );
}

export default DirectSoftwareBrowser;