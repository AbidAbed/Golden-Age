import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiMonitor, 
  FiPlay, 
  FiTool, 
  FiPackage, 
  FiGrid,
  FiDownload,
  FiStar,
  FiTrendingUp
} from 'react-icons/fi';
import api from '../utils/api';

const CategoriesContainer = styled.section`
  max-width: 1200px;
  margin: 0 auto 60px;
  padding: 0 20px;
`;

const SectionTitle = styled.h2`
  color: #ffffff;
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #daa520 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const SectionSubtitle = styled.p`
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  margin-bottom: 40px;
  font-size: 1.1rem;
`;

const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
`;

const CategoryCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 32px;
  text-align: center;
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4), 0 0 30px rgba(255, 215, 0, 0.2);
    border-color: rgba(255, 215, 0, 0.3);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(135deg, #ffd700 0%, #daa520 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::before {
    opacity: 1;
  }
`;

const CategoryIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: linear-gradient(135deg, #ffd700 0%, #daa520 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  color: #000;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
  transition: all 0.3s ease;

  ${CategoryCard}:hover & {
    transform: scale(1.1);
    box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
  }
`;

const CategoryName = styled.h3`
  color: #ffffff;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 16px;
  text-transform: capitalize;
`;

const CategoryStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const StatValue = styled.span`
  color: #ffd700;
  font-size: 1.4rem;
  font-weight: 700;
`;

const StatLabel = styled.span`
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const CategoryDescription = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 20px;
`;

const ExploreButton = styled(motion.button)`
  width: 100%;
  padding: 12px 20px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(218, 165, 32, 0.1) 100%);
  border: 2px solid rgba(255, 215, 0, 0.3);
  border-radius: 12px;
  color: #ffd700;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;

  &:hover {
    background: linear-gradient(135deg, #ffd700 0%, #daa520 100%);
    color: #000;
    border-color: #ffd700;
    transform: translateY(-2px);
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 60px;
  color: rgba(255, 255, 255, 0.7);
`;

const Categories = ({ onCategorySelect }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const categoryIcons = {
    software: FiMonitor,
    game: FiPlay,
    tool: FiTool,
    plugin: FiPackage,
    other: FiGrid
  };

  const categoryDescriptions = {
    software: "Professional applications, utilities, and productivity tools for everyday use.",
    game: "Latest games, mods, and gaming utilities for entertainment and fun.",
    tool: "Developer tools, system utilities, and specialized applications.",
    plugin: "Extensions, add-ons, and plugins for various software platforms.",
    other: "Miscellaneous software that doesn't fit in other categories."
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/posts/statistics/downloads');
      const statsData = response.data;
      
      // Format category data for display
      const categoryData = statsData.byCategory.map(cat => ({
        name: cat._id,
        softwareCount: cat.softwareCount,
        totalDownloads: cat.totalDownloads,
        averageRating: cat.averageRating || 0,
        icon: categoryIcons[cat._id] || FiGrid,
        description: categoryDescriptions[cat._id] || 'Various software applications.'
      }));

      setCategories(categoryData);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryName) => {
    if (onCategorySelect) {
      onCategorySelect(categoryName);
    }
  };

  if (loading) {
    return (
      <CategoriesContainer>
        <LoadingState>Loading categories...</LoadingState>
      </CategoriesContainer>
    );
  }

  return (
    <CategoriesContainer>
      <SectionTitle>Browse by Category</SectionTitle>
      <SectionSubtitle>
        Discover software organized by type and purpose
      </SectionSubtitle>
      
      <CategoriesGrid>
        {categories.map((category, index) => {
          const IconComponent = category.icon;
          
          return (
            <CategoryCard
              key={category.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              onClick={() => handleCategoryClick(category.name)}
            >
              <CategoryIcon>
                <IconComponent size={36} />
              </CategoryIcon>
              
              <CategoryName>{category.name}</CategoryName>
              
              <CategoryStats>
                <StatItem>
                  <StatValue>{category.softwareCount}</StatValue>
                  <StatLabel>Software</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>{category.totalDownloads.toLocaleString()}</StatValue>
                  <StatLabel>Downloads</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>{category.averageRating.toFixed(1)}</StatValue>
                  <StatLabel>Rating</StatLabel>
                </StatItem>
              </CategoryStats>
              
              <CategoryDescription>
                {category.description}
              </CategoryDescription>
              
              <ExploreButton
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Explore {category.name}
              </ExploreButton>
            </CategoryCard>
          );
        })}
      </CategoriesGrid>
    </CategoriesContainer>
  );
};

export default Categories;