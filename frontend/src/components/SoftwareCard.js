import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { 
  FiDownload, 
  FiHeart, 
  FiEye, 
  FiCalendar,
  FiTag,
  FiStar,
  FiThumbsDown
} from 'react-icons/fi';
import api from '../utils/api';
import { formatDate, truncateText } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

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

const Card = styled(motion.div)`
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  overflow: hidden;
  transition: all 0.4s ease;
  position: relative;
  min-height: 480px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  
  &:hover {
    transform: translateY(-12px);
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);
    border-color: rgba(255, 215, 0, 0.4); /* Golden border on hover */
    background: rgba(255, 255, 255, 0.12);
  }
`;

const CardImage = styled.div.withConfig({
  shouldForwardProp: (prop) => !['image', 'title'].includes(prop)
})`
  height: 200px;
  background: linear-gradient(135deg, #ffd700 0%, #daa520 100%); /* Golden gradient */
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
  }
`;

const CategoryBadge = styled.span`
  position: absolute;
  top: 16px;
  left: 16px;
  background: rgba(255, 215, 0, 0.9); /* Golden background */
  color: #000; /* Dark text for contrast */
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  backdrop-filter: blur(10px);
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.3); /* Golden shadow */
`;

const FeaturedBadge = styled.span`
  position: absolute;
  top: 16px;
  right: 16px;
  background: linear-gradient(135deg, #ffc107 0%, #ff8c00 100%);
  color: #000;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const CardContent = styled.div`
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 240px;
`;

const CardTitle = styled(Link)`
  display: block;
  font-size: 1.4rem;
  font-weight: 700;
  color: #ffffff;
  text-decoration: none;
  margin-bottom: 12px;
  line-height: 1.2;
  transition: color 0.3s ease;
  
  &:hover {
    color: #ffd700; /* Golden color on hover */
  }
`;

const CardDescription = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 16px;
`;

const CardMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const RatingContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
`;

const StarRating = styled.div`
  display: flex;
  gap: 2px;
`;

const Star = styled.button.withConfig({
  shouldForwardProp: (prop) => !['filled'].includes(prop)
})`
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

const RatingText = styled.span`
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  font-weight: 500;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
`;

const Tag = styled.span`
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled(motion.button).withConfig({
  shouldForwardProp: (prop) => !['active'].includes(prop)
})`
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: ${props => props.active ? '#ffd700' : 'rgba(255, 255, 255, 0.7)'}; /* Golden active color */
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    color: #ffd700; /* Golden color on hover */
  }
`;

const DownloadButton = styled(motion.a)`
  padding: 12px 20px;
  background: linear-gradient(135deg, #ffd700 0%, #daa520 100%); /* Golden gradient */
  color: #000; /* Dark text for contrast */
  text-decoration: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  white-space: nowrap;
  min-width: fit-content;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4); /* Golden shadow */
  }
  
  @media (max-width: 480px) {
    width: 100%;
    justify-content: center;
    padding: 14px 20px;
    font-size: 16px;
  }
`;

const ViewButton = styled(Link)`
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
  
  @media (max-width: 480px) {
    width: 100%;
    justify-content: center;
  }
`;

const SoftwareCard = ({ post, index }) => {
  const { user, isAuthenticated } = useAuth();
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [dislikeCount, setDislikeCount] = useState(post.dislikes?.length || 0);
  const [userLiked, setUserLiked] = useState(
    user ? post.likes?.includes(user.id) : false
  );
  const [userDisliked, setUserDisliked] = useState(
    user ? post.dislikes?.includes(user.id) : false
  );
  const [averageRating, setAverageRating] = useState(post.averageRating || 0);
  const [userRating, setUserRating] = useState(
    user && post.ratings ? post.ratings.find(r => r.user === user.id)?.value || 0 : 0
  );
  const [totalRatings, setTotalRatings] = useState(post.ratings?.length || 0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [gofileDownloadLink, setGofileDownloadLink] = useState(''); // New state for Gofile.io direct link

  useEffect(() => {
    // Find the software download link from gofileLinks
    const softwareLink = post.gofileLinks?.find(link => link.type === 'software');
    if (softwareLink) {
      setGofileDownloadLink(softwareLink.url);
    }
  }, [post.gofileLinks]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to like posts');
      return;
    }

    try {
      const response = await api.post(`/posts/${post._id}/like`);
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
      const response = await api.post(`/posts/${post._id}/dislike`);
      const { likes, dislikes, userLiked: liked, userDisliked: disliked } = response.data;
      
      setLikeCount(likes);
      setDislikeCount(dislikes);
      setUserLiked(liked);
      setUserDisliked(disliked);
    } catch (error) {
      toast.error('Failed to dislike post');
    }
  };

  const handleDownload = async () => {
    if (!gofileDownloadLink) {
      toast.error('No download link available for this software.');
      return;
    }

    try {
      await api.post(`/posts/${post._id}/download`);
      window.open(gofileDownloadLink, '_blank');
      toast.success('Download started!');
    } catch (error) {
      console.error('Error tracking download or opening link:', error);
      toast.error('Failed to start download. Please try again.');
      window.open(gofileDownloadLink, '_blank');
    }
  };

  const handleRating = async (rating) => {
    console.log('handleRating called with:', rating, 'isAuthenticated:', isAuthenticated);
    if (!isAuthenticated) {
      toast.error('Please login to rate this software');
      return;
    }

    try {
      console.log('Sending rating request to:', `/posts/${post._id}/rate`);
      const response = await api.post(`/posts/${post._id}/rate`, { rating });
      console.log('Rating response:', response.data);
      const { averageRating: newAverage, totalRatings: newTotal } = response.data;
      
      setAverageRating(newAverage);
      setTotalRatings(newTotal);
      setUserRating(rating);
      toast.success('Rating submitted!');
    } catch (error) {
      console.error('Rating error:', error);
      toast.error('Failed to submit rating');
    }
  };

  const renderStars = (rating, interactive = false) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        filled={index < rating}
        onClick={interactive ? () => handleRating(index + 1) : undefined}
        disabled={!interactive}
        style={{ cursor: interactive ? 'pointer' : 'default' }}
      >
        <FiStar size={16} fill={index < rating ? '#ffd700' : 'none'} />
      </Star>
    ));
  };

  return (
    <Card
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -10 }}
    >
      <CardImage image={post.screenshots?.[0]} title={post.title}>
        {post.screenshots?.[0] && !imageError && (
          <img 
            src={getMediaUrl(post.screenshots[0])}
            alt={post.title}
            onError={(e) => {
              console.error('Image failed to load:', e.target.src);
              setImageError(true);
            }}
            onLoad={(e) => {
              console.log('Image loaded successfully:', e.target.src);
              setImageLoaded(true);
            }}
          />
        )}
        {(!post.screenshots?.[0] || imageError) && (
          <div style={{
            position: 'absolute',
            color: 'white',
            fontSize: '24px',
            fontWeight: 'bold',
            textAlign: 'center',
            zIndex: 2,
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
          }}>
            📦 {post.title || 'Software'}
          </div>
        )}
        <CategoryBadge>{post.category}</CategoryBadge>
        {post.isFeatured && (
          <FeaturedBadge>
            <FiStar size={12} />
            Featured
          </FeaturedBadge>
        )}
      </CardImage>
      
      <CardContent>
        <CardTitle to={`/post/${post._id}`}>
          {post.title}
        </CardTitle>
        
        <CardDescription>
          {truncateText(post.description, 120)}
        </CardDescription>
        
        <RatingContainer>
          <StarRating>
            {renderStars(averageRating)}
          </StarRating>
          <RatingText>
            {averageRating.toFixed(1)} ({totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})
          </RatingText>
        </RatingContainer>

        {isAuthenticated && (
          <RatingContainer>
            <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '13px', marginRight: '8px' }}>
              Your rating:
            </span>
            <StarRating>
              {renderStars(userRating, true)}
            </StarRating>
          </RatingContainer>
        )}
        
        <CardMeta>
          <MetaItem>
            <FiCalendar size={14} />
            {formatDate(post.createdAt)}
          </MetaItem>
          <MetaItem>
            <FiDownload size={14} />
            {post.downloads || 0} downloads {/* Changed downloadCount to downloads */}
          </MetaItem>
          {/* Removed fileSize as it's now part of gofileLinks */}
        </CardMeta>
        
        {post.tags && post.tags.length > 0 && (
          <TagsContainer>
            {post.tags.slice(0, 3).map((tag, idx) => (
              <Tag key={idx}>{tag}</Tag>
            ))}
            {post.tags.length > 3 && (
              <Tag>+{post.tags.length - 3} more</Tag>
            )}
          </TagsContainer>
        )}
        
        <CardFooter>
          <ActionButtons>
            <ActionButton
              onClick={handleLike}
              active={userLiked}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FiHeart size={16} />
              {likeCount}
            </ActionButton>
            
            <ActionButton
              onClick={handleDislike}
              active={userDisliked}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FiThumbsDown size={16} />
              {dislikeCount}
            </ActionButton>
            
            <ViewButton to={`/post/${post._id}`}>
              <FiEye size={16} />
              View
            </ViewButton>
          </ActionButtons>
          
          <DownloadButton
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleDownload();
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiDownload size={16} />
            Download
          </DownloadButton>
        </CardFooter>
      </CardContent>
    </Card>
  );
};

export default SoftwareCard;
