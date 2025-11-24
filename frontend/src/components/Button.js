import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const StyledButton = styled(motion.button)`
  padding: 14px 28px;
  background: ${props => {
    if (props.variant === 'primary') return 'linear-gradient(135deg, #ffd700 0%, #daa520 100%)';
    if (props.variant === 'danger') return 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)';
    if (props.variant === 'success') return 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
    return 'rgba(255, 255, 255, 0.1)';
  }};
  color: ${props => {
    if (props.variant === 'primary') return '#000';
    return '#fff';
  }};
  border: ${props => props.variant === 'primary' ? 'none' : '2px solid rgba(255, 255, 255, 0.2)'};
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  justify-content: center;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => {
      if (props.variant === 'primary') return '0 8px 25px rgba(255, 215, 0, 0.4)';
      if (props.variant === 'danger') return '0 8px 25px rgba(220, 53, 69, 0.4)';
      if (props.variant === 'success') return '0 8px 25px rgba(40, 167, 69, 0.4)';
      return '0 8px 25px rgba(255, 255, 255, 0.1)';
    }};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  &:active {
    transform: translateY(0);
  }
`;

const Button = ({
  children,
  variant = 'secondary',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  ...props
}) => {
  return (
    <StyledButton
      variant={variant}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </StyledButton>
  );
};

export default Button;