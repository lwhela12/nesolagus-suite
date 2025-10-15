import React from 'react';
import styled from 'styled-components';
import { useSurveyConfig, useThemeConfig } from '../../contexts/ConfigContext';

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const surveyConfig = useSurveyConfig();
  const themeConfig = useThemeConfig();

  const surveyName = surveyConfig?.survey.name || 'Survey';
  const organizationName = themeConfig?.metadata.organizationName || '';
  const estimatedMinutes = surveyConfig?.survey.metadata?.estimatedMinutes;

  return (
    <Container>
      <ContentWrapper>
        <MainTitle>{surveyName}</MainTitle>

        {organizationName && (
          <Subtitle>
            <LightText>{organizationName}</LightText>
          </Subtitle>
        )}

        {estimatedMinutes && (
          <EstimatedTime>
            <LightText>Estimated time: {estimatedMinutes} minutes</LightText>
          </EstimatedTime>
        )}

        <StartButton onClick={onStart}>
          <ButtonText>Let&apos;s Start!</ButtonText>
        </StartButton>
      </ContentWrapper>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xl} 0;
  position: relative;
  background: transparent;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: ${({ theme }) => theme.spacing.lg};
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xl};
  max-width: 800px;
  width: 100%;
  text-align: center;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    gap: ${({ theme }) => theme.spacing.lg};
  }
`;

const MainTitle = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 96px;
  font-family: ${({ theme }) => theme.fonts.display};
  font-weight: 700;
  line-height: 1.1;
  margin: 0;
  letter-spacing: -3px;
  font-style: normal;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: 72px;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: 48px;
    letter-spacing: -1px;
  }
`;

const Subtitle = styled.div`
  font-size: 36px;
  line-height: 1.3;
  margin-top: -${({ theme }) => theme.spacing.md};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: 28px;
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: 20px;
    margin-top: 0;
  }
`;

const LightText = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-family: 'Inter', sans-serif;
  font-weight: 300;
  letter-spacing: -0.5px;
`;

const EstimatedTime = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  opacity: 0.8;
`;

const HighlightedName = styled.span`
  color: ${({ theme }) => theme.colors.secondary};
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  letter-spacing: -0.5px;
`;

const StartButton = styled.button`
  background: #0055A5;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 42px;
  border: none;
  padding: 24px 60px;
  cursor: pointer;
  transition: transform ${({ theme }) => theme.transitions.normal}, box-shadow ${({ theme }) => theme.transitions.normal}, background ${({ theme }) => theme.transitions.normal};
  margin-top: ${({ theme }) => theme.spacing.lg};
  
  &:hover {
    background: #B2BB1C;
    transform: translateY(-2px);
    box-shadow: 0px 6px 8px rgba(0, 0, 0, 0.3);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.25);
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: 20px 48px;
    width: 100%;
    max-width: 320px;
  }
`;

const ButtonText = styled.span`
  color: #FFF8F1;
  font-size: 32px;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: 24px;
  }
`;

export default WelcomeScreen;
