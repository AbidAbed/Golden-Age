import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { FiKey } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const Card = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 48px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
`;

const Title = styled.h1`
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 40px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const InputGroup = styled.div`
  position: relative;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.5);
  z-index: 2;
`;

const Input = styled.input`
  width: 100%;
  padding: 16px 16px 16px 48px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  font-size: 16px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #ffd700;
    box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.1);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const SubmitButton = styled(motion.button)`
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #ffd700 0%, #daa520 100%);
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.3);
  border-radius: 8px;
  padding: 12px 16px;
  color: #dc3545;
  font-size: 14px;
  margin-bottom: 20px;
`;

const TwoFactorAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, secret, otpauthUrl, qrCodeUrl, from } = location.state || {}; // Get state from navigation

  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [error, setError] = useState('');
  const { verify2FA, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    // If already authenticated, redirect to home
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
    // If no userId is provided, redirect to login (or registration if it was a registration flow)
    if (!userId) {
      toast.error('Invalid 2FA session. Please log in or register again.');
      navigate(from || '/login', { replace: true });
    }
  }, [isAuthenticated, userId, navigate, from]);

  const handleChange = (e) => {
    setTwoFactorToken(e.target.value);
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!twoFactorToken) {
      setError('Please enter your 2FA token');
      toast.error('Please enter your 2FA token');
      return;
    }

    const result = await verify2FA(userId, twoFactorToken, secret);
    if (result.success) {
      navigate(from || '/', { replace: true });
    } else {
      setError(result.message);
      toast.error(result.message);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Verifying 2FA..." />;
  }

  return (
    <Container>
      <Card
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Title>Two-Factor Authentication</Title>
        <Subtitle>
          {secret && otpauthUrl 
            ? 'Scan the QR code with your authenticator app and enter the token to enable 2FA.'
            : 'Enter your Google Authenticator code to complete your login.'
          }
        </Subtitle>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        {secret && otpauthUrl && (
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <img 
              src={qrCodeUrl || `https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=${encodeURIComponent(otpauthUrl)}`} 
              alt="QR Code" 
              style={{ display: 'block', margin: '0 auto', border: '2px solid #ffd700', borderRadius: '8px', padding: '10px', background: 'white' }}
            />
            <div style={{ marginTop: '15px', color: 'rgba(255,255,255,0.9)', fontSize: '14px', lineHeight: '1.5' }}>
              <strong>How to scan:</strong><br/>
              1. Open Google Authenticator, Authy, or similar app<br/>
              2. Tap the "+" button to add a new account<br/>
              3. Choose "Scan QR code" or "Scan barcode"<br/>
              4. Point your camera at this QR code<br/>
              5. Enter the 6-digit code below
            </div>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '10px', fontSize: '14px' }}>
              Secret: {secret}
            </p>
          </div>
        )}

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <InputIcon>
              <FiKey size={20} />
            </InputIcon>
            <Input
              type="text"
              name="twoFactorToken"
              placeholder="2FA Token"
              value={twoFactorToken}
              onChange={handleChange}
              autoComplete="off"
              maxLength="6"
            />
          </InputGroup>
          <SubmitButton
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Verifying 2FA...' : 'Verify 2FA'}
          </SubmitButton>
        </Form>
      </Card>
    </Container>
  );
};

export default TwoFactorAuth;
