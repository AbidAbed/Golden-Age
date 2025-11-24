import React from 'react';
import styled from 'styled-components';
import Hero from '../components/Hero';
import Categories from '../components/Categories';

const Container = styled.div`
  min-height: 100vh;
  padding-top: 70px;
`;

const Home = () => {
  return (
    <Container>
      <Hero />
      <Categories />
    </Container>
  );
};

export default Home;