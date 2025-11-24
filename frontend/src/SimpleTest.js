import React from 'react';

function SimpleTest() {
  return (
    <div style={{
      padding: '20px',
      fontFamily: 'Arial',
      backgroundColor: '#0f1419',
      color: '#ffffff',
      minHeight: '100vh'
    }}>
      <h1>Simple React Test</h1>
      <p>If you can see this, React is working!</p>
      <p>Time: {new Date().toLocaleString()}</p>
      
      <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #333' }}>
        <h3>Backend Connection Test</h3>
        <TestBackend />
      </div>
    </div>
  );
}

function TestBackend() {
  const [status, setStatus] = React.useState('Testing...');
  
  React.useEffect(() => {
    fetch(process.env.REACT_APP_API_URL || 'http://localhost:5000/api'+ '/test')
      .then(res => res.json())
      .then(data => {
        setStatus(`✅ Backend connected: ${data.message}`);
      })
      .catch(err => {
        setStatus(`❌ Backend error: ${err.message}`);
      });
  }, []);
  
  return <p>{status}</p>;
}

export default SimpleTest;