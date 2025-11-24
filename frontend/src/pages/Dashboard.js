import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiDownload, 
  FiEye, 
  FiUsers, 
  FiPackage,
  FiSettings,
  FiUpload,
  FiImage,
  FiVideo,
  FiFile,
  FiSave,
  FiX,
  FiSearch,
  FiMessageSquare,
  FiStar
} from 'react-icons/fi';
import { FaTelegram } from 'react-icons/fa';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import toast from 'react-hot-toast';
import { formatDate } from '../utils/helpers';

const Container = styled.div`
  min-height: 100vh;
  padding: 90px 20px 40px;
  // background: #1a1a1a; /* Solid dark background */
`;

const Content = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  flex-wrap: wrap;
  gap: 20px;
`;

const Title = styled.h1`
  color: #ffffff;
  font-size: 3rem;
  font-weight: 700;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #daa520 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
`;

const QuickActions = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const ActionButton = styled(motion.button)`
  padding: 12px 20px;
  background: ${props => props.primary 
    ? 'linear-gradient(135deg, #ffd700 0%, #daa520 100%)' 
    : 'rgba(255, 255, 255, 0.1)'
  };
  color: ${props => props.primary ? '#000' : '#fff'};
  border: ${props => props.primary ? 'none' : '2px solid rgba(255, 255, 255, 0.2)'};
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.primary 
      ? '0 8px 25px rgba(255, 215, 0, 0.4)' 
      : '0 8px 25px rgba(255, 255, 255, 0.1)'
    };
  }
`;

const TabBar = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 8px;
  margin-bottom: 32px;
  gap: 4px;
  overflow-x: auto;
`;

const Tab = styled(motion.button)`
  padding: 12px 24px;
  background: ${props => props.active 
    ? 'linear-gradient(135deg, #ffd700 0%, #daa520 100%)' 
    : 'transparent'
  };
  color: ${props => props.active ? '#000' : 'rgba(255, 255, 255, 0.7)'};
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  white-space: nowrap;
  
  &:hover {
    color: ${props => props.active ? '#000' : '#ffd700'};
    background: ${props => props.active 
      ? 'linear-gradient(135deg, #ffd700 0%, #daa520 100%)' 
      : 'rgba(255, 215, 0, 0.1)'
    };
  }
`;

const TabContent = styled(motion.div)`
  min-height: 400px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const StatCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 215, 0, 0.1);
    border-color: rgba(255, 215, 0, 0.3);
  }
`;

const StatIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: linear-gradient(135deg, #ffd700 0%, #daa520 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: #000;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffd700;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  font-weight: 500;
`;

const Section = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 32px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
`;

const SectionTitle = styled.h2`
  color: #ffd700;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const FilterBar = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 200px;
  padding: 12px 16px;
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

const FilterSelect = styled.select`
  padding: 12px 16px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #ffd700;
    box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.2);
  }
  
  option {
    background: rgba(26, 26, 26, 0.95) !important;
    color: #ffffff !important;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
`;

const Card = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 215, 0, 0.1);
    border-color: rgba(255, 215, 0, 0.3);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 12px;
`;

const CardTitle = styled.h3`
  color: #ffffff;
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
  flex: 1;
  line-height: 1.3;
`;

const CardActions = styled.div`
  display: flex;
  gap: 8px;
`;

const IconButton = styled(motion.button)`
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: ${props => {
    if (props.variant === 'edit') return 'rgba(255, 215, 0, 0.2)';
    if (props.variant === 'delete') return 'rgba(220, 53, 69, 0.2)';
    if (props.variant === 'view') return 'rgba(32, 201, 151, 0.2)';
    return 'rgba(255, 255, 255, 0.1)';
  }};
  color: ${props => {
    if (props.variant === 'edit') return '#ffd700';
    if (props.variant === 'delete') return '#dc3545';
    if (props.variant === 'view') return '#20c997';
    return 'rgba(255, 255, 255, 0.7)';
  }};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
    background: ${props => {
      if (props.variant === 'edit') return '#ffd700';
      if (props.variant === 'delete') return '#dc3545';
      if (props.variant === 'view') return '#20c997';
      return 'rgba(255, 255, 255, 0.2)';
    }};
    color: ${props => {
      if (props.variant === 'edit') return '#000';
      if (props.variant === 'delete') return '#fff';
      if (props.variant === 'view') return '#fff';
      return '#fff';
    }};
  }
`;

const CardMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const Badge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${props => {
    if (props.type === 'category') return 'linear-gradient(135deg, #ffd700 0%, #daa520 100%)';
    if (props.type === 'admin') return 'linear-gradient(135deg, #ffd700 0%, #daa520 100%)'; // Golden for admin
    if (props.type === 'featured') return 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
    return 'rgba(255, 255, 255, 0.1)';
  }};
  color: ${props => (props.type === 'category' || props.type === 'admin') ? '#000' : '#fff'}; // Dark text for golden badges
`;

const CardDescription = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
`;

const UserAvatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffd700 0%, #daa520 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: #000;
  margin-right: 12px;
  flex-shrink: 0;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
`;

const UploadForm = styled(motion.form)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 32px;
`;

const UserForm = styled(motion.form)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 32px;
`;

const FormTitle = styled.h2`
  color: #ffd700;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  font-size: 14px;
`;

const Input = styled.input`
  padding: 14px 16px;
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

const TextArea = styled.textarea`
  padding: 14px 16px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  font-size: 16px;
  font-family: inherit;
  resize: vertical;
  min-height: 120px;
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

const Select = styled.select`
  padding: 14px 16px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #ffd700;
    box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.2);
  }
  
  option {
    background: rgba(26, 26, 26, 0.95) !important;
    color: #ffffff !important;
  }
`;

const FileUploadSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const FileUploadBox = styled.div`
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    border-color: #ffd700;
    background: rgba(255, 215, 0, 0.05);
  }
  
  input {
    display: none;
  }
`;

const FileUploadIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255, 215, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  color: #ffd700;
`;

const FileUploadText = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  font-weight: 500;
`;

const FormActions = styled.div`
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  flex-wrap: wrap;
`;

const SubmitButton = styled(motion.button)`
  padding: 16px 32px;
  background: linear-gradient(135deg, #ffd700 0%, #daa520 100%);
  color: #000;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, #ffed4e 0%, #ffd700 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const CancelButton = styled(motion.button)`
  padding: 16px 32px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
`;

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredComments, setFilteredComments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [commentSearchTerm, setCommentSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [commentCurrentPage, setCommentCurrentPage] = useState(1);
  const [commentTotalPages, setCommentTotalPages] = useState(1);
  const [userSearchInput, setUserSearchInput] = useState('');
  const [commentSearchInput, setCommentSearchInput] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [stats, setStats] = useState({
    totalPosts: 0,
    totalUsers: 0,
    totalDownloads: 0,
    totalRatings: 0,
    averageRating: 0,
    ratedPosts: 0
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'software',
    tags: '',
    version: '',
    requirements: ''
  });

  const [userFormData, setUserFormData] = useState({
    username: '',
    // email: '', // Removed email as per task requirement
    password: '',
    role: 'user', // Changed isAdmin to role
    // fullName: '', // Removed fullName as it's not in the User model
    telegramUsername: '' // Changed telegram to telegramUsername
  });

  const [files, setFiles] = useState({
    screenshots: [],
    video: null,
    software: null
  });

  useEffect(() => {
    if (activeTab === 'overview' || activeTab === 'software') {
      fetchPosts();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'comments') {
      fetchComments();
    }
    fetchStats();
  }, [activeTab]);

  useEffect(() => {
    filterPosts();
  }, [posts, searchTerm, categoryFilter]);

  useEffect(() => {
    filterUsers();
  }, [users, userSearchTerm, userRoleFilter]);

  useEffect(() => {
    filterComments();
  }, [comments, commentSearchTerm]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/posts?limit=50'); // Increased limit for admin view
      setPosts(response.data.posts || []);
    } catch (error) {
      console.error('Fetch posts error:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        search: userSearchTerm,
        role: userRoleFilter
      };
      const response = await api.get('/auth/users', { params });
      setUsers(response.data.users || []);
      setUserTotalPages(response.data.totalPages || 1);
      setUserCurrentPage(response.data.currentPage || 1);
    } catch (error) {
      console.error('Fetch users error:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 20,
        search: commentSearchTerm
      };
      const response = await api.get('/comments/admin/all', { params });
      setComments(response.data.comments || []);
      setCommentTotalPages(response.data.totalPages || 1);
      setCommentCurrentPage(response.data.currentPage || 1);
    } catch (error) {
      console.error('Fetch comments error:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/posts/admin/statistics');
      const statsData = response.data;
      setStats({
        totalPosts: statsData.overview.totalPosts,
        totalUsers: statsData.overview.totalUsers,
        totalDownloads: statsData.overview.totalDownloads,
        totalRatings: statsData.overview.totalRatings || 0,
        averageRating: statsData.overview.averageRating || 0,
        ratedPosts: statsData.overview.ratedPosts || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filterPosts = () => {
    let filtered = posts;
    
    if (searchTerm) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(post => post.category === categoryFilter);
    }
    
    setFilteredPosts(filtered);
  };

  const filterUsers = () => {
    let filtered = users;
    
    if (userSearchTerm) {
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        (user.telegramUsername && user.telegramUsername.toLowerCase().includes(userSearchTerm.toLowerCase()))
      );
    }
    
    if (userRoleFilter !== 'all') {
      filtered = filtered.filter(user => 
        userRoleFilter === 'admin' ? user.role === 'admin' : user.role === 'user' // Filter by role
      );
    }
    
    setFilteredUsers(filtered);
  };

  const filterComments = () => {
    // Since search is done server-side, just use comments as-is
    setFilteredComments(comments);
  };

  // Helper function to get Gofile server
  const getGofileServer = async () => {
    const response = await fetch('https://api.gofile.io/servers');
    const data = await response.json();
    if (data.status === 'ok' && data.data.servers && data.data.servers.length > 0) {
      return data.data.servers[0].name; // Use the first available server
    }
    throw new Error('Failed to get Gofile server');
  };

  // Helper function to upload to Gofile
  const uploadToGofile = async (file, token) => {
    const server = await getGofileServer();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('token', token);

    const response = await fetch(`https://${server}.gofile.io/uploadFile`, {
      method: 'POST',
      body: formData,
    });

    let data;
    const responseText = await response.text();
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Gofile upload failed: ${responseText}`);
    }
    
    if (data.status === 'ok') {
      return {
        url: data.data.downloadPage,
        gofileId: data.data.id,
        originalName: data.data.name,
        size: data.data.size,
        mimetype: data.data.mimetype,
        hash: data.data.md5,
        createTime: data.data.createTime,
        type: 'software'
      };
    }
    throw new Error(`Gofile upload failed: ${JSON.stringify(data)}`);
  };

  // Helper function to upload to Cloudinary
  const uploadToCloudinary = async (file, config, resourceType = 'image') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', config.uploadPreset);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/${resourceType}/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (data.secure_url) {
      return data.secure_url;
    }
    throw new Error('Cloudinary upload failed');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      // Prepare post data
      const newPostData = { ...formData };
      newPostData.tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      
      if (editingPost) {
        // For editing, just update text fields and keep existing files
        console.log('Updating post:', editingPost._id, 'with data:', newPostData);
        try {
          await api.put(`/posts/${editingPost._id}`, newPostData);
          console.log('Post updated successfully');
          toast.success('Post updated successfully!');
          fetchPosts(); // Refresh the posts list
          resetForm(); // Reset form after successful edit
        } catch (editError) {
          console.error('Edit error:', editError);
          toast.error(`Failed to update post: ${editError.response?.data?.message || editError.message}`);
          return; // Don't continue if edit fails
        }
      } else {
        // For new posts, get credentials and upload files first
        const [gofileTokenResponse, cloudinaryConfigResponse] = await Promise.all([
          api.get('/uploads/gofile-token'),
          api.get('/uploads/cloudinary-config')
        ]);
        
        const gofileToken = gofileTokenResponse.data.token;
        const cloudinaryConfig = cloudinaryConfigResponse.data;
        
        // Upload files and collect URLs
        const gofileLinks = [];
        const screenshots = [];
        const videos = [];
        
        // Upload software to Gofile
        if (files.software) {
          const softwareUpload = await uploadToGofile(files.software, gofileToken);
          gofileLinks.push({
            ...softwareUpload,
            type: 'software'
          });
        }
        
        // Upload screenshots to Cloudinary
        for (const screenshot of files.screenshots) {
          const screenshotUrl = await uploadToCloudinary(screenshot, cloudinaryConfig, 'image');
          screenshots.push(screenshotUrl);
        }
        
        // Upload video to Cloudinary
        if (files.video) {
          const videoUrl = await uploadToCloudinary(files.video, cloudinaryConfig, 'video');
          videos.push(videoUrl);
        }
        
        // Add file URLs to post data
        newPostData.gofileLinks = gofileLinks;
        newPostData.screenshots = screenshots;
        newPostData.videos = videos;
        
        // Create new post
        await api.post('/posts', newPostData);
        toast.success('Post created successfully!');
        resetForm(); // Only reset for new posts
      }
      
      fetchPosts();
    } catch (error) {
      console.error('Form submit error:', error);
      toast.error('Failed to save post');
    } finally {
      setSubmitting(false);
    }
  };  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'software',
      tags: '',
      version: '',
      requirements: ''
    });
    setFiles({
      screenshots: [],
      video: null,
      software: null
    });
    setShowUploadForm(false);
    setEditingPost(null);
  };

  const resetUserForm = () => {
    setUserFormData({
      username: '',
      // email: '', // Removed email
      password: '',
      role: 'user', // Changed isAdmin to role
      // fullName: '', // Removed fullName
      telegramUsername: '' // Changed telegram to telegramUsername
    });
    setShowUserForm(false);
    setEditingUser(null);
  };

  const handleEdit = (post) => {
    console.log('handleEdit called with post:', post);
    setFormData({
      title: post.title,
      description: post.description,
      category: post.category,
      tags: post.tags?.join(', ') || '',
      // fileSize: post.fileSize || '', // Removed fileSize
      version: post.version || '1.0',
      requirements: post.requirements || ''
    });
    setEditingPost(post);
    setShowUploadForm(true);
    console.log('showUploadForm set to true, editingPost:', post);
    
    // Scroll to the form
    setTimeout(() => {
      const formElement = document.querySelector('form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post? This will also delete associated files from Gofile.io.')) return;
    
    try {
      const postToDelete = posts.find(p => p._id === postId);
      if (postToDelete && postToDelete.gofileLinks) {
        for (const link of postToDelete.gofileLinks) {
          await api.delete(`/uploads/${postId}/${link.gofileId}`); // Delete from Gofile.io and from post
        }
      }
      await api.delete(`/posts/${postId}`); // Delete the post itself
      setPosts(prev => prev.filter(p => p._id !== postId));
      toast.success('Post and associated files deleted successfully!');
    } catch (error) {
      console.error('Delete post error:', error);
      toast.error('Failed to delete post or associated files');
    }
  };

  const handleFileChange = (type, files) => {
    setFiles(prev => ({
      ...prev,
      [type]: type === 'screenshots' ? Array.from(files) : files[0]
    }));
  };

  const handleUserFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      // Filter out empty password for edit operations
      const submitData = { ...userFormData };
      if (editingUser && !submitData.password) {
        delete submitData.password;
      }

      let response;
      if (editingUser) {
        response = await api.put(`/auth/users/${editingUser._id}`, submitData);
        toast.success('User updated successfully!');
      } else {
        response = await api.post('/auth/users', submitData);
        toast.success('User created successfully!');
      }
      
      fetchUsers();
      resetUserForm();
    } catch (error) {
      console.error('User form submit error:', error);
      toast.error(error.response?.data?.message || 'Failed to save user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUserEdit = (user) => {
    setUserFormData({
      username: user.username,
      // email: user.email, // Removed email
      password: '',
      role: user.role, // Changed isAdmin to role
      // fullName: user.fullName || '', // Removed fullName
      telegramUsername: user.telegramUsername || '' // Changed telegram to telegramUsername
    });
    setEditingUser(user);
    setShowUserForm(true);
  };

  const handleUserDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await api.delete(`/auth/users/${userId}`);
      setUsers(prev => prev.filter(u => u._id !== userId));
      toast.success('User deleted successfully!');
    } catch (error) {
      console.error('Delete user error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleCommentDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      await api.delete(`/comments/admin/${commentId}`);
      setComments(prev => prev.filter(c => c._id !== commentId));
      toast.success('Comment deleted successfully!');
    } catch (error) {
      console.error('Delete comment error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete comment');
    }
  };

  const handleUserSearch = () => {
    setUserSearchTerm(userSearchInput);
    setUserCurrentPage(1);
    fetchUsers(1);
  };

  const handleCommentSearch = () => {
    setCommentSearchTerm(commentSearchInput);
    setCommentCurrentPage(1);
    fetchComments(1);
  };

  const handleUserPageChange = (page) => {
    setUserCurrentPage(page);
    fetchUsers(page);
  };

  const handleCommentPageChange = (page) => {
    setCommentCurrentPage(page);
    fetchComments(page);
  };

  const renderOverview = () => (
    <TabContent>
      <StatsGrid>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatIcon>
            <FiPackage size={24} />
          </StatIcon>
          <StatValue>{stats.totalPosts}</StatValue>
          <StatLabel>Total Software</StatLabel>
        </StatCard>
        
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatIcon>
            <FiUsers size={24} />
          </StatIcon>
          <StatValue>{stats.totalUsers.toLocaleString()}</StatValue>
          <StatLabel>Total Users</StatLabel>
        </StatCard>
        
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <StatIcon>
            <FiDownload size={24} />
          </StatIcon>
          <StatValue>{stats.totalDownloads.toLocaleString()}</StatValue>
          <StatLabel>Total Downloads</StatLabel>
        </StatCard>
        
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <StatIcon>
            <FiStar size={24} />
          </StatIcon>
          <StatValue>{stats.averageRating.toFixed(1)} ⭐</StatValue>
          <StatLabel>Average Rating</StatLabel>
        </StatCard>
      </StatsGrid>

      <Section>
        <SectionHeader>
          <SectionTitle>
            <FiPackage size={20} />
            Recent Software
          </SectionTitle>
        </SectionHeader>
        
        <Grid>
          {posts.slice(0, 6).map((post, index) => (
            <Card
              key={post._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <CardHeader>
                <CardTitle>{post.title}</CardTitle>
                <CardActions>
                  <IconButton variant="view" onClick={() => window.open(`/post/${post._id}`, '_blank')}>
                    <FiEye size={16} />
                  </IconButton>
                  <IconButton variant="edit" onClick={() => handleEdit(post)}>
                    <FiEdit size={16} />
                  </IconButton>
                  <IconButton variant="delete" onClick={() => handleDelete(post._id)}>
                    <FiTrash2 size={16} />
                  </IconButton>
                </CardActions>
              </CardHeader>
              
              <CardMeta>
                <Badge type="category">{post.category}</Badge>
                {/* Removed isFeatured */}
                <MetaItem>{formatDate(post.createdAt)}</MetaItem>
              </CardMeta>
              
              <CardDescription>{post.description}</CardDescription>
              
              <CardFooter>
                <span>{post.downloads || 0} downloads</span> {/* Changed downloadCount to downloads */}
                {/* Removed fileSize */}
              </CardFooter>
            </Card>
          ))}
        </Grid>
      </Section>
    </TabContent>
  );

  const renderSoftwareManagement = () => (
    <TabContent>
      <Section>
        <SectionHeader>
          <SectionTitle>
            <FiPackage size={20} />
            Software Management
          </SectionTitle>
          <ActionButton
            primary
            onClick={() => setShowUploadForm(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiPlus size={16} />
            Add Software
          </ActionButton>
        </SectionHeader>

        <AnimatePresence>
          {showUploadForm && (
            <UploadForm
              onSubmit={handleFormSubmit}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <FormTitle>
                <FiUpload size={20} />
                {editingPost ? 'Edit Software' : 'Add New Software'}
              </FormTitle>

              <FormGrid>
                <FormGroup>
                  <Label>Title *</Label>
                  <Input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Software name..."
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Category *</Label>
                  <Select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                  >
                    <option value="software">Software</option>
                    <option value="game">Game</option>
                    <option value="tool">Tool</option>
                    <option value="plugin">Plugin</option>
                    <option value="other">Other</option>
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label>Version</Label>
                  <Input
                    type="text"
                    value={formData.version}
                    onChange={(e) => setFormData({...formData, version: e.target.value})}
                    placeholder="1.0"
                  />
                </FormGroup>

                {/* Removed File Size input */}
              </FormGrid>

              <FormGroup>
                <Label>Description *</Label>
                <TextArea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe the software..."
                  required
                />
              </FormGroup>

              <FormGrid>
                <FormGroup>
                  <Label>Tags (comma separated)</Label>
                  <Input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    placeholder="productivity, office, windows"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>System Requirements</Label>
                  <Input
                    type="text"
                    value={formData.requirements}
                    onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                    placeholder="Windows 10, 4GB RAM"
                  />
                </FormGroup>
              </FormGrid>

              <FileUploadSection>
                <FileUploadBox onClick={() => document.getElementById('screenshots').click()}>
                  <FileUploadIcon>
                    <FiImage size={20} />
                  </FileUploadIcon>
                  <FileUploadText>
                    Screenshots<br />
                    <small>{files.screenshots.length} file(s) selected</small>
                  </FileUploadText>
                  <input
                    id="screenshots"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileChange('screenshots', e.target.files)}
                  />
                </FileUploadBox>

                <FileUploadBox onClick={() => document.getElementById('video').click()}>
                  <FileUploadIcon>
                    <FiVideo size={20} />
                  </FileUploadIcon>
                  <FileUploadText>
                    Video Preview<br />
                    <small>{files.video ? '1 file selected' : 'No file selected'}</small>
                  </FileUploadText>
                  <input
                    id="video"
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileChange('video', e.target.files)}
                  />
                </FileUploadBox>

                <FileUploadBox onClick={() => document.getElementById('software').click()}>
                  <FileUploadIcon>
                    <FiFile size={20} />
                  </FileUploadIcon>
                  <FileUploadText>
                    Software File *<br />
                    <small>{files.software ? '1 file selected' : 'No file selected'}</small>
                  </FileUploadText>
                  <input
                    id="software"
                    type="file"
                    onChange={(e) => handleFileChange('software', e.target.files)}
                    required={!editingPost}
                  />
                </FileUploadBox>
              </FileUploadSection>

              <FormActions>
                <CancelButton
                  type="button"
                  onClick={resetForm}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FiX size={16} />
                  Cancel
                </CancelButton>
                <SubmitButton
                  type="submit"
                  disabled={submitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FiSave size={16} />
                  {submitting ? 'Saving...' : editingPost ? 'Update Software' : 'Add Software'}
                </SubmitButton>
              </FormActions>
            </UploadForm>
          )}
        </AnimatePresence>

        <FilterBar>
          <SearchInput
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search software..."
          />
          <FilterSelect
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="software">Software</option>
            <option value="game">Game</option>
            <option value="tool">Tool</option>
            <option value="plugin">Plugin</option>
            <option value="other">Other</option>
          </FilterSelect>
        </FilterBar>

        {loading ? (
          <LoadingSpinner text="Loading software..." />
        ) : (
          <Grid>
            {filteredPosts.map((post, index) => (
              <Card
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <CardHeader>
                  <CardTitle>{post.title}</CardTitle>
                  <CardActions>
                    <IconButton variant="view" onClick={() => window.open(`/post/${post._id}`, '_blank')}>
                      <FiEye size={16} />
                    </IconButton>
                    <IconButton variant="edit" onClick={() => handleEdit(post)}>
                      <FiEdit size={16} />
                    </IconButton>
                    <IconButton variant="delete" onClick={() => handleDelete(post._id)}>
                      <FiTrash2 size={16} />
                    </IconButton>
                  </CardActions>
                </CardHeader>
                
                <CardMeta>
                  <Badge type="category">{post.category}</Badge>
                  {/* Removed isFeatured */}
                  <MetaItem>{formatDate(post.createdAt)}</MetaItem>
                </CardMeta>
                
                <CardDescription>{post.description}</CardDescription>
                
                <CardFooter>
                  <span>{post.downloads || 0} downloads</span>
                  {post.averageRating && (
                    <span>{post.averageRating.toFixed(1)} ⭐ ({post.ratings?.length || 0} ratings)</span>
                  )}
                </CardFooter>
              </Card>
            ))}
          </Grid>
        )}
      </Section>
    </TabContent>
  );

  const renderUserManagement = () => (
    <TabContent>
      <Section>
        <SectionHeader>
          <SectionTitle>
            <FiUsers size={20} />
            User Management
          </SectionTitle>
          <ActionButton
            primary
            onClick={() => setShowUserForm(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiPlus size={16} />
            Add User
          </ActionButton>
        </SectionHeader>

        <AnimatePresence>
          {showUserForm && (
            <UserForm
              onSubmit={handleUserFormSubmit}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <FormTitle>
                <FiPlus size={20} />
                {editingUser ? 'Edit User' : 'Add New User'}
              </FormTitle>

              <FormGrid>
                <FormGroup>
                  <Label>Username *</Label>
                  <Input
                    type="text"
                    value={userFormData.username}
                    onChange={(e) => setUserFormData({...userFormData, username: e.target.value})}
                    placeholder="Enter username..."
                    required
                  />
                </FormGroup>

                {/* Removed Email input */}

                <FormGroup>
                  <Label>Password {editingUser ? '(leave blank to keep current)' : '*'}</Label>
                  <Input
                    type="password"
                    value={userFormData.password}
                    onChange={(e) => setUserFormData({...userFormData, password: e.target.value})}
                    placeholder="Enter password..."
                    required={!editingUser}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Role</Label>
                  <Select
                    value={userFormData.role}
                    onChange={(e) => setUserFormData({...userFormData, role: e.target.value})}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </Select>
                </FormGroup>

                {/* Removed Full Name input */}

                <FormGroup>
                  <Label>Telegram Username</Label>
                  <Input
                    type="text"
                    value={userFormData.telegramUsername}
                    onChange={(e) => setUserFormData({...userFormData, telegramUsername: e.target.value})}
                    placeholder="@username or telegram ID..."
                  />
                </FormGroup>
              </FormGrid>

              <FormActions>
                <CancelButton
                  type="button"
                  onClick={resetUserForm}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FiX size={16} />
                  Cancel
                </CancelButton>
                <SubmitButton
                  type="submit"
                  disabled={submitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FiSave size={16} />
                  {submitting ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
                </SubmitButton>
              </FormActions>
            </UserForm>
          )}
        </AnimatePresence>

        <FilterBar>
          <SearchInput
            type="text"
            value={userSearchInput}
            onChange={(e) => setUserSearchInput(e.target.value)}
            placeholder="Search users..."
            onKeyPress={(e) => e.key === 'Enter' && handleUserSearch()}
          />
          <ActionButton
            onClick={handleUserSearch}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ padding: '12px 20px', fontSize: '14px' }}
          >
            <FiSearch size={16} />
            Search
          </ActionButton>
          <FilterSelect
            value={userRoleFilter}
            onChange={(e) => {
              setUserRoleFilter(e.target.value);
              setUserCurrentPage(1);
              fetchUsers(1);
            }}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admins</option>
            <option value="user">Users</option>
          </FilterSelect>
        </FilterBar>
        
        {loading ? (
          <LoadingSpinner text="Loading users..." />
        ) : (
          <>
            <Grid>
            {filteredUsers.map((user, index) => (
              <Card
                key={user._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <CardHeader>
                  <UserAvatar>
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt="Avatar" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                      />
                    ) : (
                      user.username.charAt(0).toUpperCase()
                    )}
                  </UserAvatar>
                  <div style={{ flex: 1 }}>
                    <CardTitle>{user.username}</CardTitle>
                    <CardActions>
                      <IconButton variant="edit" onClick={() => handleUserEdit(user)}>
                        <FiEdit size={16} />
                      </IconButton>
                      <IconButton variant="delete" onClick={() => handleUserDelete(user._id)}>
                        <FiTrash2 size={16} />
                      </IconButton>
                    </CardActions>
                  </div>
                </CardHeader>
                
                <CardMeta>
                  <Badge type={user.role === 'admin' ? 'admin' : 'category'}> {/* Changed type to 'admin' */}
                    {user.role === 'admin' ? 'Admin' : 'User'}
                  </Badge>
                  {/* Removed isActive */}
                  <MetaItem>{formatDate(user.createdAt)}</MetaItem>
                </CardMeta>
                
                <CardDescription>
                  {user.telegramUsername && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <FaTelegram size={16} color="#0088cc" />
                      <span>@{user.telegramUsername}</span>
                    </div>
                  )}
                  <strong>Last Login:</strong> {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                </CardDescription>
                
                <CardFooter>
                  <span>ID: {user._id.slice(-8)}</span>
                  <span>{user.twoFactorEnabled ? '2FA Enabled' : '2FA Disabled'}</span>
                </CardFooter>
              </Card>
            ))}
          </Grid>

          {userTotalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
              <ActionButton
                onClick={() => handleUserPageChange(userCurrentPage - 1)}
                disabled={userCurrentPage === 1}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ padding: '8px 16px', fontSize: '14px' }}
              >
                Previous
              </ActionButton>
              
              <span style={{ 
                padding: '8px 16px', 
                background: 'rgba(255, 255, 255, 0.1)', 
                borderRadius: '8px',
                color: '#fff',
                display: 'flex',
                alignItems: 'center'
              }}>
                Page {userCurrentPage} of {userTotalPages}
              </span>
              
              <ActionButton
                onClick={() => handleUserPageChange(userCurrentPage + 1)}
                disabled={userCurrentPage === userTotalPages}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ padding: '8px 16px', fontSize: '14px' }}
              >
                Next
              </ActionButton>
            </div>
          )}
          </>
        )}
      </Section>
    </TabContent>
  );

  const renderCommentsManagement = () => (
    <TabContent>
      <Section>
        <SectionHeader>
          <SectionTitle>
            <FiMessageSquare size={20} />
            Comment & Rating Management
          </SectionTitle>
        </SectionHeader>

        <FilterBar>
          <SearchInput
            type="text"
            value={commentSearchInput}
            onChange={(e) => setCommentSearchInput(e.target.value)}
            placeholder="Search comments..."
            onKeyPress={(e) => e.key === 'Enter' && handleCommentSearch()}
          />
          <ActionButton
            onClick={handleCommentSearch}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ padding: '12px 20px', fontSize: '14px' }}
          >
            <FiSearch size={16} />
            Search
          </ActionButton>
        </FilterBar>
        
        {loading ? (
          <LoadingSpinner text="Loading comments..." />
        ) : (
          <>
            <Grid>
            {filteredComments.map((comment, index) => (
              <Card
                key={comment._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <CardHeader>
                  <CardTitle>Comment by {comment.author?.username || 'Unknown'}</CardTitle>
                  <CardActions>
                    <IconButton variant="delete" onClick={() => handleCommentDelete(comment._id)}>
                      <FiTrash2 size={16} />
                    </IconButton>
                  </CardActions>
                </CardHeader>
                
                <CardMeta>
                  <Badge type="category">Post: {comment.post?.title || 'Unknown'}</Badge>
                  <MetaItem>{formatDate(comment.createdAt)}</MetaItem>
                </CardMeta>
                
                <CardDescription>
                  {comment.content}
                  {comment.isEdited && <em> (edited)</em>}
                </CardDescription>
                
                <CardFooter>
                  <span>{comment.likes?.length || 0} likes</span>
                  {comment.parentComment && <span>Reply</span>}
                </CardFooter>
              </Card>
            ))}
            </Grid>

            {filteredComments.length === 0 && !loading && (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px', 
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '16px'
              }}>
                <FiMessageSquare size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <p>No comments found</p>
                {commentSearchTerm && <p>Try adjusting your search criteria</p>}
              </div>
            )}

          {commentTotalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
              <ActionButton
                onClick={() => handleCommentPageChange(commentCurrentPage - 1)}
                disabled={commentCurrentPage === 1}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ padding: '8px 16px', fontSize: '14px' }}
              >
                Previous
              </ActionButton>
              
              <span style={{ 
                padding: '8px 16px', 
                background: 'rgba(255, 255, 255, 0.1)', 
                borderRadius: '8px',
                color: '#fff',
                display: 'flex',
                alignItems: 'center'
              }}>
                Page {commentCurrentPage} of {commentTotalPages}
              </span>
              
              <ActionButton
                onClick={() => handleCommentPageChange(commentCurrentPage + 1)}
                disabled={commentCurrentPage === commentTotalPages}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ padding: '8px 16px', fontSize: '14px' }}
              >
                Next
              </ActionButton>
            </div>
          )}
          </>
        )}
      </Section>
    </TabContent>
  );

  if (!user || user.role !== 'admin') {
    return (
      <Container>
        <Content>
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255, 255, 255, 0.7)' }}>
            <h2>Access Denied</h2>
            <p>You need admin privileges to access this page.</p>
          </div>
        </Content>
      </Container>
    );
  }

  return (
    <Container>
      <Content>
        <Header>
          <Title>Admin Dashboard</Title>
          <QuickActions>
            <ActionButton 
              onClick={() => {
                if (editingPost) {
                  resetForm();
                }
                setShowUploadForm(!showUploadForm);
              }}
              style={{ 
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                border: '2px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <FiPlus size={16} />
              Add Software
            </ActionButton>
            <ActionButton onClick={() => setActiveTab('users')}>
              <FiUsers size={16} />
              Manage Users
            </ActionButton>
          </QuickActions>
        </Header>

        <TabBar>
          <Tab
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiSettings size={16} />
            Overview
          </Tab>
          <Tab
            active={activeTab === 'software'}
            onClick={() => setActiveTab('software')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiPackage size={16} />
            Software Management
          </Tab>
          <Tab
            active={activeTab === 'users'}
            onClick={() => setActiveTab('users')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiUsers size={16} />
            User Management
          </Tab>
          <Tab
            active={activeTab === 'comments'}
            onClick={() => setActiveTab('comments')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiMessageSquare size={16} />
            Comment & Rating Management
          </Tab>
        </TabBar>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'software' && renderSoftwareManagement()}
          {activeTab === 'users' && renderUserManagement()}
          {activeTab === 'comments' && renderCommentsManagement()}
        </AnimatePresence>
      </Content>
    </Container>
  );
};

export default Dashboard;
