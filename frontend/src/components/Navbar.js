import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { 
  FiHome, 
  FiUser, 
  FiSettings, 
  FiLogOut, 
  FiMenu, 
  FiX,
  FiShield,
  FiMessageSquare,
  FiDownload,
  FiZap
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Nav = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1000;
  padding: 0;
`;

const NavContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 70px;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: #fff;
  font-weight: 800;
  font-size: 24px;
  letter-spacing: -0.5px;
  
  &:hover {
    color: #ffd700;
    transition: color 0.3s ease;
  }
  
  span {
    background: linear-gradient(135deg, #ffffff 0%, #ffd700 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    transition: all 0.3s ease;
  }
  
  &:hover span {
    background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

const LogoImage = styled.img`
  height: 32px; /* Equivalent to h-8 */
  margin-right: 8px; /* Equivalent to mr-2 */
  object-fit: contain;
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 32px;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    color: #ffd700; /* Golden color */
    background: rgba(255, 215, 0, 0.1); /* Light golden background */
  }
  
  &.active {
    color: #ffd700; /* Golden color */
    background: rgba(255, 215, 0, 0.1); /* Light golden background */
  }
`;

const UserMenu = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffd700 0%, #daa520 100%); /* Golden gradient */
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000; /* Dark text for contrast */
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.3); /* Golden shadow */
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4); /* Enhanced golden shadow */
  }
`;

const DropdownMenu = styled(motion.div)`
  position: absolute;
  top: 50px;
  right: 0;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 8px 0;
  min-width: 200px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
`;

const DropdownItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  text-align: left;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #ffd700; /* Golden color */
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileMenu = styled(motion.div)`
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.98);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px;
  display: none;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileNavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-weight: 500;
  padding: 16px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  &:hover {
    color: #ff4444;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setShowUserMenu(false);
  };

  const getUserInitial = () => {
    return user?.username?.charAt(0)?.toUpperCase() || 'U';
  };

  return (
    <Nav>
      <NavContainer>
        <Logo to="/">
          <LogoImage src="/Golden-Age.jpg" alt="Golden Age Logo" />
          <span className="text-xl font-bold">Golden Age</span>
        </Logo>

        <NavLinks>
          <NavLink to="/">
            <FiHome size={18} />
            Home
          </NavLink>
          <NavLink to="/about">
            <FiZap size={18} />
            About
          </NavLink>
          <NavLink to="/requests">
            <FiMessageSquare size={18} />
            Requests
          </NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/dashboard">
              <FiShield size={18} />
              Dashboard
            </NavLink>
          )}
        </NavLinks>

        <UserMenu>
          {isAuthenticated ? (
            <>
              <UserAvatar 
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                {user.avatar && !avatarError ? (
                  <img 
                    src={user.avatar} 
                    alt="Avatar" 
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  getUserInitial()
                )}
              </UserAvatar>
              
              {showUserMenu && (
                <DropdownMenu
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <DropdownItem onClick={() => {
                    navigate('/profile');
                    setShowUserMenu(false);
                  }}>
                    <FiUser size={16} />
                    Profile
                  </DropdownItem>
                  {user?.role === 'admin' && (
                    <DropdownItem onClick={() => {
                      navigate('/dashboard');
                      setShowUserMenu(false);
                    }}>
                      <FiSettings size={16} />
                      Dashboard
                    </DropdownItem>
                  )}
                  <DropdownItem onClick={handleLogout}>
                    <FiLogOut size={16} />
                    Logout
                  </DropdownItem>
                </DropdownMenu>
              )}
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink 
                to="/register" 
                style={{
                  background: 'linear-gradient(135deg, #ffd700 0%, #daa520 100%)',
                  color: '#000',
                  fontWeight: 'bold',
                  padding: '8px 20px',
                  borderRadius: '8px',
                  boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)',
                  transition: 'all 0.3s ease',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 215, 0, 0.4)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 215, 0, 0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Sign Up
              </NavLink>
            </>
          )}

          <MobileMenuButton onClick={() => setShowMobileMenu(!showMobileMenu)}>
            {showMobileMenu ? <FiX /> : <FiMenu />}
          </MobileMenuButton>
        </UserMenu>
      </NavContainer>

      {showMobileMenu && (
        <MobileMenu
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <MobileNavLink to="/" onClick={() => setShowMobileMenu(false)}>
            <FiHome size={18} />
            Home
          </MobileNavLink>
          <MobileNavLink to="/about" onClick={() => setShowMobileMenu(false)}>
            <FiZap size={18} />
            About
          </MobileNavLink>
          <MobileNavLink to="/requests" onClick={() => setShowMobileMenu(false)}>
            <FiMessageSquare size={18} />
            Requests
          </MobileNavLink>
          {user?.role === 'admin' && (
            <MobileNavLink to="/dashboard" onClick={() => setShowMobileMenu(false)}>
              <FiShield size={18} />
              Dashboard
            </MobileNavLink>
          )}
          {!isAuthenticated && (
            <>
              <MobileNavLink to="/login" onClick={() => setShowMobileMenu(false)}>
                <FiUser size={18} />
                Login
              </MobileNavLink>
              <MobileNavLink to="/register" onClick={() => setShowMobileMenu(false)}>
                <FiUser size={18} /> {/* Changed icon to FiUser for consistency with Login */}
                Sign Up
              </MobileNavLink>
            </>
          )}
        </MobileMenu>
      )}
    </Nav>
  );
};

export default Navbar;
