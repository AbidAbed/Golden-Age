import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const StyledSection = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 32px;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(255, 215, 0, 0.3);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  color: #ffd700;
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SectionIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(255, 215, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffd700;
`;

const Section = ({
  title,
  icon,
  children,
  className,
  ...props
}) => {
  return (
    <StyledSection
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      {...props}
    >
      {(title || icon) && (
        <SectionHeader>
          <SectionTitle>
            {icon && <SectionIcon>{icon}</SectionIcon>}
            {title}
          </SectionTitle>
        </SectionHeader>
      )}
      {children}
    </StyledSection>
  );
};

export default Section;