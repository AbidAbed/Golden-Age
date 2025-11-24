import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, 
  FiThumbsUp, 
  FiThumbsDown, 
  FiCheck, 
  FiX, 
  FiClock, 
  FiUser,
  FiCalendar,
  FiTag,
  FiFilter,
  FiTrash2
} from 'react-icons/fi';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { formatDate } from '../utils/helpers';

const Container = styled.div`
  min-height: 100vh;
  padding: 90px 20px 40px;
  background: transparent; /* Allow ThreeJS background to show through */
`;

const Content = styled.div`
  max-width: 1200px;
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
  margin-bottom: 16px;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #daa520 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.2rem;
  margin-bottom: 32px;
`;

const FilterSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const FilterSelect = styled.select`
  padding: 10px 16px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  font-size: 14px;
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

const StatsBar = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

const StatCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(255, 215, 0, 0.1);
    border-color: rgba(255, 215, 0, 0.3);
  }
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #ffd700;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  font-weight: 500;
`;

const RequestForm = styled(motion.form)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 40px;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: rgba(255, 215, 0, 0.3);
  }
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

const FormRow = styled.div`
  display: grid;
  grid-template-columns: ${props => props.$columns || '1fr'};
  gap: 20px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
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
  width: 100%;
  
  &:focus {
    outline: none;
    border-color: #ffd700;
    box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.2);
  }
  
  option {
    background: rgba(26, 26, 26, 0.95) !important;
    color: #ffffff !important;
    padding: 8px;
  }
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

const RequestsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const RequestCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 28px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 215, 0, 0.1);
    border-color: rgba(255, 215, 0, 0.3);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => {
      if (props.status === 'approved') return 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
      if (props.status === 'rejected') return 'linear-gradient(135deg, #dc3545 0%, #fd7e14 100%)';
      return 'linear-gradient(135deg, #ffd700 0%, #daa520 100%)';
    }};
  }
`;

const RequestHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 16px;
`;

const RequestTitle = styled.h3`
  color: #ffffff;
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0;
  flex: 1;
`;

const StatusBadge = styled.span`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${props => {
    if (props.$status === 'approved') return 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
    if (props.$status === 'rejected') return 'linear-gradient(135deg, #dc3545 0%, #fd7e14 100%)';
    return 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)';
  }};
  color: #000;
`;

const RequestMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 16px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const RequestDescription = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 20px;
`;

const RequestActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
`;

const VotingSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const VoteButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  background: ${props => props.active ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  color: ${props => props.active ? '#ffd700' : 'rgba(255, 255, 255, 0.7)'};
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #ffd700;
    background: rgba(255, 215, 0, 0.1);
    color: #ffd700;
  }
`;

const AdminActions = styled.div`
  display: flex;
  gap: 8px;
`;

const AdminButton = styled(motion.button)`
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  
  &.approve {
    background: linear-gradient(135deg, #28a745 0%, #20c997 100%) ;
    color: #fff;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
    }
  }
  
  &.reject {
    background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%);
    color: #fff;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(220, 53, 69, 0.4);
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.5);
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 20px;
  color: rgba(255, 215, 0, 0.3);
`;

const Requests = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    category: ''
  });

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, statusFilter, categoryFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/requests');
      const requestsData = response.data.requests || response.data || [];
      setRequests(requestsData);
      
      // Calculate stats
      const newStats = {
        total: requestsData.length,
        pending: requestsData.filter(r => r.status === 'pending').length,
        approved: requestsData.filter(r => r.status === 'approved').length,
        rejected: requestsData.filter(r => r.status === 'rejected').length
      };
      setStats(newStats);
    } catch (error) {
      console.error('Fetch requests error:', error);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = requests;
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(request => request.category === categoryFilter);
    }
    
    setFilteredRequests(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newRequest.title.trim() || !newRequest.description.trim() || !newRequest.category) {
      toast.error('Please fill all required fields');
      return;
    }
    if (newRequest.title.trim().length < 3) {
      toast.error('Title must be at least 3 characters');
      return;
    }
    if (newRequest.description.trim().length < 10) {
      toast.error('Description must be at least 10 characters');
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.post('/requests', newRequest);
      setRequests(prev => [response.data.request, ...prev]);
      setNewRequest({ title: '', description: '', category: '' });
      toast.success('Request submitted successfully!');
    } catch (error) {
      console.error('Create request error:', error);
      toast.error('Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (requestId, type) => {
    try {
      await api.post(`/requests/${requestId}/vote`, { type });
      fetchRequests();
      toast.success(`Vote ${type === 'up' ? 'added' : 'removed'}!`);
    } catch (error) {
      console.error('Vote error:', error);
      toast.error('Failed to vote');
    }
  };

  const handleStatusUpdate = async (requestId, status) => {
    try {
      await api.put(`/requests/${requestId}/status`, { status });
      fetchRequests();
      toast.success(`Request ${status}!`);
    } catch (error) {
      console.error('Update status error:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to delete this request? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/requests/${requestId}`);
      fetchRequests();
      toast.success('Request deleted successfully!');
    } catch (error) {
      console.error('Delete request error:', error);
      toast.error('Failed to delete request');
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading requests..." />;
  }

  return (
    <Container>
      <Content>
        <Header>
          <Title>Software Requests</Title>
          <Subtitle>
            {user?.role === 'admin' 
              ? 'Review and manage user software requests' 
              : 'Request new software to be added to our collection'
            }
          </Subtitle>
        </Header>

        <StatsBar>
          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <StatValue>{stats.total}</StatValue>
            <StatLabel>Total Requests</StatLabel>
          </StatCard>
          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <StatValue>{stats.pending}</StatValue>
            <StatLabel>Pending Review</StatLabel>
          </StatCard>
          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <StatValue>{stats.approved}</StatValue>
            <StatLabel>Approved</StatLabel>
          </StatCard>
          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <StatValue>{stats.rejected}</StatValue>
            <StatLabel>Rejected</StatLabel>
          </StatCard>
        </StatsBar>

        {!user || user.role !== 'admin' && (
          <RequestForm
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <FormTitle>
              <FiPlus size={24} />
              Request New Software
            </FormTitle>
            
            <FormRow $columns="2fr 1fr">
              <FormGroup>
                <Label>Software Name *</Label>
                <Input
                  type="text"
                  value={newRequest.title}
                  onChange={(e) => setNewRequest({...newRequest, title: e.target.value})}
                  placeholder="Enter software name..."
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Category *</Label>
                <Select
                  value={newRequest.category}
                  onChange={(e) => setNewRequest({...newRequest, category: e.target.value})}
                  required
                >
                  <option value="">Select category</option>
                  <option value="software">Software</option>
                  <option value="game">Game</option>
                  <option value="tool">Tool</option>
                  <option value="plugin">Plugin</option>
                  <option value="other">Other</option>
                </Select>
              </FormGroup>
            </FormRow>
            
            <FormGroup>
              <Label>Description *</Label>
              <TextArea
                value={newRequest.description}
                onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
                placeholder="Describe what this software does and why it should be added to our collection..."
                required
              />
            </FormGroup>
            
            <SubmitButton
              type="submit"
              disabled={submitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiPlus size={20} />
              {submitting ? 'Submitting...' : 'Submit Request'}
            </SubmitButton>
          </RequestForm>
        )}

        <FilterSection>
          <FilterGroup>
            <FiFilter size={20} color="rgba(255, 255, 255, 0.7)" />
            <FilterSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </FilterSelect>
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
          </FilterGroup>
        </FilterSection>

        <RequestsList>
          <AnimatePresence>
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request, index) => (
                <RequestCard
                  key={request._id}
                  $status={request.status}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <RequestHeader>
                    <RequestTitle>{request.title}</RequestTitle>
                    <StatusBadge $status={request.status}>
                      {request.status}
                    </StatusBadge>
                  </RequestHeader>

                  <RequestMeta>
                    <MetaItem>
                      <FiUser size={16} />
                      {request.requestedBy?.username || 'Unknown'}
                    </MetaItem>
                    <MetaItem>
                      <FiCalendar size={16} />
                      {formatDate(request.createdAt)}
                    </MetaItem>
                    <MetaItem>
                      <FiTag size={16} />
                      {request.category}
                    </MetaItem>
                  </RequestMeta>

                  <RequestDescription>
                    {request.description || request.details}
                  </RequestDescription>

                  <RequestActions>
                    <VotingSection>
                      <VoteButton
                        onClick={() => handleVote(request._id, 'up')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FiThumbsUp size={16} />
                        {request.votes?.filter(v => v.type === 'up').length || 0}
                      </VoteButton>
                      <VoteButton
                        onClick={() => handleVote(request._id, 'down')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FiThumbsDown size={16} />
                        {request.votes?.filter(v => v.type === 'down').length || 0}
                      </VoteButton>
                    </VotingSection>

                    {user?.role === 'admin' && request.status === 'pending' && (
                      <AdminActions>
                        <AdminButton
                          className="approve"
                          onClick={() => handleStatusUpdate(request._id, 'approved')}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FiCheck size={16} />
                          Approve
                        </AdminButton>
                        <AdminButton
                          className="reject"
                          onClick={() => handleStatusUpdate(request._id, 'rejected')}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FiX size={16} />
                          Reject
                        </AdminButton>
                      </AdminActions>
                    )}

                    {user?.role === 'admin' && (
                      <AdminActions>
                        <AdminButton
                          className="reject"
                          onClick={() => handleDeleteRequest(request._id)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          style={{ background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)' }}
                        >
                          <FiTrash2 size={16} />
                          Delete
                        </AdminButton>
                      </AdminActions>
                    )}
                  </RequestActions>
                </RequestCard>
              ))
            ) : (
              <EmptyState>
                <EmptyIcon>📋</EmptyIcon>
                <h3 style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '12px' }}>
                  No requests found
                </h3>
                <p>
                  {user?.role === 'admin' 
                    ? 'No user requests to review at the moment.'
                    : 'Be the first to request new software for our collection!'
                  }
                </p>
              </EmptyState>
            )}
          </AnimatePresence>
        </RequestsList>
      </Content>
    </Container>
  );
};

export default Requests;
