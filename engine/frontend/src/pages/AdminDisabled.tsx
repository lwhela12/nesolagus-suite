import styled from 'styled-components';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.colors.background};
  padding: 2rem;
`;

const Card = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: 3rem;
  max-width: 600px;
  box-shadow: ${props => props.theme.shadows.lg};
  text-align: center;
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.fontSizes['3xl']};
  margin-bottom: 1rem;
  font-family: ${props => props.theme.fonts.display};
`;

const Message = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.fontSizes.lg};
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const Code = styled.code`
  background: ${props => props.theme.colors.surfaceAlt || '#f5f5f5'};
  padding: 0.75rem 1rem;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.fontSizes.sm};
  display: block;
  margin: 1rem 0;
  text-align: left;
  color: ${props => props.theme.colors.text.primary};
`;

const Link = styled.a`
  color: ${props => props.theme.colors.primary};
  text-decoration: none;
  font-weight: ${props => props.theme.fontWeights.semibold};

  &:hover {
    text-decoration: underline;
  }
`;

const BackButton = styled.button`
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.fontSizes.base};
  font-weight: ${props => props.theme.fontWeights.semibold};
  cursor: pointer;
  margin-top: 1rem;

  &:hover {
    opacity: 0.9;
  }
`;

const AdminDisabled = () => {
  return (
    <Container>
      <Card>
        <Title>🔒 Admin Panel Disabled</Title>
        <Message>
          The admin panel is not configured. To enable admin features, you need to set up Clerk authentication.
        </Message>

        <Message>
          <strong>To enable the admin panel:</strong>
        </Message>

        <ol style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>
            Create a free account at <Link href="https://clerk.com" target="_blank">clerk.com</Link>
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            Get your publishable key from the <Link href="https://dashboard.clerk.com/last-active?path=api-keys" target="_blank">Clerk dashboard</Link>
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            Add it to your <code>.env</code> file:
          </li>
        </ol>

        <Code>
          VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
        </Code>

        <Message style={{ fontSize: '0.9rem', color: '#666' }}>
          Note: The survey itself works fine without admin access. Admin is only needed to view responses.
        </Message>

        <BackButton onClick={() => window.location.href = '/'}>
          Back to Survey
        </BackButton>
      </Card>
    </Container>
  );
};

export default AdminDisabled;
