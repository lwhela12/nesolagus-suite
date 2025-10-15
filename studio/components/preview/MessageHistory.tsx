"use client";

import React from "react";
import styled from "styled-components";

interface Message {
  id: string;
  type: "bot" | "user";
  content: string;
  timestamp: number;
}

interface MessageHistoryProps {
  messages: Message[];
}

export function MessageHistory({ messages }: MessageHistoryProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (messages.length === 0) {
    return null;
  }

  return (
    <Container>
      {messages.map((message) => (
        <MessageRow key={message.id} type={message.type}>
          <MessageBubble type={message.type}>
            <MessageText>{message.content}</MessageText>
          </MessageBubble>
        </MessageRow>
      ))}
      <div ref={messagesEndRef} />
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const MessageRow = styled.div<{ type: "bot" | "user" }>`
  display: flex;
  justify-content: ${({ type }) => type === "user" ? "flex-end" : "flex-start"};
`;

const MessageBubble = styled.div<{ type: "bot" | "user" }>`
  max-width: 80%;
  border-radius: 1rem;
  padding: 0.75rem 1rem;
  animation: fadeIn 0.3s ease-out;

  ${({ theme, type }) =>
    type === "bot"
      ? `
        background: ${theme.colors.botBubble || '#D9F7FF'};
        color: ${theme.colors.text?.primary || theme.colors.text.primary};
        box-shadow: ${theme.shadows.sm};
        border: 1px solid rgba(0, 0, 0, 0.05);
      `
      : `
        background: ${theme.colors.userBubble || '#2F2F2F'};
        color: ${theme.colors.text?.inverse || 'white'};
        box-shadow: ${theme.shadows.md};
      `
  }

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

const MessageText = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.fonts?.sizes?.base || '0.875rem'};
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
`;
