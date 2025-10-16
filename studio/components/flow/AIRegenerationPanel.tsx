"use client";

import { useState } from 'react';
import { Sparkles, Loader2, Check, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SurveyBlock } from './types';

interface AIRegenerationPanelProps {
  block: SurveyBlock;
  onRegenerate: (regeneratedBlock: SurveyBlock) => void;
}

export function AIRegenerationPanel({
  block,
  onRegenerate,
}: AIRegenerationPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSuggestion, setGeneratedSuggestion] = useState<SurveyBlock | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (customPrompt?: string) => {
    const userPrompt = customPrompt || prompt;
    if (!userPrompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedSuggestion(null);

    try {
      // TODO: Implement actual AI generation
      // For now, just simulate with a timeout
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock response
      const suggestion = {
        ...block,
        content: `[AI Generated] ${block.content}`,
      };

      setGeneratedSuggestion(suggestion);
    } catch (err) {
      setError('Failed to generate suggestion. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAccept = () => {
    if (generatedSuggestion) {
      onRegenerate(generatedSuggestion);
      setGeneratedSuggestion(null);
      setPrompt('');
    }
  };

  const handleReject = () => {
    setGeneratedSuggestion(null);
  };

  const quickActions = [
    { label: 'Make more formal', prompt: 'Rewrite this question in a more formal, professional tone.' },
    { label: 'Make more casual', prompt: 'Rewrite this question in a more casual, friendly tone.' },
    { label: 'Make more engaging', prompt: 'Rewrite this question to be more engaging and compelling.' },
    { label: 'Simplify language', prompt: 'Simplify the language and make it easier to understand.' },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-purple-600">
          <Sparkles className="w-5 h-5" />
          <h3 className="font-semibold">AI-Powered Regeneration</h3>
        </div>
        <p className="text-sm text-gray-600">
          Use AI to improve or rewrite this question. Describe what you'd like to change, or use a quick action below.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ai-prompt">Your Instructions</Label>
        <Textarea
          id="ai-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="E.g., 'Make this question more specific to property owners' or 'Add more context about the BID's role'"
          rows={4}
          className="resize-none"
          disabled={isGenerating}
        />
      </div>

      <div className="space-y-2">
        <Label>Quick Actions</Label>
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleGenerate(action.prompt)}
              disabled={isGenerating}
              className="justify-start text-left h-auto py-2 px-3"
            >
              <Sparkles className="w-3 h-3 mr-2 flex-shrink-0" />
              <span className="text-xs">{action.label}</span>
            </Button>
          ))}
        </div>
      </div>

      <Button
        onClick={() => handleGenerate()}
        disabled={isGenerating || !prompt.trim()}
        className="w-full"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Generate with AI
          </>
        )}
      </Button>

      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      )}

      {generatedSuggestion && (
        <Card className="p-4 border-purple-200 bg-purple-50">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-purple-900">AI Suggestion</h4>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleReject}
                  className="text-red-600 border-red-200 hover:bg-red-100"
                >
                  <X className="w-4 h-4 mr-1" />
                  Reject
                </Button>
                <Button
                  size="sm"
                  onClick={handleAccept}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Accept
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-xs text-gray-600">Original</Label>
                <p className="text-sm mt-1 text-gray-700 bg-white p-3 rounded border">
                  {block.content || block.text || 'N/A'}
                </p>
              </div>

              <div>
                <Label className="text-xs text-purple-700">AI Generated</Label>
                <p className="text-sm mt-1 text-purple-900 bg-purple-100 p-3 rounded border border-purple-200 font-medium">
                  {generatedSuggestion.content || generatedSuggestion.text || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="text-xs text-gray-500 border-t pt-4">
        <p className="font-semibold mb-1">Note about AI generation:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-600">
          <li>AI suggestions should be reviewed and edited as needed</li>
          <li>Ensure regenerated questions maintain your survey's tone and intent</li>
          <li>Currently in preview mode - actual AI integration coming soon</li>
        </ul>
      </div>
    </div>
  );
}
