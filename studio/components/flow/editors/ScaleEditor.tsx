"use client";

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { SurveyBlock } from '../types';

interface ScaleEditorProps {
  block: SurveyBlock;
  onChange: (field: string, value: any) => void;
}

export function ScaleEditor({ block, onChange }: ScaleEditorProps) {
  const options = block.options || [];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="content">Question Text *</Label>
        <Textarea
          id="content"
          value={block.content || ''}
          onChange={(e) => onChange('content', e.target.value)}
          placeholder="Enter your question..."
          rows={4}
          className="resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="variable">Variable Name</Label>
        <Input
          id="variable"
          value={block.variable || ''}
          onChange={(e) => onChange('variable', e.target.value)}
          placeholder="e.g., satisfaction_rating"
          className="font-mono text-sm"
        />
      </div>

      <div className="space-y-4">
        <Label>Scale Preview</Label>
        <div className="p-4 border rounded-lg bg-gray-50">
          <div className="text-sm text-gray-600 mb-3">
            {options.length} point scale
          </div>
          <div className="grid grid-cols-5 gap-2">
            {options.slice(0, 10).map((option, index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-1 p-2 bg-white border rounded"
              >
                <span className="text-lg">{option.emoji || '⭐'}</span>
                <span className="text-xs font-semibold">{option.value}</span>
                {option.label && option.label !== option.value && (
                  <span className="text-xs text-gray-500 text-center line-clamp-2">
                    {option.label}
                  </span>
                )}
              </div>
            ))}
          </div>
          {options.length > 10 && (
            <div className="mt-2 text-xs text-gray-500 text-center">
              + {options.length - 10} more options
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500">
          Scale options are typically generated automatically (1-5, 1-10, etc.).
          To customize, switch to the Logic tab.
        </p>
      </div>
    </div>
  );
}
