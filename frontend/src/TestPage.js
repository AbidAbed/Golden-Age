import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #2a1a1a 100%);
  color: white;
  padding: 20px;
`;

const TestCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  max-width: 600px;
`;

const Title = styled.h1`
  color: #ffd700;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 20px;
`;

const Status = styled.div`
  color: #4CAF50;
  font-size: 1.2rem;
  margin-bottom: 15px;
`;

const TestList = styled.ul`
  text-align: left;
  color: rgba(255, 255, 255, 0.8);
  list-style: none;
  padding: 0;
`;

const TestItem = styled.li`
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  &:before {
    content: '✅ ';
    color: #4CAF50;
  }
`;

const ErrorTest = styled.div`
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid rgba(255, 0, 0, 0.3);
  border-radius: 10px;
  padding: 15px;
  margin-top: 20px;
`;

const TestPage = () => {
  const [backendStatus, setBackendStatus] = React.useState('Testing...');
  
  React.useEffect(() => {
    testBackendConnection();
  }, []);
  
  const testBackendConnection = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/posts');
      if (response.ok) {
        setBackendStatus('Backend Connected ✅');
      } else {
        setBackendStatus('Backend Error ❌');
      }
    } catch (error) {
      setBackendStatus('Backend Offline ❌');
    }
  };

  return (
    <Container>
      <TestCard>
        <Title>🚀 Reaper Cracked - System Test</Title>
        <Status>{backendStatus}</Status>
        
        <TestList>
          <TestItem>React App Loading</TestItem>
          <TestItem>Styled Components Working</TestItem>
          <TestItem>CSS Animations Active</TestItem>
          <TestItem>Component Rendering</TestItem>
        </TestList>
        
        <ErrorTest>
          <strong>🔧 Debug Info:</strong><br/>
          Frontend: http://localhost:3000 ✅<br/>
          Backend: http://localhost:5000 {backendStatus.includes('✅') ? '✅' : '❌'}<br/>
          Time: {new Date().toLocaleString()}
        </ErrorTest>
      </TestCard>
    </Container>
  );
};

export default TestPage;