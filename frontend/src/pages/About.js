import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiDownload, 
  FiShield, 
  FiZap, 
  FiUsers, 
  FiStar, 
  FiHeart,
  FiTrendingUp,
  FiGift,
  FiClock,
  FiCheckCircle,
  FiMessageCircle
} from 'react-icons/fi';
import api from '../utils/api';

const Container = styled.div`
  min-height: 100vh;
  padding: 90px 20px 40px;
  // background: #1a1a1a; /* Solid dark background */
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Hero = styled.section`
  text-align: center;
  margin-bottom: 80px;
`;

const Title = styled(motion.h1)`
  color: #ffffff;
  font-size: 4rem;
  font-weight: 700;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #daa520 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled(motion.p)`
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.3rem;
  max-width: 600px;
  margin: 0 auto 40px;
  line-height: 1.6;
`;

const StatsGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 30px;
  margin-bottom: 80px;
`;

const StatCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 20px;
  padding: 30px;
  text-align: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #ffd700, #ffed4e, #daa520);
  }
`;

const StatIcon = styled.div`
  font-size: 2.5rem;
  color: #ffd700;
  margin-bottom: 16px;
`;

const StatNumber = styled.h3`
  color: #ffffff;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 8px;
`;

const StatLabel = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  margin: 0;
`;

const FeaturesSection = styled.section`
  margin-bottom: 80px;
`;

const SectionTitle = styled.h2`
  color: #ffffff;
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 50px;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #daa520 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
`;

const FeatureCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 40px;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: rgba(255, 215, 0, 0.4);
    transform: translateY(-5px);
  }
`;

const FeatureIcon = styled.div`
  font-size: 3rem;
  color: #ffd700;
  margin-bottom: 20px;
`;

const FeatureTitle = styled.h3`
  color: #ffffff;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 16px;
`;

const FeatureDescription = styled.p`
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
  margin: 0;
`;

const WhyChooseSection = styled.section`
  background: rgba(255, 215, 0, 0.05);
  border-radius: 30px;
  padding: 60px;
  margin-bottom: 80px;
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 40px 20px;
  }
`;

const BenefitsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  margin-top: 40px;
`;

const BenefitItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 16px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
`;

const CheckIcon = styled.div`
  color: #ffd700;
  font-size: 1.5rem;
  flex-shrink: 0;
`;

const CallToAction = styled.section`
  text-align: center;
  padding: 60px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 237, 78, 0.1) 100%);
  border-radius: 30px;
  border: 1px solid rgba(255, 215, 0, 0.2);
`;

const CTAButton = styled(motion.button)`
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  border: none;
  border-radius: 15px;
  padding: 18px 40px;
  color: #000000;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: 30px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(255, 215, 0, 0.3);
  }
`;

const About = () => {
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalDownloads: 0,
    totalUsers: 0,
    totalComments: 0,
    featuredPosts: 0,
    featuredDownloads: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/posts/statistics');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const statsDisplay = [
    { icon: <FiDownload />, number: stats.totalDownloads.toLocaleString(), label: 'Total Downloads' },
    { icon: <FiUsers />, number: stats.totalUsers.toLocaleString(), label: 'Community Members' },
    { icon: <FiStar />, number: stats.totalPosts.toLocaleString(), label: 'Exclusive Assets' },
    { icon: <FiMessageCircle />, number: stats.totalComments.toLocaleString(), label: 'Community Comments' }
  ];

  const features = [
    {
      icon: <FiShield />,
      title: 'Safe & Secure',
      description: 'All software is tested and verified to be clean and safe. No malware, no ads, just pure software.'
    },
    {
      icon: <FiZap />,
      title: 'Lightning Fast',
      description: 'High-speed downloads with multiple server locations. Get your software quickly without delays.'
    },
    {
      icon: <FiGift />,
      title: 'Completely Free',
      description: 'No hidden costs, no premium subscriptions. Everything is free for our community members.'
    },
    {
      icon: <FiTrendingUp />,
      title: 'Always Updated',
      description: 'Latest versions of software with regular updates. Stay current with the newest features.'
    },
    {
      icon: <FiUsers />,
      title: 'Community Driven',
      description: 'Request software you need. Our community helps each other discover and share great tools.'
    },
    {
      icon: <FiClock />,
      title: '24/7 Availability',
      description: 'Download anytime, anywhere. Our servers are always online and ready to serve you.'
    }
  ];

  const benefits = [
    'No ads or bloatware',
    'Instant download access',
    'Regular security scans',
    'Community support',
    'Request new software',
    'Rating & review system'
  ];

  return (
    <Container>
      <Content>
        <Hero>
          <Title
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Welcome to Golden Age
          </Title>
          <Subtitle
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Welcome to Golden Age, your premier destination for exclusive, secure, and high-quality digital assets.
            We are dedicated to providing a curated collection of software, tools, and resources,
            backed by a vibrant community and robust security.
          </Subtitle>
        </Hero>

        <StatsGrid
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {statsDisplay.map((stat, index) => (
            <StatCard
              key={index}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <StatIcon>{stat.icon}</StatIcon>
              <StatNumber>{stat.number}</StatNumber>
              <StatLabel>{stat.label}</StatLabel>
            </StatCard>
          ))}
        </StatsGrid>

        <FeaturesSection>
          <SectionTitle>Why Choose Golden Age?</SectionTitle>
          <FeaturesGrid>
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <FeatureIcon>{feature.icon}</FeatureIcon>
                <FeatureTitle>{feature.title}</FeatureTitle>
                <FeatureDescription>{feature.description}</FeatureDescription>
              </FeatureCard>
            ))}
          </FeaturesGrid>
        </FeaturesSection>

        <WhyChooseSection>
          <SectionTitle>What You Get</SectionTitle>
          <BenefitsList>
            {benefits.map((benefit, index) => (
              <BenefitItem
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <CheckIcon>
                  <FiCheckCircle />
                </CheckIcon>
                {benefit}
              </BenefitItem>
            ))}
          </BenefitsList>
        </WhyChooseSection>

        <CallToAction>
          <SectionTitle>Ready to Get Started?</SectionTitle>
          <Subtitle>
            Join thousands of users who trust Golden Age for their software needs.
            Start exploring our collection today!
          </Subtitle>
          <CTAButton
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/'}
          >
            Explore Software Collection
          </CTAButton>
        </CallToAction>
      </Content>
    </Container>
  );
};

export default About;
