import React from 'react';
import styled from 'styled-components';
import { Card } from './ui/Card';
import QuestionBreakdown from './QuestionBreakdown';
import { useDashboardConfig } from './dashboard/useDashboardConfig';
import { DashboardRenderer } from './dashboard/DashboardRenderer';

const AdminOverview: React.FC = () => {
  const { config, isLoading, error } = useDashboardConfig();

  return (
    <Container>
      <PageHeader>
        <Title>{config?.metadata?.title ?? 'Dashboard Overview'}</Title>
        {config?.metadata?.description && <Subtitle>{config.metadata.description}</Subtitle>}
      </PageHeader>

      <DashboardSection>
        {isLoading && <EmptyCard>Loading dashboard…</EmptyCard>}
        {!isLoading && error && <EmptyCard>{error}</EmptyCard>}
        {!isLoading && !error && config && <DashboardRenderer config={config} />}
        {!isLoading && !error && !config && (
          <EmptyCard>No dashboard configured yet. Configure one in Studio.</EmptyCard>
        )}
      </DashboardSection>

      <QuestionBreakdown />
    </Container>
  );
};

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing['2xl']};
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  margin: 0;
`;

const DashboardSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing['3xl']};
`;

const EmptyCard = styled(Card)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing['2xl']};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.fontSizes.base};
  text-align: center;
`;

export default AdminOverview;
