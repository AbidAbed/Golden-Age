import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiDownload, 
  FiHeart, 
  FiThumbsDown, 
  FiCalendar, 
  FiTag, 
  FiStar,
  FiUser,
  FiArrowLeft,
  FiEdit
} from 'react-icons/fi';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import Comments from '../components/Comments';

// Helper function to construct media URLs
const getMediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  if (path.startsWith('/uploads/')) {
    // URL encode the path to handle spaces and special characters
    const encodedPath = encodeURI(path);
    return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${encodedPath}`;
  }
  return path;
};

const Container = styled.div`
  min-height: 100vh;
  padding: 90px 20px 20px;
  // background: #1a1a1a; /* Solid dark background */
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const BackButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #ffffff;
  cursor: pointer;
  margin-bottom: 32px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 215, 0, 0.1); /* Golden hover background */
    border-color: #ffd700; /* Golden border on hover */
    color: #ffd700; /* Golden text on hover */
    transform: translateX(-5px);
  }
`;

const PostHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 40px;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const PostContent = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 32px;
`;

const PostSidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Title = styled.h1`
  color: #ffffff;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const EditButton = styled(motion.button)`
  padding: 8px 16px;
  background: linear-gradient(135deg, #ffd700 0%, #daa520 100%);
  color: #000;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
  }
`;

const CategoryBadge = styled.span`
  display: inline-block;
  background: linear-gradient(135deg, #ffd700 0%, #daa520 100%);
  color: #000;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 20px;
`;

const Description = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 24px;
`;

const MetaInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
`;

const Tag = styled.span`
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
`;

const RatingSection = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
`;

const RatingTitle = styled.h3`
  color: #ffd700;
  font-size: 1.2rem;
  margin-bottom: 16px;
`;

const StarRating = styled.div`
  display: flex;
  justify-content: center;
  gap: 4px;
  margin-bottom: 12px;
`;

const Star = styled.button`
  background: none;
  border: none;
  color: ${props => props.filled ? '#ffd700' : 'rgba(255, 255, 255, 0.3)'};
  cursor: pointer;
  padding: 4px;
  transition: color 0.2s ease;
  
  &:hover {
    color: #ffd700;
  }
  
  &:disabled {
    cursor: default;
  }
`;

const RatingText = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
`;

const ActionCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
`;

const ActionTitle = styled.h3`
  color: #ffffff;
  margin-bottom: 16px;
  font-size: 1.1rem;
`;

const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const DownloadButton = styled(motion.button)`
  padding: 16px 20px;
  background: linear-gradient(135deg, #ffd700 0%, #daa520 100%);
  color: #000;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, #ffed4e 0%, #ffd700 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4);
  }
`;

const InteractionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const InteractionButton = styled(motion.button)`
  flex: 1;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: ${props => props.active ? '#ffd700' : 'rgba(255, 255, 255, 0.7)'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 14px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: #ffd700;
    color: #ffd700;
  }
`;

const Screenshots = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
`;

const Screenshot = styled(motion.img)`
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 12px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #ffd700;
    transform: scale(1.02);
  }
`;

// Image Modal Styles
const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled(motion.div)`
  max-width: 90vw;
  max-height: 90vh;
  position: relative;
`;

const ModalImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
`;

const CloseButton = styled(motion.button)`
  position: absolute;
  top: -40px;
  right: 0;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  font-size: 20px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const UserAvatar = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 215, 0, 0.3);
`;

const VideoPreview = styled.div`
  position: relative;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 24px;
  
  video {
    width: 100%;
    height: 300px;
    object-fit: cover;
  }
`;

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [userDisliked, setUserDisliked] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [gofileDownloadLink, setGofileDownloadLink] = useState(''); // New state for Gofile.io direct link
  const [selectedImage, setSelectedImage] = useState(null); // For image modal

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await api.get(`/posts/${id}`);
        const postData = response.data;
        setPost(postData);
        
        setLikeCount(postData.likes?.length || 0);
        setDislikeCount(postData.dislikes?.length || 0);
        setUserLiked(user ? postData.likes?.includes(user.id) : false);
        setUserDisliked(user ? postData.dislikes?.includes(user.id) : false);
        setAverageRating(postData.averageRating || 0);
        setTotalRatings(postData.ratings?.length || 0);
        setUserRating(
          user && postData.ratings ? 
          postData.ratings.find(r => r.user === user.id)?.value || 0 : 0 // Changed userId to user and rating to value
        );

        // Find the software download link from gofileLinks
        const softwareLink = postData.gofileLinks?.find(link => link.type === 'software');
        if (softwareLink) {
          setGofileDownloadLink(softwareLink.url);
        }
        
      } catch (error) {
        console.error('Error fetching post:', error);
        toast.error('Failed to load post');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, user, navigate]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to like posts');
      return;
    }

    try {
      const response = await api.post(`/posts/${id}/like`);
      const { likes, dislikes, userLiked: liked, userDisliked: disliked } = response.data;
      
      setLikeCount(likes);
      setDislikeCount(dislikes);
      setUserLiked(liked);
      setUserDisliked(disliked);
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  const handleDislike = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to dislike posts');
      return;
    }

    try {
      const response = await api.post(`/posts/${id}/dislike`);
      const { likes, dislikes, userLiked: liked, userDisliked: disliked } = response.data;
      
      setLikeCount(likes);
      setDislikeCount(dislikes);
      setUserLiked(liked);
      setUserDisliked(disliked);
    } catch (error) {
      toast.error('Failed to dislike post');
    }
  };

  const handleRating = async (rating) => {
    if (!isAuthenticated) {
      toast.error('Please login to rate this software');
      return;
    }

    // If clicking the same rating, remove it
    const newRating = userRating === rating ? null : rating;

    try {
      const response = await api.post(`/posts/${id}/rate`, { rating: newRating });
      const { averageRating: newAverage, totalRatings: newTotal, userRating: updatedUserRating } = response.data;
      
      setAverageRating(newAverage);
      setTotalRatings(newTotal);
      setUserRating(updatedUserRating || 0);
      toast.success(newRating ? 'Rating submitted!' : 'Rating removed!');
    } catch (error) {
      toast.error('Failed to submit rating');
    }
  };

  const handleDownload = async () => {
    if (!gofileDownloadLink) {
      toast.error('No download link available for this software.');
      return;
    }

    try {
      await api.post(`/posts/${id}/download`); // Increment download count on backend
      window.open(gofileDownloadLink, '_blank'); // Open Gofile.io link
      toast.success('Download started!');
    } catch (error) {
      console.error('Error tracking download or opening link:', error);
      toast.error('Failed to start download. Please try again.');
      // Fallback to opening the link even if tracking fails
      window.open(gofileDownloadLink, '_blank');
    }
  };

  const renderStars = (rating, interactive = false) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        filled={index < rating}
        onClick={interactive ? () => handleRating(index + 1) : undefined}
        disabled={!interactive || !isAuthenticated}
      >
        <FiStar size={20} fill={index < rating ? '#ffd700' : 'none'} />
      </Star>
    ));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!post) {
    return (
      <Container>
        <Content>
          <Title style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)' }}>
            Post not found
          </Title>
        </Content>
      </Container>
    );
  }

  return (
    <Container>
      <Content>
        <BackButton
          onClick={() => navigate(-1)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiArrowLeft size={16} />
          Back
        </BackButton>

        <PostHeader>
          <PostContent>
            <CategoryBadge>{post.category}</CategoryBadge>
            <TitleContainer>
              <Title>{post.title}</Title>
              {user && user.role === 'admin' && (
                <EditButton
                  onClick={() => navigate('/dashboard')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiEdit size={16} />
                  Edit Post
                </EditButton>
              )}
            </TitleContainer>
            <Description>{post.description}</Description>

            <MetaInfo>
              <MetaItem>
                <FiCalendar size={16} />
                {formatDate(post.createdAt)}
              </MetaItem>
              <MetaItem>
                <FiDownload size={16} />
                {post.downloads || 0} downloads {/* Changed downloadCount to downloads */}
              </MetaItem>
              {/* Removed fileSize as it's now part of gofileLinks */}
              <MetaItem>
                <FiUser size={16} />
                <UserInfo>
                  {post.uploadedBy?.avatar && (
                    <UserAvatar src={getMediaUrl(post.uploadedBy.avatar)} alt="Avatar" />
                  )}
                  <span>{post.uploadedBy?.username || 'Unknown'}</span>
                </UserInfo>
              </MetaItem>
            </MetaInfo>

            {post.tags && post.tags.length > 0 && (
              <TagsContainer>
                {post.tags.map((tag, index) => (
                  <Tag key={index}>{tag}</Tag>
                ))}
              </TagsContainer>
            )}

            {post.videos && post.videos.length > 0 && (
              <VideoPreview>
                <video 
                  controls 
                  // poster={getMediaUrl(post.previewImage)} // Removed previewImage as it's not in the new Post model
                >
                  <source src={getMediaUrl(post.videos[0])} type="video/mp4" /> {/* Use first video link */}
                  Your browser does not support the video tag.
                </video>
              </VideoPreview>
            )}

            {post.screenshots && post.screenshots.length > 0 && (
              <Screenshots>
                {post.screenshots.map((screenshot, index) => (
                  <Screenshot
                    key={index}
                    src={getMediaUrl(screenshot)}
                    alt={`${post.title} screenshot ${index + 1}`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedImage(getMediaUrl(screenshot))}
                  />
                ))}
              </Screenshots>
            )}
          </PostContent>

          <PostSidebar>
            <RatingSection>
              <RatingTitle>Rating</RatingTitle>
              <StarRating>
                {renderStars(averageRating)}
              </StarRating>
              <RatingText>
                {averageRating.toFixed(1)} out of 5<br />
                ({totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})
              </RatingText>
              
              {isAuthenticated && (
                <>
                  <div style={{ margin: '16px 0', padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginBottom: '8px' }}>
                      Your rating:
                    </div>
                    <StarRating>
                      {renderStars(userRating, true)}
                    </StarRating>
                  </div>
                </>
              )}
            </RatingSection>

            <ActionCard>
              <ActionTitle>Download</ActionTitle>
              <ActionButtons>
                <DownloadButton
                  onClick={handleDownload}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FiDownload size={18} />
                  Download Now
                </DownloadButton>
                
                <InteractionButtons>
                  <InteractionButton
                    onClick={handleLike}
                    active={userLiked}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiHeart size={16} />
                    {likeCount}
                  </InteractionButton>
                  
                  <InteractionButton
                    onClick={handleDislike}
                    active={userDisliked}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiThumbsDown size={16} />
                    {dislikeCount}
                  </InteractionButton>
                </InteractionButtons>
              </ActionButtons>
            </ActionCard>
          </PostSidebar>
        </PostHeader>

        <Comments postId={id} />
      </Content>

      {/* Image Modal */}
      {selectedImage && (
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedImage(null)}
        >
          <ModalContent
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            onClick={(e) => e.stopPropagation()}
          >
            <CloseButton
              onClick={() => setSelectedImage(null)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ×
            </CloseButton>
            <ModalImage src={selectedImage} alt="Screenshot" />
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default PostDetail;
