import PropTypes from 'prop-types';
import styled from 'styled-components';
import React from 'react';

const Container = styled.div`
  min-height: 100%;
  background-image: ${p => p.theme.colors.bg.darkGradient};
  border-left: 2px solid rgb(46, 46, 46);
`;

const Header = styled.header`
  padding: 2.4rem 4.8rem;
  background-color: ${p => p.theme.colors.bg.dark};
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  margin: 0;
  ${p => p.theme.text.big};
`;

const DarkLayout = props => {
  const { children, title } = props;

  return (
    <Container>
      <Header>
        <Title>{title}</Title>
      </Header>
      {children}
    </Container>
  );
};

DarkLayout.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired
};

export default DarkLayout;
