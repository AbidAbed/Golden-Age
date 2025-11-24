import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FiDownload, FiShield, FiZap, FiUsers } from 'react-icons/fi';

const HeroContainer = styled.section`
  // background: #1a1a1a; /* Dark background to match the reference */
  padding: 80px 0;
  position: relative;
  overflow: hidden;
`;

const HeroBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 20%, rgba(255, 215, 0, 0.1) 0%, transparent 50%), /* Golden gradient */
    radial-gradient(circle at 80% 80%, rgba(218, 165, 32, 0.1) 0%, transparent 50%), /* Darker golden gradient */
    radial-gradient(circle at 50% 50%, rgba(184, 134, 11, 0.05) 0%, transparent 50%); /* Even darker golden gradient */
`;

const HeroContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
  position: relative;
  z-index: 2;
`;

const HeroTitle = styled(motion.h1)`
  font-size: 4rem;
  font-weight: 900;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #daa520 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 24px;
  line-height: 1.1;
  text-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const HeroSubtitle = styled(motion.p)`
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 40px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.4;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const CTAContainer = styled(motion.div)`
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-bottom: 60px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const CTAButton = styled(motion.a)`
  padding: 16px 32px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &.primary {
    background: linear-gradient(135deg, #ffd700 0%, #daa520 100%);
    color: #000;
    box-shadow: 0 8px 25px rgba(255, 215, 0, 0.3);
  }
  
  &.secondary {
    background: transparent;
    border: 2px solid #ffd700;
    color: #ffd700;
  }
  
  &:hover {
    transform: translateY(-3px);
  }
  
  &.primary:hover {
    box-shadow: 0 12px 35px rgba(255, 215, 0, 0.4);
  }
  
  &.secondary:hover {
    background: #ffd700;
    color: #000;
  }
`;

const FeaturesGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  margin-top: 60px;
`;

const FeatureCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 32px 24px;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 215, 0, 0.2); /* Golden border on hover */
  }
`;

const FeatureIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: linear-gradient(135deg, #ffd700 0%, #daa520 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: #000;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
`;

const FeatureTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 12px;
`;

const FeatureDescription = styled.p`
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
  font-size: 14px;
`;

const Hero = () => {
  return (
    <HeroContainer>
      <HeroBackground />
      <HeroContent>
        <HeroTitle
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Golden Age
          <br />
          Professional Software
        </HeroTitle>
        
        <HeroSubtitle
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Your gateway to exclusive, high-performance software.
          Experience seamless access, robust security, and a vibrant community.
        </HeroSubtitle>
        
        <CTAContainer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <CTAButton
            as={motion(Link)}
            to="/browse"
            className="primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiDownload size={20} />
            Browse Software
          </CTAButton>
          
          <CTAButton
            as={motion(Link)}
            to="/requests"
            className="secondary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiZap size={20} />
            Request Software
          </CTAButton>
        </CTAContainer>
        
        <FeaturesGrid
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <FeatureCard
            whileHover={{ y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <FeatureIcon>
              <FiShield size={24} />
            </FeatureIcon>
            <FeatureTitle>100% Safe</FeatureTitle>
            <FeatureDescription>
            Every piece of software is rigorously vetted for security and performance.
            Your digital safety is our top priority.
            </FeatureDescription>
          </FeatureCard>
          
          <FeatureCard
            whileHover={{ y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <FeatureIcon>
              <FiZap size={24} />
            </FeatureIcon>
            <FeatureTitle>Lightning Fast</FeatureTitle>
            <FeatureDescription>
            Enjoy blazing-fast, direct downloads without interruptions.
            Get what you need, when you need it, instantly.
            </FeatureDescription>
          </FeatureCard>
          
          <FeatureCard
            whileHover={{ y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <FeatureIcon>
              <FiDownload size={24} />
            </FeatureIcon>
            <FeatureTitle>Ad-Free Experience</FeatureTitle>
            <FeatureDescription>
            Immerse yourself in a pristine, ad-free environment.
            Your focus remains undisturbed, your experience uncompromised.
            </FeatureDescription>
          </FeatureCard>
          
          <FeatureCard
            whileHover={{ y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <FeatureIcon>
              <FiUsers size={24} />
            </FeatureIcon>
            <FeatureTitle>Community Driven</FeatureTitle>
            <FeatureDescription>
            Join a thriving community. Request new software, share insights,
            and shape the future of premium digital tools.
            </FeatureDescription>
          </FeatureCard>
        </FeaturesGrid>
      </HeroContent>
    </HeroContainer>
  );
};

export default Hero;
