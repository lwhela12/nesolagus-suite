"use client";

import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { ThemeProvider } from "styled-components";
import styled from "styled-components";
import { QuestionRenderer, ProgressBar, Question } from "@nesolagus/survey-components";
import { surveyTheme } from "@/lib/survey-theme";
import { MessageHistory } from "./MessageHistory";
import { previewApi } from "@/lib/preview-api";

interface PreviewRendererProps {
  config: any;
  onAnswer: (questionId: string, answer: any) => void;
  onProgress: (progress: number) => void;
  customTheme?: any;
}

interface Message {
  id: string;
  type: "bot" | "user";
  content: string;
  timestamp: number;
  question?: Question;
}

export function PreviewRenderer({ config, onAnswer, onProgress, customTheme }: PreviewRendererProps) {
  // Merge custom theme with default
  const theme = customTheme
    ? {
        ...surveyTheme,
        colors: {
          ...surveyTheme.colors,
          ...customTheme.colors,
          text: {
            ...surveyTheme.colors.text,
            ...customTheme.colors?.text,
          },
        },
        fonts: {
          ...surveyTheme.fonts,
          ...customTheme.fonts,
        },
        spacing: {
          ...surveyTheme.spacing,
          ...customTheme.spacing,
        },
      }
    : surveyTheme;

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useLayoutEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const raf = requestAnimationFrame(() => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    });

    return () => cancelAnimationFrame(raf);
  }, [messages.length, isTyping, currentQuestion?.id]);

  // Initialize preview session
  useEffect(() => {
    const initPreview = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await previewApi.startPreview({
          config,
          name: ''
        });

        setSessionId(response.sessionId);

        // Set current question and show typing, then add message after delay
        setCurrentQuestion(response.firstQuestion);
        setIsTyping(true);

        // Add first question message after typing delay (matches engine behavior)
        setTimeout(() => {
          setIsTyping(false);
          if (response.firstQuestion && response.firstQuestion.content) {
            setMessages([{
              id: `bot-${Date.now()}`,
              type: 'bot',
              content: response.firstQuestion.content,
              question: response.firstQuestion,
              timestamp: Date.now(),
            }]);
          }
        }, 600);

        setProgress(0);
        onProgress(0);
      } catch (err: any) {
        console.error('Failed to initialize preview:', err);
        setError(err.message || 'Failed to initialize preview');
      } finally {
        setIsLoading(false);
      }
    };

    initPreview();

    // Cleanup on unmount
    return () => {
      if (sessionId) {
        previewApi.clearSession(sessionId).catch(console.error);
      }
    };
  }, [config]); // Only reinitialize if config changes

  // Auto-advance for message blocks
  useEffect(() => {
    if (!currentQuestion || isLoading || isTyping) return;

    const shouldAutoAdvance =
      currentQuestion.type === 'dynamic-message' ||
      currentQuestion.type === 'final-message';

    if (shouldAutoAdvance) {
      const delay = (currentQuestion as any).autoAdvanceDelay || 1500;

      const timer = setTimeout(() => {
        handleAnswer('acknowledged');
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [currentQuestion, isLoading, isTyping]);

  const formatAnswerForDisplay = (answer: any, question: Question): string => {
    // Handle auto-advance markers
    if (answer === 'acknowledged' || answer === '_auto_advance_') {
      return '';
    }

    // Handle boolean answers
    if (typeof answer === 'boolean') {
      return answer ? 'Yes' : 'No';
    }

    // Handle option-based answers
    if (question.options && !Array.isArray(answer)) {
      const option = question.options.find((opt: any) => opt.value === answer || opt.id === answer);
      if (option) return option.label;
    }

    // Handle multi-select answers
    if (Array.isArray(answer) && question.options) {
      return answer
        .map((value) => {
          const option = question.options!.find((opt: any) => opt.value === value);
          return option?.label || value;
        })
        .join(', ');
    }

    // Handle semantic differential
    if (question.type === 'semantic-differential' && typeof answer === 'object' && answer !== null) {
      const lines: string[] = [];
      if (question.scales) {
        question.scales.forEach((scale: any) => {
          const value = (answer as any)[scale.variable];
          if (value) {
            const dots = Array(5).fill('○').map((dot, i) => i + 1 === value ? '●' : dot).join(' ');
            lines.push(dots);
          }
        });
      }
      return lines.join('\n');
    }

    // Handle contact form
    if (typeof answer === 'object' && answer !== null) {
      if (answer.email) return answer.email;
      if (answer.phone) return answer.phone;
      if (answer.text) return answer.text;
      if (answer.type === 'skipped') return 'Skipped';
    }

    // Default: return as string
    return String(answer);
  };

  const handleAnswer = async (answer: any) => {
    if (!currentQuestion || !sessionId || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      // Add user message if it's an actual answer (not auto-advance)
      const nonDisplayableTypes = new Set(['video-autoplay', 'videoask', 'dynamic-message']);

      if (answer !== 'acknowledged' && !nonDisplayableTypes.has(currentQuestion.type)) {
        const displayAnswer = formatAnswerForDisplay(answer, currentQuestion);
        if (displayAnswer) {
          setMessages((prev) => [
            ...prev,
            {
              id: `user-${Date.now()}`,
              type: 'user',
              content: displayAnswer,
              timestamp: Date.now(),
            },
          ]);
        }
      }

      // Call API to submit answer
      onAnswer(currentQuestion.id, answer);

      setIsTyping(true);

      const response = await previewApi.submitAnswer({
        sessionId,
        questionId: currentQuestion.id,
        answer,
      });

      // Update progress
      setProgress(response.progress);
      onProgress(response.progress);

      // Simulate typing delay to match engine behavior
      const shouldDelayForType = response.nextQuestion &&
        ['single-choice', 'multi-choice', 'semantic-differential', 'ranking'].includes(response.nextQuestion.type);
      const typingDuration = shouldDelayForType ? 3000 : 600;

      setTimeout(() => {
        setIsTyping(false);

        if (response.nextQuestion) {
          setCurrentQuestion(response.nextQuestion);

          // Add next question as bot message if it has content
          if (response.nextQuestion.content) {
            setMessages((prev) => [
              ...prev,
              {
                id: `bot-${Date.now()}`,
                type: 'bot',
                content: response.nextQuestion.content,
                question: response.nextQuestion,
                timestamp: Date.now(),
              },
            ]);
          }
        } else {
          // Survey complete
          setIsComplete(true);
          setCurrentQuestion(null);
          setProgress(100);
          onProgress(100);
        }
      }, typingDuration);

    } catch (err: any) {
      console.error('Failed to submit answer:', err);
      setError(err.message || 'Failed to submit answer');
      setIsTyping(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Preview Error</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!sessionId || (!currentQuestion && !isComplete)) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-gray-400">Loading preview...</div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <ThemeProvider theme={theme}>
        <Container>
          <ChatContainer>
            <ChatContent>
              <CompletionCard>
                <div style={{ fontSize: '3.75rem', marginBottom: '1rem' }}>✓</div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Survey Complete!</h2>
                <p style={{ color: '#6B7280' }}>Thank you for testing this survey.</p>
              </CompletionCard>
            </ChatContent>
          </ChatContainer>
        </Container>
      </ThemeProvider>
    );
  }

  // For final-message blocks
  if (currentQuestion?.type === 'final-message') {
    return (
      <ThemeProvider theme={theme}>
        <Container>
          <ChatContainer>
            <ChatContent>
              <MessageHistory messages={messages} />
              <MessageCard>
                <div style={{ fontSize: '3.75rem', marginBottom: '1.5rem' }}>🎉</div>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                  {currentQuestion.content || "Thank you!"}
                </h2>
                {(currentQuestion as any).buttonText && (
                  <button
                    onClick={() => {
                      setIsComplete(true);
                      setProgress(100);
                      onProgress(100);
                    }}
                    style={{
                      marginTop: '1.5rem',
                      padding: '0.75rem 2rem',
                      background: 'linear-gradient(to right, #3B82F6, #2563EB)',
                      color: 'white',
                      borderRadius: '0.5rem',
                      fontWeight: '500',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                    }}
                  >
                    {(currentQuestion as any).buttonText}
                  </button>
                )}
              </MessageCard>
            </ChatContent>
          </ChatContainer>
        </Container>
      </ThemeProvider>
    );
  }

  // Regular question rendering
  // Dynamic-message blocks are auto-advance only (no UI), final-message has special UI, video types handled separately
  const nonRenderableTypes = new Set(['dynamic-message', 'final-message', 'videoask', 'video-autoplay']);
  const shouldRenderQuestion = currentQuestion && !nonRenderableTypes.has(currentQuestion.type as any);

  return (
    <ThemeProvider theme={theme}>
      <Container>
        {/* Progress Bar */}
        <ProgressBarContainer>
          <ProgressBar progress={progress} />
        </ProgressBarContainer>

        {/* Chat Area */}
        <ChatContainer ref={chatContainerRef}>
          <ChatContent>
            {/* Message History */}
            <MessageHistory messages={messages} />

            {/* Typing Indicator */}
            {isTyping && (
              <TypingIndicator>
                <TypingBubble>
                  <TypingDot delay="0ms" />
                  <TypingDot delay="150ms" />
                  <TypingDot delay="300ms" />
                </TypingBubble>
              </TypingIndicator>
            )}

            {/* Current Question - Input Area Only (content already in messages) */}
            {shouldRenderQuestion && !isTyping && (
              <QuestionArea>
                <QuestionRenderer
                  question={currentQuestion}
                  onAnswer={handleAnswer}
                  disabled={isLoading || isTyping}
                />
              </QuestionArea>
            )}
          </ChatContent>
        </ChatContainer>
      </Container>
    </ThemeProvider>
  );
}

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.background} 0%, ${({ theme }) => theme.colors.surfaceAlt || theme.colors.background} 100%);
`;

const ProgressBarContainer = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border}40;
  background: ${({ theme }) => theme.colors.background};
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
`;

const ChatContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
`;

const ChatContent = styled.div`
  max-width: 48rem;
  margin: 0 auto;
  padding: 3rem 1.5rem;
`;

const MessageCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 1rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  text-align: center;
  animation: fadeIn 0.4s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const CompletionCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  padding: 3rem;
  text-align: center;
`;

const TypingIndicator = styled.div`
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TypingBubble = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  display: flex;
  gap: 0.25rem;
`;

const TypingDot = styled.div<{ delay: string }>`
  width: 0.5rem;
  height: 0.5rem;
  background: ${({ theme }) => theme.colors.text.secondary};
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out;
  animation-delay: ${({ delay }) => delay};

  @keyframes bounce {
    0%, 80%, 100% {
      transform: scale(0);
      opacity: 0.5;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

const QuestionArea = styled.div`
  animation: fadeIn 0.4s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
