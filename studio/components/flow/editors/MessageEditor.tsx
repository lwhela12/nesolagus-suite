"use client";

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { SurveyBlock } from '../types';

interface MessageEditorProps {
  block: SurveyBlock;
  onChange: (field: string, value: any) => void;
}

export function MessageEditor({ block, onChange }: MessageEditorProps) {
  const isDynamicMessage = block.type === 'dynamic-message';

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="content">Message Text *</Label>
        <Textarea
          id="content"
          value={block.content || ''}
          onChange={(e) => onChange('content', e.target.value)}
          placeholder="Enter your message..."
          rows={6}
          className="resize-none"
        />
        <p className="text-xs text-gray-500">
          {isDynamicMessage
            ? 'Message will be displayed briefly before automatically advancing.'
            : 'Final message shown at the end of the survey.'}
        </p>
      </div>

      {isDynamicMessage && (
        <>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="autoAdvance" className="text-base">
                Auto Advance
              </Label>
              <p className="text-sm text-gray-500">
                Automatically continue to next block after delay
              </p>
            </div>
            <Switch
              id="autoAdvance"
              checked={block.autoAdvance !== false}
              onCheckedChange={(checked) => onChange('autoAdvance', checked)}
            />
          </div>

          {block.autoAdvance !== false && (
            <div className="space-y-2">
              <Label htmlFor="autoAdvanceDelay">Auto Advance Delay (ms)</Label>
              <Input
                id="autoAdvanceDelay"
                type="number"
                value={block.autoAdvanceDelay || 2000}
                onChange={(e) =>
                  onChange('autoAdvanceDelay', parseInt(e.target.value) || 2000)
                }
                min={500}
                max={10000}
                step={500}
              />
              <p className="text-xs text-gray-500">
                Time to display message before advancing ({((block.autoAdvanceDelay || 2000) / 1000).toFixed(1)} seconds)
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
