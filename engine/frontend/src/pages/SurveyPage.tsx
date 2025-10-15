// frontend/src/pages/SurveyPage.tsx
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { ChatInterface, ProgressBar } from '@nesolagus/survey-components';
import { initializeSurvey, resumeSurvey } from '../store/slices/surveySlice';
import { surveyApi } from '../services/api';
import { useThemeConfig } from '../contexts/ConfigContext';
import { captureFirstTouchTracking } from '../utils/tracking';

const SurveyPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const themeConfig = useThemeConfig();
  const { sessionId, progress, currentQuestion } = useAppSelector((state) => state.survey);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [existingSessionId, setExistingSessionId] = useState<string | null>(null);

  const logoUrl = themeConfig?.assets?.logo;

  // Hide header after b0a (second part of opening message)
  const showHeader = !currentQuestion || currentQuestion.id === 'b0' || currentQuestion.id === 'b0a';

  useEffect(() => {
    // Capture first-touch attribution (UTM, referrer, cohort) on initial load
    captureFirstTouchTracking();

    const checkForExistingSession = async () => {
      const sessionCheck = await surveyApi.checkExistingSession();
      
      if (sessionCheck.exists && sessionCheck.sessionId && !sessionCheck.state?.isComplete) {
        setExistingSessionId(sessionCheck.sessionId);
        setShowResumePrompt(true);
      } else {
        dispatch(initializeSurvey());
      }
    };
    
    checkForExistingSession();
  }, [dispatch]);

  const handleResume = () => {
    if (existingSessionId) {
      dispatch(resumeSurvey(existingSessionId));
      setShowResumePrompt(false);
    }
  };

  const handleStartNew = () => {
    dispatch(initializeSurvey());
    setShowResumePrompt(false);
  };

  if (showResumePrompt) {
    return (
      <Container>
        <ResumePrompt>
          <PromptCard>
            {logoUrl && (
              <LogoContainer>
                <LogoImage $logoUrl={logoUrl} />
              </LogoContainer>
            )}
            <PromptTitle>Welcome Back!</PromptTitle>
            <PromptText>
              We found your previous survey session. Would you like to continue where you left off?
            </PromptText>
            <ButtonGroup>
              <PrimaryButton onClick={handleResume}>Continue Survey</PrimaryButton>
              <SecondaryButton onClick={handleStartNew}>Start New Survey</SecondaryButton>
            </ButtonGroup>
          </PromptCard>
        </ResumePrompt>
      </Container>
    );
  }

  return (
    <Container>
      <Header $showLogo={showHeader}>
        <HeaderBackground />
        <HeaderContent>
          {showHeader && logoUrl && (
            <LogoContainer>
              <LogoImage $logoUrl={logoUrl} />
            </LogoContainer>
          )}
          {sessionId && <ProgressBar progress={progress} />}
        </HeaderContent>
      </Header>
      <ChatInterface />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.background} 0%, ${({ theme }) => theme.colors.surfaceAlt || theme.colors.background} 100%);
`;

const Header = styled.header<{ $showLogo: boolean }>`
  position: relative;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.background} 0%, ${({ theme }) => theme.colors.surfaceAlt || theme.colors.background} 100%);
  border-bottom: 2px solid ${({ theme }) => theme.colors.border}40;
  position: sticky;
  top: 0;
  z-index: 100;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;

  /* Reduce height when logo is hidden */
  ${({ $showLogo }) => !$showLogo && `
    padding: 0;
  `}
`;

const HeaderBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.03;
  background-image: 
    radial-gradient(circle at 20% 50%, #4A90E2 0%, transparent 50%),
    radial-gradient(circle at 80% 50%, #B2BB1C 0%, transparent 50%);
  pointer-events: none;
`;

const HeaderContent = styled.div`
  position: relative;
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xl};
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const LogoImage = styled.div<{ $logoUrl: string }>`
  width: 216px;
  height: 108px;
  background-image: url(${props => props.$logoUrl});
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;

  /* Blend white background with header */
  mix-blend-mode: multiply;
  filter: contrast(1.1);

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    width: 180px;
    height: 90px;
  }
`;

const ResumePrompt = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.background} 0%, ${({ theme }) => theme.colors.surfaceAlt || theme.colors.background} 100%);
  padding: ${({ theme }) => theme.spacing.xl};
`;

const PromptCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 16px;
  padding: ${({ theme }) => theme.spacing.xl};
  max-width: 500px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const PromptTitle = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-size: 28px;
`;

const PromptText = styled.p`
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  font-size: 16px;
  line-height: 1.6;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: center;
  flex-direction: column;
  
  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-direction: row;
  }
`;

const PrimaryButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
  
  &:hover {
    background: #003d7a; /* Darker shade of primary */
  }
`;

const SecondaryButton = styled.button`
  background: transparent;
  color: ${({ theme }) => theme.colors.primary};
  border: 2px solid ${({ theme }) => theme.colors.primary};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
  }
`;

export default SurveyPage;
