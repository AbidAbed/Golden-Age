import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { 
  FiSearch
} from 'react-icons/fi';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import SoftwareCard from '../components/SoftwareCard';

const Container = styled.div`
  min-height: 100vh;
  padding-top: 70px;
`;

const PageHeader = styled.section`
  // background: #1a1a1a; /* Solid dark background */
  padding: 60px 0;
  text-align: center;
  margin-bottom: 40px;
`;

const PageTitle = styled.h1`
  font-size: 48px;
  font-weight: 800;
  color: white;
  margin-bottom: 16px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
`;

const PageSubtitle = styled.p`
  font-size: 20px;
  color: rgba(255,255,255,0.9);
  max-width: 600px;
  margin: 0 auto;
`;

const FiltersSection = styled.section`
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px 0;
  margin-bottom: 40px;
`;

const FiltersContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

const FiltersRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
  justify-content: space-between;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;
  
  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 100px 12px 48px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  font-size: 14px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #ffd700; /* Golden border on focus */
    box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.1); /* Golden shadow on focus */
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const SearchIcon = styled(FiSearch)`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.5);
  font-size: 18px;
`;

const SearchButton = styled(motion.button)`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  padding: 8px 16px;
  background: linear-gradient(135deg, #ffd700, #ffb347);
  color: #000;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, #ffb347, #ffd700);
    transform: translateY(-50%) scale(1.05);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
    justify-content: space-between;
  }
`;

const FilterSelect = styled.select`
  padding: 10px 16px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #ffd700; /* Golden border on focus */
  }
  
  option {
    background: rgba(26, 26, 26, 0.95) !important;
    color: #ffffff !important;
  }
`;

const PostsGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 32px;
  margin-bottom: 60px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 24px;
    padding: 0 16px;
  }
`;

const LoadMoreButton = styled(motion.button)`
  display: block;
  margin: 40px auto;
  padding: 16px 32px;
  background: linear-gradient(135deg, #ffd700 0%, #daa520 100%); /* Golden gradient */
  border: none;
  border-radius: 12px;
  color: #000; /* Dark text for contrast */
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.3); /* Golden shadow */
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4); /* Enhanced golden shadow */
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: rgba(255, 255, 255, 0.7);
  
  h2 {
    font-size: 32px;
    color: #ffd700; /* Golden color */
    margin-bottom: 16px;
  }
  
  p {
    font-size: 18px;
    max-width: 400px;
    margin: 0 auto;
    line-height: 1.6;
  }
`;

const Browse = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPosts = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setCurrentPage(1);
      } else {
        setLoadingMore(true);
      }

      const params = {
        page: reset ? 1 : currentPage + 1,
        limit: 12,
        search: searchTerm,
        category: category !== 'all' ? category : undefined,
        sortBy,
        sortOrder: 'desc'
      };

      const response = await api.get('/posts', { params });
      const { posts: newPosts, totalPages: pages } = response.data;

      if (reset) {
        setPosts(newPosts);
        setCurrentPage(1);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
        setCurrentPage(prev => prev + 1);
      }

      setTotalPages(pages);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchTerm, category, sortBy, currentPage]);

  useEffect(() => {
    fetchPosts(true);
  }, [category, sortBy]);

  const handleSearchInput = (e) => {
    setSearchInput(e.target.value);
  };

  const handleSearchSubmit = () => {
    if (searchInput.trim()) {
      setSearchTerm(searchInput.trim());
      setCurrentPage(1);
      fetchPosts(true);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !loadingMore) {
      fetchPosts(false);
    }
  };

  return (
    <Container>
      <PageHeader>
        <PageTitle>🎯 Browse Software</PageTitle>
        <PageSubtitle>
          Discover and download the latest cracked software, games, and tools
        </PageSubtitle>
      </PageHeader>

      <FiltersSection>
        <FiltersContainer>
          <FiltersRow>
            <SearchContainer>
              <SearchIcon />
              <SearchInput
                type="text"
                placeholder="Search for software, games, tools..."
                value={searchInput}
                onChange={handleSearchInput}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
              />
              <SearchButton
                onClick={handleSearchSubmit}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Search
              </SearchButton>
            </SearchContainer>
            
            <FilterGroup>
              <FilterSelect value={category} onChange={handleCategoryChange}>
                <option value="all">All Categories</option>
                <option value="software">Software</option>
                <option value="game">Games</option>
                <option value="tool">Tools</option>
                <option value="plugin">Plugins</option>
                <option value="other">Other</option>
              </FilterSelect>
              
              <FilterSelect value={sortBy} onChange={handleSortChange}>
                <option value="createdAt">Latest</option>
                <option value="downloadCount">Most Downloaded</option>
                <option value="likes">Most Liked</option>
                <option value="title">A-Z</option>
              </FilterSelect>
            </FilterGroup>
          </FiltersRow>
        </FiltersContainer>
      </FiltersSection>

      {loading && <LoadingSpinner />}

      {posts.length > 0 ? (
        <>
          <PostsGrid>
            {posts.map((post, index) => (
              <SoftwareCard 
                key={post._id} 
                post={post} 
                index={index}
              />
            ))}
          </PostsGrid>
          
          {currentPage < totalPages && (
            <LoadMoreButton
              onClick={handleLoadMore}
              disabled={loadingMore}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {loadingMore ? 'Loading...' : 'Load More Software'}
            </LoadMoreButton>
          )}
        </>
      ) : (
        <EmptyState>
          <h2>🚫 No software found</h2>
          <p>Try adjusting your search criteria or check back later for new releases.</p>
        </EmptyState>
      )}
    </Container>
  );
};

export default Browse;
