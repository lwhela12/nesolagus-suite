/**
 * Preview API Client
 * Communicates with the engine backend preview endpoints
 */

const PREVIEW_API_BASE = process.env.NEXT_PUBLIC_ENGINE_API_URL || 'http://localhost:3001/api';

export interface PreviewStartRequest {
  config: any;
  name?: string;
}

export interface PreviewStartResponse {
  sessionId: string;
  responseId: string;
  firstQuestion: any;
}

export interface PreviewAnswerRequest {
  sessionId: string;
  questionId: string;
  answer: any;
}

export interface PreviewAnswerResponse {
  nextQuestion: any | null;
  progress: number;
}

class PreviewApiClient {
  /**
   * Start a preview session with a custom survey config
   */
  async startPreview(request: PreviewStartRequest): Promise<PreviewStartResponse> {
    const response = await fetch(`${PREVIEW_API_BASE}/preview/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to start preview' }));
      throw new Error(error.message || 'Failed to start preview');
    }

    return response.json();
  }

  /**
   * Submit an answer in preview mode
   */
  async submitAnswer(request: PreviewAnswerRequest): Promise<PreviewAnswerResponse> {
    const response = await fetch(`${PREVIEW_API_BASE}/preview/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to submit answer' }));
      throw new Error(error.message || 'Failed to submit answer');
    }

    return response.json();
  }

  /**
   * Clear a preview session
   */
  async clearSession(sessionId: string): Promise<void> {
    await fetch(`${PREVIEW_API_BASE}/preview/session/${sessionId}`, {
      method: 'DELETE',
    });
  }
}

export const previewApi = new PreviewApiClient();
