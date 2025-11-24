import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { FiUser, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast'; // Import toast for notifications

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  // background: #1a1a1a; /* Solid dark background */
`;

const LoginCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 48px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const LogoImage = styled.img`
  width: 80px; /* Increased size for better visibility */
  height: 80px; /* Increased size for better visibility */
  object-fit: contain;
  margin: 0 auto 16px;
  border-radius: 12px; /* Slightly rounded corners */
  box-shadow: 0 8px 20px rgba(255, 215, 0, 0.3), 0 0 30px rgba(255, 215, 0, 0.2); /* Golden glow effect */
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05); /* Subtle zoom on hover */
    box-shadow: 0 12px 30px rgba(255, 215, 0, 0.4), 0 0 40px rgba(255, 215, 0, 0.3);
  }
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
    border-color: #ffd700; /* Golden border on focus */
    box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.1); /* Golden shadow on focus */
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const PasswordInput = styled(Input)`
  padding-right: 48px;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: color 0.3s ease;
  
  &:hover {
    color: #ffd700; /* Golden color on hover */
  }
`;

const SubmitButton = styled(motion.button)`
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #ffd700 0%, #daa520 100%); /* Golden gradient */
  border: none;
  border-radius: 12px;
  color: #000; /* Dark text for contrast */
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4); /* Golden shadow on hover */
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const LinksContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  font-size: 14px;
`;

const StyledLink = styled(Link)`
  color: #ffd700; /* Golden link color */
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
  
  &:hover {
    color: #ffed4e; /* Lighter golden on hover */
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

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      toast.error('Please fill in all fields');
      return;
    }

    const result = await login({ username: formData.username, password: formData.password });

    if (result.success) {
      if (result.need2fa) {
        navigate('/verify-2fa', { state: { userId: result.userId, from: from } });
      } else {
        navigate(from, { replace: true });
      }
    } else {
      setError(result.message);
      toast.error(result.message);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Logging in..." />;
  }

  return (
    <Container>
      <LoginCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Logo>
          <LogoImage src="/Golden-Age.jpg" alt="Golden Age Logo" />
          <Title>Welcome Back</Title>
          <Subtitle>Sign in to access premium software</Subtitle>
        </Logo>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <Form onSubmit={handleLoginSubmit}>
          <InputGroup>
            <InputIcon>
              <FiUser size={20} />
            </InputIcon>
            <Input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              autoComplete="username"
            />
          </InputGroup>

          <InputGroup>
            <InputIcon>
              <FiLock size={20} />
            </InputIcon>
            <PasswordInput
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </PasswordToggle>
          </InputGroup>

          <SubmitButton
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </SubmitButton>
        </Form>

        <LinksContainer>
          <StyledLink to="/register">
            Create Account
          </StyledLink>
        </LinksContainer>
      </LoginCard>
    </Container>
  );
};

export default Login;
