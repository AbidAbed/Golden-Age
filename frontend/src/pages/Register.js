import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { FiUser, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'; // Removed FiKey as it's not used
import { useAuth } from '../context/AuthContext';
import { isValidPassword } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast'; // Import toast for notifications
// Removed unused QRCode and api imports

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  // background: #1a1a1a; /* Solid dark background */
`;

const RegisterCard = styled(motion.div)`
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
  
  &.error {
    border-color: #dc3545;
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

const ErrorText = styled.span`
  color: #dc3545;
  font-size: 12px;
  margin-top: 4px;
  display: block;
`;

const SubmitButton = styled(motion.button)`
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #ffd700 0%, #daa520 100%); /* Golden gradient */
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
  justify-content: center;
  align-items: center;
  margin-top: 24px;
  font-size: 14px;
  gap: 8px;
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

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    twoFactorToken: '' // Added for 2FA verification during registration
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [twoFactorSecret, setTwoFactorSecret] = useState(null);
  const [otpauthUrl, setOtpauthUrl] = useState(null);
  const [show2FAQRCode, setShow2FAQRCode] = useState(false);
  const { register, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const validateField = (name, value) => {
    switch (name) {
      case 'username':
        if (!value) return 'Username is required';
        if (value.length < 3) return 'Username must be at least 3 characters';
        if (value.length > 30) return 'Username must be less than 30 characters';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (!isValidPassword(value)) return 'Password must be at least 6 characters';
        return '';
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== formData.password) return 'Passwords do not match';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }

    if (error) setError('');
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const fieldError = validateField(name, value);
    setErrors({
      ...errors,
      [name]: fieldError
    });
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const fieldError = validateField(key, formData[key]);
      if (fieldError) {
        newErrors[key] = fieldError;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    const { confirmPassword, twoFactorToken, ...registrationData } = formData; // Exclude twoFactorToken from initial registration
    const result = await register(registrationData);

    if (result.success) {
      navigate('/verify-2fa', { 
        state: { 
          userId: result.userId, 
          secret: result.secret, 
          otpauthUrl: result.otpauthUrl,
          qrCodeUrl: result.qrCodeUrl,
          from: '/' // Redirect to home after 2FA setup
        } 
      });
    } else {
      setError(result.message);
      toast.error(result.message);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Creating account..." />;
  }

  return (
    <Container>
      <RegisterCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Logo>
          <LogoImage src="/Golden-Age.jpg" alt="Golden Age Logo" />
          <Title>Join Golden Age</Title>
          <Subtitle>Create your account to access premium software</Subtitle>
        </Logo>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <Form onSubmit={handleSubmit}>
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
              onBlur={handleBlur}
              className={errors.username ? 'error' : ''}
              autoComplete="username"
            />
            {errors.username && <ErrorText>{errors.username}</ErrorText>}
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
              onBlur={handleBlur}
              className={errors.password ? 'error' : ''}
              autoComplete="new-password"
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </PasswordToggle>
            {errors.password && <ErrorText>{errors.password}</ErrorText>}
          </InputGroup>

          <InputGroup>
            <InputIcon>
              <FiLock size={20} />
            </InputIcon>
            <PasswordInput
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.confirmPassword ? 'error' : ''}
              autoComplete="new-password"
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </PasswordToggle>
            {errors.confirmPassword && <ErrorText>{errors.confirmPassword}</ErrorText>}
          </InputGroup>

          <SubmitButton
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </SubmitButton>
        </Form>

        <LinksContainer>
          <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Already have an account?
          </span>
          <StyledLink to="/login">
            Sign In
          </StyledLink>
        </LinksContainer>
      </RegisterCard>
    </Container>
  );
};

export default Register;
