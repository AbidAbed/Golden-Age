import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUser, 
  FiLock, 
  FiSave, 
  FiShield, 
  FiSmartphone,
  FiEye,
  FiEyeOff,
  FiCheck,
  FiX,
  FiCamera,
  FiSettings,
  FiMessageCircle
} from 'react-icons/fi';
import { FaTelegram } from 'react-icons/fa';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useUser, useUpdateUser, useGenerate2FA, useVerify2FA, useDisable2FA } from '../hooks/useAuthQueries';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';

const Container = styled.div`
  min-height: 100vh;
  padding: 90px 20px 40px;
  // background: #1a1a1a; /* Solid dark background */
`;

const Content = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  color: #ffffff;
  font-size: 3rem;
  font-weight: 700;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #daa520 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 12px;
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
  margin: 0;
`;

const ProfileGrid = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 32px;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`;

const ProfileCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 32px;
  text-align: center;
  height: fit-content;
`;

const AvatarSection = styled.div`
  position: relative;
  display: inline-block;
  margin-bottom: 24px;
`;

const Avatar = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffd700 0%, #daa520 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: 700;
  color: #000;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
`;

const AvatarEdit = styled.button`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffd700 0%, #daa520 100%);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #000;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 15px rgba(255, 215, 0, 0.5);
  }
`;

const UserInfo = styled.div`
  margin-bottom: 24px;
`;

const UserName = styled.h2`
  color: #ffffff;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 8px;
`;

const UserRole = styled.div`
  padding: 12px 20px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  background: ${props => props.$isAdmin 
    ? 'linear-gradient(135deg, #ffd700 0%, #daa520 100%)' /* Golden for admin */
    : 'linear-gradient(135deg, #6c757d 0%, #495057 100%)' /* Grey for user */
  };
  color: ${props => props.$isAdmin ? '#000' : '#fff'}; /* Dark text for golden, white for grey */
  margin-bottom: 20px;
  display: inline-block;
  box-shadow: ${props => props.$isAdmin 
    ? '0 4px 15px rgba(255, 215, 0, 0.3)' 
    : '0 4px 15px rgba(0, 0, 0, 0.2)'
  };
  border: ${props => props.$isAdmin 
    ? '2px solid rgba(255, 215, 0, 0.5)' 
    : '2px solid rgba(255, 255, 255, 0.1)'
  };
`;

const UserStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffd700;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Section = styled(motion.div)`
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

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
`;

const TwoFASection = styled.div`
  background: rgba(255, 215, 0, 0.05); /* Golden tint background */
  border: 1px solid rgba(255, 215, 0, 0.2); /* Golden border */
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
`;

const TwoFAStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const StatusBadge = styled.div`
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${props => {
    if (props.$status === 'enabled') return 'linear-gradient(135deg, #28a745 0%, #20c997 100%)'; /* Green for enabled */
    if (props.$status === 'not-setup') return 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)'; /* Yellow/Orange for not set up */
    return 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)'; /* Red for disabled */
  }};
  color: #fff;
`;

const CodeInput = styled.div`
  display: flex;
  gap: 8px;
  margin: 16px 0;
`;

const CodeDigit = styled.input`
  width: 50px;
  height: 50px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #ffd700;
    box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.2);
  }
`;

const SuccessMessage = styled(motion.div)`
  background: rgba(40, 167, 69, 0.2);
  border: 1px solid rgba(40, 167, 69, 0.3);
  border-radius: 10px;
  padding: 16px;
  color: #28a745;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
`;

const ErrorMessage = styled(motion.div)`
  background: rgba(220, 53, 69, 0.2);
  border: 1px solid rgba(220, 53, 69, 0.3);
  border-radius: 10px;
  padding: 16px;
  color: #dc3545;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
`;

const Profile = () => {
  const { user: authUser, updateUser: updateAuthUser, loading: authLoading } = useAuth();
  const { data: user, isLoading: userLoading, error: userError } = useUser();
  const updateUserMutation = useUpdateUser();
  const generate2FAMutation = useGenerate2FA();
  const verify2FAMutation = useVerify2FA();
  const disable2FAMutation = useDisable2FA();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [twoFAStep, setTwoFAStep] = useState(0); // 0: disabled, 1: sending, 2: verifying
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [profileData, setProfileData] = useState({
    username: '',
    telegramUsername: '', // Changed from 'telegram' to 'telegramUsername'
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [userStats, setUserStats] = useState({
    joinDate: '',
    lastLogin: '',
    downloadsCount: 0,
    commentsCount: 0
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    if (user && user.username) {
      setProfileData(prev => ({
        ...prev,
        username: user.username || '',
        telegramUsername: user.telegramUsername || ''
      }));
      
      setUserStats(prev => ({
        ...prev,
        joinDate: user.createdAt,
        lastLogin: user.lastLogin
      }));
    }
  }, [user?.username, user?.telegramUsername, user?.createdAt, user?.lastLogin]);

  // Show loading if user data is not available yet or auth is still loading
  // Add timeout to prevent infinite loading
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  useEffect(() => {
    if ((authLoading || userLoading) && !user) {
      const timeout = setTimeout(() => {
        setLoadingTimeout(true);
      }, 10000); // 10 second timeout
      
      return () => clearTimeout(timeout);
    } else {
      setLoadingTimeout(false);
    }
  }, [authLoading, userLoading, user]);

  if ((authLoading || userLoading) && !user && !loadingTimeout) {
    return <LoadingSpinner fullScreen text="Loading profile..." />;
  }

  if (userError) {
    return (
      <Container>
        <Content>
          <div className="text-center">
            <h2>Error loading profile</h2>
            <p>Please try refreshing the page</p>
          </div>
        </Content>
      </Container>
    );
  }

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear messages when user starts typing
    if (successMessage) setSuccessMessage('');
    if (errorMessage) setErrorMessage('');
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrorMessage('Avatar file must be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setAvatarFile(file);
      
      // Clear messages
      if (successMessage) setSuccessMessage('');
      if (errorMessage) setErrorMessage('');

      // Upload avatar immediately
      handleAvatarUpload(file);
    }
  };

  const uploadToCloudinary = async (file) => {
    try {
      // Get Cloudinary config from backend
      const configResponse = await api.get('/uploads/cloudinary-config');
      const { cloudName, uploadPreset } = configResponse.data;

      // Upload file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed with status ${uploadResponse.status}`);
      }

      const uploadData = await uploadResponse.json();
      if (!uploadData.secure_url) {
        throw new Error('Failed to upload to Cloudinary');
      }

      return uploadData.secure_url; // Return the secure URL
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  };

  const handleAvatarUpload = async (file) => {
    if (!file) return;

    try {
      setLoading(true);
      setErrorMessage('');
      setSuccessMessage('');

      // Upload to Cloudinary first
      const cloudinaryUrl = await uploadToCloudinary(file);

      // Then send URL to backend
      const response = await api.post('/uploads/avatar', { avatarUrl: cloudinaryUrl });

      updateAuthUser({ avatar: response.data.avatarUrl });
      setAvatarError(false);
      setSuccessMessage('Avatar updated successfully!');
    } catch (error) {
      console.error('Avatar upload error:', error);
      const message = error.response?.data?.message || 'Failed to upload avatar';
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const triggerAvatarUpload = () => {
    document.getElementById('avatar-upload').click();
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (updateUserMutation.isPending) return; // Prevent multiple calls
    
    if (profileData.newPassword && profileData.newPassword !== profileData.confirmPassword) {
      setErrorMessage('New passwords do not match');
      return;
    }
    
    if (profileData.newPassword && !profileData.currentPassword) {
      setErrorMessage('Current password is required to change password');
      return;
    }
    
    try {
      setErrorMessage('');
      setSuccessMessage('');
      
      // Prepare update data
      const updateData = {
        username: profileData.username,
        telegramUsername: profileData.telegramUsername // Changed from 'telegram' to 'telegramUsername'
      };
      
      if (profileData.newPassword) {
        updateData.password = profileData.newPassword;
        updateData.currentPassword = profileData.currentPassword;
      }
      
      await updateUserMutation.mutateAsync(updateData);
      
      setSuccessMessage('Profile updated successfully!');
      setProfileData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      console.error('Profile update error:', error);
      const message = error.response?.data?.message || 'Failed to update profile';
      setErrorMessage(message);
      toast.error(message);
    }
  };

  const handleGenerate2FA = async () => {
    if (generate2FAMutation.isPending) return; // Prevent multiple calls
    
    try {
      setErrorMessage('');
      setSuccessMessage('');
      
      const data = await generate2FAMutation.mutateAsync();
      
      // Update user context with the new secret and otpauthUrl
      const updatedUser = { 
        ...user, 
        twoFactorSecret: data.secret,
        otpauthUrl: data.otpauthUrl,
        qrCodeUrl: data.qrCodeUrl
      };
      updateAuthUser(updatedUser);
      
      setTwoFAStep(1); // Move to verification step
      setSuccessMessage('2FA secret generated. Please scan the QR code and verify.');
    } catch (error) {
      console.error('Generate 2FA secret error:', error);
      const message = error.response?.data?.message || 'Failed to generate 2FA secret';
      setErrorMessage(message);
      setTwoFAStep(0);
      toast.error(message);
    }
  };

  const handleVerify2FA = async () => {
    if (verify2FAMutation.isPending) return; // Prevent multiple calls
    
    const token = verificationCode.join('');
    if (token.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit code');
      return;
    }
    
    try {
      setErrorMessage('');
      setSuccessMessage('');
      
      await verify2FAMutation.mutateAsync(token);
      
      setSuccessMessage('Two-Factor Authentication enabled successfully!');
      setTwoFAStep(0);
      setVerificationCode(['', '', '', '', '', '']);
    } catch (error) {
      console.error('2FA verify error:', error);
      const message = error.response?.data?.message || 'Invalid verification code';
      setErrorMessage(message);
    }
  };

  const handleDisable2FA = async () => {
    if (disable2FAMutation.isPending) return; // Prevent multiple calls
    
    try {
      setErrorMessage('');
      setSuccessMessage('');
      
      await disable2FAMutation.mutateAsync();
      
      setSuccessMessage('Two-Factor Authentication disabled successfully!');
      setTwoFAStep(0);
    } catch (error) {
      console.error('Disable 2FA error:', error);
      const message = error.response?.data?.message || 'Failed to disable 2FA';
      setErrorMessage(message);
    }
  };

  const handleCancel2FA = async () => {
    try {
      await api.post('/auth/2fa/cancel');
      // Clear the generated secret from user state
      const updatedUser = { ...user, twoFactorSecret: null, otpauthUrl: null };
      updateAuthUser(updatedUser);
      setTwoFAStep(0);
      setVerificationCode(['', '', '', '', '', '']);
    } catch (error) {
      console.error('Cancel 2FA error:', error);
      // Still reset UI even if backend call fails
      setTwoFAStep(0);
      setVerificationCode(['', '', '', '', '', '']);
    }
  };

  const handleCodeChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);
      
      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`code-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleCodeKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Container>
      <Content>
        <Header>
          <Title>My Profile</Title>
          <Subtitle>Manage your account settings and preferences</Subtitle>
        </Header>

        <ProfileGrid>
          <ProfileCard
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <AvatarSection>
              <Avatar>
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Avatar preview" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                  />
                ) : user.avatar && !avatarError ? (
                  <img 
                    src={user.avatar} 
                    alt="Avatar" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  getInitials(user.username)
                )}
              </Avatar>
              <AvatarEdit onClick={triggerAvatarUpload}>
                <FiCamera size={16} />
              </AvatarEdit>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
            </AvatarSection>

            <UserInfo>
              <UserName>
                {user.username}
                {user.telegramUsername && (
                  <FaTelegram 
                    size={16} 
                    style={{ marginLeft: '8px', color: '#0088cc' }} 
                    title={`@${user.telegramUsername}`}
                  />
                )}
              </UserName>
              <UserRole $isAdmin={user.role === 'admin'}> {/* Check user.role */}
                {user.role === 'admin' ? 'Administrator' : 'User'}
              </UserRole>
            </UserInfo>

            <UserStats>
              <StatItem>
                <StatValue>{userStats.downloadsCount}</StatValue>
                <StatLabel>Downloads</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>{userStats.commentsCount}</StatValue>
                <StatLabel>Comments</StatLabel>
              </StatItem>
            </UserStats>
          </ProfileCard>

          <MainContent>
            <Section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <SectionHeader>
                <SectionIcon>
                  <FiUser size={20} />
                </SectionIcon>
                <SectionTitle>Profile Information</SectionTitle>
              </SectionHeader>

              <form onSubmit={handleProfileUpdate}>
                <FormGrid>
                  <FormInput
                    label="Username"
                    icon={<FiUser size={16} />}
                    type="text"
                    value={profileData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="Enter username"
                    required
                  />

                  <FormInput
                    label="Telegram Username"
                    icon={<FiMessageCircle size={16} />}
                    type="text"
                    value={profileData.telegramUsername}
                    onChange={(e) => handleInputChange('telegramUsername', e.target.value)}
                    placeholder="@username or telegram ID"
                  />
                </FormGrid>

                <div style={{ marginTop: '24px' }}>
                  <FormInput
                    label="Current Password"
                    icon={<FiLock size={16} />}
                    type={showPassword ? 'text' : 'password'}
                    value={profileData.currentPassword}
                    onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                    placeholder="Enter current password"
                    onIconClick={() => setShowPassword(!showPassword)}
                    showPasswordToggle
                    required={!!profileData.newPassword}
                  />

                  <FormInput
                    label="New Password"
                    icon={<FiLock size={16} />}
                    type={showNewPassword ? 'text' : 'password'}
                    value={profileData.newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    placeholder="Enter new password"
                    onIconClick={() => setShowNewPassword(!showNewPassword)}
                    showPasswordToggle
                  />

                  <FormInput
                    label="Confirm Password"
                    icon={<FiLock size={16} />}
                    type="password"
                    value={profileData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>

                <AnimatePresence>
                  {successMessage && (
                    <SuccessMessage
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <FiCheck size={16} />
                      {successMessage}
                    </SuccessMessage>
                  )}

                  {errorMessage && (
                    <ErrorMessage
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <FiX size={16} />
                      {errorMessage}
                    </ErrorMessage>
                  )}
                </AnimatePresence>

                <div style={{ marginTop: '24px', textAlign: 'right' }}>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={updateUserMutation.isPending}
                    onClick={() => {}}
                  >
                    <FiSave size={16} />
                    {updateUserMutation.isPending ? 'Updating...' : 'Update Profile'}
                  </Button>
                </div>
              </form>
            </Section>

            <Section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <SectionHeader>
                <SectionIcon>
                  <FiShield size={20} />
                </SectionIcon>
                <SectionTitle>Two-Factor Authentication</SectionTitle>
              </SectionHeader>

              <TwoFASection>
                <TwoFAStatus>
                  <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: '600' }}>
                  Status:
                </span>
                  <StatusBadge $status={
                    user.twoFactorEnabled ? 'enabled' : 'disabled'
                  }>
                    {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </StatusBadge>
                  {/* Debug: {JSON.stringify(user?.twoFactorEnabled)} */}
                </TwoFAStatus>

                {!user.twoFactorEnabled && twoFAStep === 0 && (
                  <>
                    <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '16px' }}>
                      Add an extra layer of security to your account by enabling two-factor authentication.
                    </p>
                    <Button
                      variant="primary"
                      onClick={handleGenerate2FA}
                      disabled={generate2FAMutation.isPending}
                    >
                      <FiSmartphone size={16} />
                      Enable 2FA
                    </Button>
                  </>
                )}

                {twoFAStep === 1 && ( /* Step 1: Display QR code and input for initial setup */
                  <>
                    <p style={{ color: 'rgba(255, 255, 255, 0.9)', marginBottom: '16px', fontWeight: '600' }}>
                      Scan the QR code with your authenticator app or enter the secret key manually:
                    </p>
                    {/* Placeholder for QR code and secret key */}
                    <div style={{ 
                      display: 'inline-block', 
                      marginBottom: '16px'
                    }}>
                      {/* QR Code using Google Charts API */}
                      {user.qrCodeUrl ? (
                        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                          <img 
                            src={user.qrCodeUrl} 
                            alt="QR Code" 
                            style={{ 
                              display: 'block', 
                              margin: '0 auto',
                              border: '2px solid #ffd700',
                              borderRadius: '8px',
                              padding: '10px',
                              background: 'white'
                            }}
                          />
                          <div style={{ marginTop: '10px', color: '#333', fontSize: '12px', lineHeight: '1.4' }}>
                            <strong>Scan with your authenticator app:</strong><br/>
                            Open Google Authenticator/Authy → Add → Scan QR code
                          </div>
                        </div>
                      ) : (
                        <div style={{ width: '160px', height: '160px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', margin: '0 auto', marginBottom: '16px' }}>
                          QR Code will appear here
                        </div>
                      )}
                    </div>
                    <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '16px', wordBreak: 'break-all' }}>
                      Secret Key: <strong>{user.twoFactorSecret}</strong>
                    </p>
                    <p style={{ color: 'rgba(255, 255, 255, 0.9)', marginBottom: '16px', fontWeight: '600' }}>
                      Then, enter the 6-digit code from your app to verify:
                    </p>
                    <CodeInput>
                      {verificationCode.map((digit, index) => (
                        <CodeDigit
                          key={index}
                          id={`code-${index}`}
                          type="text"
                          maxLength="1"
                          value={digit}
                          onChange={(e) => handleCodeChange(index, e.target.value)}
                          onKeyDown={(e) => handleCodeKeyDown(index, e)}
                        />
                      ))}
                    </CodeInput>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <Button
                        variant="primary"
                        onClick={handleVerify2FA}
                        disabled={verify2FAMutation.isPending || verificationCode.join('').length !== 6}
                      >
                        <FiCheck size={16} />
                        Verify & Enable
                      </Button>
                      <Button
                        onClick={handleCancel2FA}
                      >
                        <FiX size={16} />
                        Cancel
                      </Button>
                    </div>
                  </>
                )}

                {user.twoFactorEnabled && twoFAStep === 0 && (
                  <>
                    <div style={{ color: 'rgba(40, 167, 69, 1)', fontWeight: '600', marginBottom: '16px' }}>
                      ✓ Your account is protected with two-factor authentication
                    </div>
                    <Button
                      variant="danger"
                      onClick={handleDisable2FA}
                      disabled={disable2FAMutation.isPending}
                    >
                      <FiX size={16} />
                      Disable 2FA
                    </Button>
                  </>
                )}
              </TwoFASection>
            </Section>

            <Section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <SectionHeader>
                <SectionIcon>
                  <FiSettings size={20} />
                </SectionIcon>
                <SectionTitle>Account Information</SectionTitle>
              </SectionHeader>

              <FormGrid>
                <div>
                  <div style={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: '600',
                    fontSize: '14px',
                    marginBottom: '8px'
                  }}>
                    Member Since
                  </div>
                  <div style={{
                    padding: '14px 16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '10px',
                    color: 'rgba(255, 255, 255, 0.9)',
                    border: '2px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    {formatDate(user.joinedAt)}
                  </div>
                </div>

                <div>
                  <div style={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: '600',
                    fontSize: '14px',
                    marginBottom: '8px'
                  }}>
                    Last Login
                  </div>
                  <div style={{
                    padding: '14px 16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '10px',
                    color: 'rgba(255, 255, 255, 0.9)',
                    border: '2px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    {formatDate(user.lastLogin)}
                  </div>
                </div>
              </FormGrid>
            </Section>
          </MainContent>
        </ProfileGrid>
      </Content>
    </Container>
  );
};

export default Profile;
