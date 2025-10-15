import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Question } from '../../../types/survey';

interface VideoAutoplayProps {
  question: Question;
  onComplete: (answer: string) => void;
  disabled?: boolean;
}

const VideoAutoplay: React.FC<VideoAutoplayProps> = ({ question, onComplete, disabled = false }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const [showContinue, setShowContinue] = useState(false);
  const [iframeUrl, setIframeUrl] = useState<string>('');
  const completionTimerRef = useRef<number | null>(null);
  const hasCompleted = useRef(false);

  const handleCompletion = (status: 'watched' | 'skipped') => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[VideoAutoplay] handleCompletion called with status:', status);
      console.log('[VideoAutoplay] hasCompleted.current:', hasCompleted.current);
      console.log('[VideoAutoplay] question.persistVideo:', question.persistVideo);
    }
    
    if (hasCompleted.current) return;
    hasCompleted.current = true;
    
    // For persistVideo, we need to handle completion differently
    if (question.persistVideo) {
      // Just submit the answer without auto-advancing
      if (process.env.NODE_ENV === 'development') {
        console.log('[VideoAutoplay] Calling onComplete with status:', status);
      }
      onComplete(status);
    } else {
      // Auto-advance after a delay
      if (process.env.NODE_ENV === 'development') {
        console.log('[VideoAutoplay] Auto-advancing after delay with status:', status);
      }
      setTimeout(() => onComplete(status), 1000);
    }
  };

  // Build VideoAsk iframe URL with flags we control
  const buildIframeUrl = (opts: { autoplay: boolean; muted: boolean }) => {
    if (!question.videoAskId) return '';
    const params = new URLSearchParams({
      justvideo: '1',
      autoplay: opts.autoplay ? '1' : '0',
      muted: opts.muted ? '1' : '0',
      playsinline: '1',
    });
    return `https://www.videoask.com/${question.videoAskId}?${params.toString()}`;
  };

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[VideoAutoplay] useEffect triggered');
      console.log('[VideoAutoplay] question:', question);
      console.log('[VideoAutoplay] disabled:', disabled);
    }
    
    if (!question.videoAskId) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[VideoAutoplay] No videoAskId, using regular video element');
      }
      const video = videoRef.current;
      if (video) {
        video.play().catch((err) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('[VideoAutoplay] Video play failed:', err);
          }
          setShowPlayButton(true);
        });
      }
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[VideoAutoplay] VideoAsk ID found:', question.videoAskId);
    }

    // Clear any existing timer when re-evaluating
    if (completionTimerRef.current) {
      clearTimeout(completionTimerRef.current);
      completionTimerRef.current = null;
    }

    // If this video is no longer the active question, leave it exactly as-is
    // Do not reload, pause, or modify the iframe so playback state persists
    if (disabled) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[VideoAutoplay] Component is disabled, skipping setup');
      }
      return;
    }

    // Active question instance: load paused (no autoplay)
    const url = buildIframeUrl({ autoplay: false, muted: true });
    if (process.env.NODE_ENV === 'development') {
      console.log('[VideoAutoplay] Setting iframe URL:', url);
    }
    setIframeUrl(url);

    // Show Continue after expected duration; do not auto-advance
    const videoDuration = question.duration
      ? parseInt(question.duration.match(/\d+/)?.[0] || '60') * 1000
      : 60000;
    const showContinueTime = videoDuration + 2000;
    if (process.env.NODE_ENV === 'development') {
      console.log('[VideoAutoplay] Setting continue button timer for', showContinueTime, 'ms');
    }
    const t = window.setTimeout(() => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[VideoAutoplay] Timer expired, showing continue button');
      }
      setShowContinue(true);
    }, showContinueTime);
    completionTimerRef.current = t as unknown as number;

    // Optional: enable early Continue on completion-like events
    const handleMessage = (event: MessageEvent) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[VideoAutoplay] Received postMessage from:', event.origin);
        console.log('[VideoAutoplay] Message data:', event.data);
      }
      
      if (!event.origin.includes('videoask.com') || hasCompleted.current) {
        if (!event.origin.includes('videoask.com')) {
          if (process.env.NODE_ENV === 'development') {
            console.log('[VideoAutoplay] Ignoring message from non-VideoAsk origin');
          }
        }
        if (hasCompleted.current) {
          if (process.env.NODE_ENV === 'development') {
            console.log('[VideoAutoplay] Ignoring message, already completed');
          }
        }
        return;
      }
      
      const evt = event.data?.type || event.data?.event;
      if (evt && process.env.NODE_ENV === 'development') {
        console.log('[VideoAutoplay] VideoAsk event type:', evt);
      }
      if (
        event.data?.type === 'video_complete' ||
        event.data?.type === 'videoask_completed' ||
        event.data?.event === 'ended'
      ) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[VideoAutoplay] Video completion event detected, showing continue button');
        }
        setShowContinue(true);
      }
    };
    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
      if (completionTimerRef.current) {
        clearTimeout(completionTimerRef.current);
        completionTimerRef.current = null;
      }
    };
  }, [question.videoAskId, onComplete, disabled]);

  const handlePlayClick = () => {
    const video = videoRef.current;
    if (video) {
      video.play();
      setShowPlayButton(false);
    }
  };

  const handleSkipClick = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[VideoAutoplay] Skip button clicked');
    }
    if (completionTimerRef.current) {
      clearTimeout(completionTimerRef.current);
      completionTimerRef.current = null;
    }
    // Persist the iframe exactly as-is (playing or paused) and advance
    handleCompletion('skipped');
  };
  // No tap-to-start overlay; user can press play in the embedded controls

  if (process.env.NODE_ENV === 'development') {
    console.log('[VideoAutoplay] Rendering component');
    console.log('[VideoAutoplay] iframeUrl:', iframeUrl);
    console.log('[VideoAutoplay] showContinue:', showContinue);
    console.log('[VideoAutoplay] disabled:', disabled);
  }

  return (
    <Container>
      <VideoWrapper>
        {question.videoAskId ? (
          <>
            <VideoAskIframe
              ref={iframeRef}
              src={iframeUrl}
              // Always omit autoplay permission for intro; we load it paused
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allow={'encrypted-media; fullscreen; display-capture'}
              title="Welcome video from Amanda"
              onLoad={() => {
                if (process.env.NODE_ENV === 'development') {
                  console.log('[VideoAutoplay] iframe loaded successfully');
                }
              }}
              onError={(e) => {
                if (process.env.NODE_ENV === 'development') {
                  console.error('[VideoAutoplay] iframe load error:', e);
                }
              }}
            />
            {/* No overlay; showing the player in paused state */}
          </>
        ) : (
          <>
            <Video
              ref={videoRef}
              src={question.videoUrl}
              controls
              onEnded={() => handleCompletion('watched')}
              playsInline
              loop={false}
            />
            {showPlayButton && (
              <PlayButtonOverlay onClick={handlePlayClick}>
                <PlayButton>▶️</PlayButton>
              </PlayButtonOverlay>
            )}
          </>
        )}
      </VideoWrapper>
      {!disabled && (
        <ButtonsRow>
          <SkipButton onClick={handleSkipClick}>Skip Video →</SkipButton>
          {showContinue && (
            <ContinueButton onClick={() => handleCompletion('watched')}>Continue →</ContinueButton>
          )}
        </ButtonsRow>
      )}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.md};
  width: 100%;
`;

const VideoWrapper = styled.div`
  position: relative;
  width: 280px;
  aspect-ratio: 9 / 16;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  margin-left: 48px; // Align with bot messages
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    margin-left: 0;
    width: 200px;
  }
`;

const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #000;
`;

const SkipButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  margin-left: 48px; // Align with video
  align-self: flex-start;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: underline;
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    margin-left: 0;
  }
`;

const ContinueButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.text.inverse};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
  margin-left: ${({ theme }) => theme.spacing.md};
  align-self: flex-start;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    filter: brightness(0.95);
  }
`;

const ButtonsRow = styled.div`
  display: flex;
  align-items: center;
  margin-left: 48px;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    margin-left: 0;
  }
`;

const PlayButtonOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  cursor: pointer;
`;

const PlayButton = styled.div`
  width: 80px;
  height: 80px;
  background: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  color: ${({ theme }) => theme.colors.text.inverse};
  transition: transform ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    transform: scale(1.1);
  }
`;

const VideoAskIframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
`;

// No overlays rendered in paused mode

export default VideoAutoplay;
