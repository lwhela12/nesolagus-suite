import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Question } from '../../../types/survey';

interface VideoAskQuestionProps {
  question: Question;
  onAnswer: (answer: any) => void;
  disabled?: boolean;
  sessionId?: string | null;
  responseId?: string | null;
}

const VideoAskQuestion: React.FC<VideoAskQuestionProps> = ({ question, onAnswer, disabled, sessionId, responseId }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasResponded, setHasResponded] = useState(false);
  // No device sniffing needed when loading paused

  useEffect(() => {
    const loadingTimeout = setTimeout(() => setIsLoading(false), 3000);

    const handleMessage = (event: MessageEvent) => {
      if (!event.origin.includes('videoask.com') || (iframeRef.current && event.source !== iframeRef.current.contentWindow)) {
        return;
      }

      if (event.data.event === 'form_mounted') {
        setIsLoading(false);
        clearTimeout(loadingTimeout);
      }

      if (event.data.type === 'videoask_submitted' || event.data.event === 'response_received' || event.data.type === 'response') {
        if (hasResponded) return;
        setHasResponded(true);
        
        const answerData = {
          type: event.data.mediaType || event.data.response_type || 'video',
          responseId: event.data.questionId || event.data.response_id || null,
          contactId: event.data.contactId || null,
          responseUrl: event.data.response_url || event.data.responseUrl || null,
          transcript: event.data.transcript || null
        };
        onAnswer(answerData);
      }

      if (event.data.event === 'form_closed' || event.data.type === 'close') {
        if (!hasResponded) {
          onAnswer({ type: 'skipped' });
        }
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      clearTimeout(loadingTimeout);
      window.removeEventListener('message', handleMessage);
    };
  }, [question.id, onAnswer, hasResponded]);

  const handleSkip = () => {
    // Do not manipulate iframe state; just submit skip
    onAnswer({ type: 'skipped' });
  };

  // Build VideoAsk iframe URL with hidden variables to correlate webhook
  // - sid: current survey sessionId (backend can map to response_id)
  // - bid: blockId (question.id, e.g., b7 or b12)
  const params = new URLSearchParams({
    autoplay: '0',
    muted: '0',
    playsinline: '1',
    delay_response: '1',
  });
  if (sessionId) params.set('sid', sessionId);
  if (responseId) params.set('rid', responseId);
  if (question?.id) params.set('bid', question.id);
  const videoAskSrc = `https://www.videoask.com/${question.videoAskFormId}?${params.toString()}`;

  return (
    <Container>
      {isLoading && (
        <LoadingOverlay>
          <LoadingSpinner />
          <LoadingText>Loading video question...</LoadingText>
        </LoadingOverlay>
      )}
      
      <VideoAskWrapper $isLoading={isLoading}>
        <StyledIframe
          ref={iframeRef}
          src={videoAskSrc}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="camera; microphone; autoplay; encrypted-media; fullscreen; display-capture;"
          title="Video question from Amanda"
        />
      </VideoAskWrapper>

      <ButtonContainer>
        <SkipButton onClick={handleSkip} disabled={disabled || hasResponded}>
          {hasResponded ? 'Response recorded' : 'Skip this question'}
        </SkipButton>
      </ButtonContainer>
    </Container>
  );
};

// ... styled components remain the same

const Container = styled.div`
  width: 100%;
  position: relative;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.surface};
  z-index: 10;
  min-height: 400px;
`;

const LoadingSpinner = styled.div`
  width: 48px;
  height: 48px;
  border: 3px solid ${({ theme }) => theme.colors.border};
  border-top-color: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.p`
  margin-top: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.fontSizes.base};
`;

const VideoAskWrapper = styled.div<{ $isLoading: boolean }>`
  max-width: 420px;
  margin: 0 auto;
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  overflow: hidden;
  opacity: ${({ $isLoading }) => ($isLoading ? 0 : 1)};
  transition: opacity 0.3s ease-in-out;
  aspect-ratio: 2/3;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    max-width: 90%;
  }
`;

const StyledIframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.xl};
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

const SkipButton = styled.button`
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.fontSizes.base};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.background};
    border-color: ${({ theme }) => theme.colors.text.secondary};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export default VideoAskQuestion;
