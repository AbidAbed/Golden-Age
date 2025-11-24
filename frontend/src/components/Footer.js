import React from 'react';
import styled from 'styled-components';
import { FiExternalLink } from 'react-icons/fi';

const FooterContainer = styled.footer`
  background: rgba(0, 0, 0, 0.9);
  border-top: 1px solid rgba(255, 215, 0, 0.2); /* Golden border */
  padding: 40px 20px 20px;
  margin-top: 60px;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
`;

const FooterSection = styled.div`
  h3 {
    color: #ffd700;
    margin-bottom: 16px;
    font-size: 1.2rem;
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
  }
  
  p, a {
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.6;
    text-decoration: none;
    transition: color 0.3s ease;
  }
  
  a:hover {
    color: #ffd700;
  }
`;

const LinkList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  
  li {
    margin-bottom: 8px;
  }
  
  a {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 0;
    
    &:hover {
      color: #ffd700;
    }
  }
`;

const TelegramLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #ffd700 0%, #daa520 100%);
  color: #000 !important;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255, 215, 0, 0.3);
    color: #000 !important;
  }
`;

const Copyright = styled.div`
  text-align: center;
  padding-top: 20px;
  margin-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
`;

const Footer = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <h3>Golden Age</h3>
          <p>
            Your trusted source for premium cracked software, games, and tools. 
            No ads, no limits, just quality content for the community.
          </p>
          <div style={{ marginTop: '16px' }}>
            <TelegramLink 
              href="https://t.me/golden_age_MD" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <FiExternalLink size={16} />
              Join Telegram Support
            </TelegramLink>
          </div>
        </FooterSection>

        <FooterSection>
          <h3>Quick Links</h3>
          <LinkList>
            <li><a href="/">Home</a></li>
            <li><a href="/requests">Request Software</a></li>
            <li><a href="/profile">Profile</a></li>
            <li><a href="/login">Login</a></li>
          </LinkList>
        </FooterSection>

        <FooterSection>
          <h3>Community</h3>
          <LinkList>
            <li>
              <a href="https://Reaper-Market.com" target="_blank" rel="noopener noreferrer">
                <FiExternalLink size={14} />
                Official Website
              </a>
            </li>
            <li>
              <a href="https://t.me/golden_age_MD" target="_blank" rel="noopener noreferrer">
                <FiExternalLink size={14} />
                Telegram Channel
              </a>
            </li>
          </LinkList>
        </FooterSection>

        <FooterSection>
          <h3>About</h3>
          <p>
            Golden Age is dedicated to providing high-quality software distribution 
            services to the community.
          </p>
        </FooterSection>
      </FooterContent>
      
      <Copyright>
        © 2024 Golden Age. All rights reserved.
      </Copyright>
    </FooterContainer>
  );
};

export default Footer;
