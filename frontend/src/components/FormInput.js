import React from 'react';
import styled from 'styled-components';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const InputWrapper = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  padding-right: ${props => props.$hasIcon ? '45px' : '16px'};
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  font-size: 16px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #ffd700;
    box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.2);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const InputIcon = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 4px;

  &:hover {
    color: #ffd700;
  }
`;

const FormInput = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  icon,
  onIconClick,
  required = false,
  showPasswordToggle = false,
  ...props
}) => {
  const isPassword = type === 'password' || showPasswordToggle;
  const showEyeIcon = isPassword && onIconClick;

  return (
    <FormGroup>
      {label && <Label>{icon && <span style={{ marginRight: '8px' }}>{icon}</span>}{label}</Label>}
      <InputWrapper>
        <Input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          $hasIcon={!!(icon || showEyeIcon)}
          required={required}
          {...props}
        />
        {showEyeIcon && (
          <InputIcon
            type="button"
            onClick={onIconClick}
          >
            {type === 'password' ? <FiEye size={16} /> : <FiEyeOff size={16} />}
          </InputIcon>
        )}
      </InputWrapper>
    </FormGroup>
  );
};

export default FormInput;