import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  ${props => props.$fullScreen && `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
    z-index: 9999;
    padding: 0;
  `}
  ${props => !props.$fullScreen && `
    padding: 40px 0;
  `}
`;

const Spinner = styled.div`
  width: ${props => props.size || '50px'};
  height: ${props => props.size || '50px'};
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-left: 4px solid #ff4444;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.p`
  margin-top: 20px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  text-align: center;
`;

const LoadingSpinner = ({ 
  fullScreen = false, 
  size = '50px', 
  text = 'Loading...',
  showText = true 
}) => {
  return (
    <SpinnerContainer $fullScreen={fullScreen}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner size={size} />
        {showText && <LoadingText>{text}</LoadingText>}
      </div>
    </SpinnerContainer>
  );
};

export default LoadingSpinner;