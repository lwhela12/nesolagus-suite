"use client";

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { SurveyBlock } from '../types';

interface TextInputEditorProps {
  block: SurveyBlock;
  onChange: (field: string, value: any) => void;
}

export function TextInputEditor({ block, onChange }: TextInputEditorProps) {
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
        <p className="text-xs text-gray-500">
          The main question text that will be displayed to respondents.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="variable">Variable Name</Label>
        <Input
          id="variable"
          value={block.variable || ''}
          onChange={(e) => onChange('variable', e.target.value)}
          placeholder="e.g., feedback_text"
          className="font-mono text-sm"
        />
        <p className="text-xs text-gray-500">
          Used to reference this answer in data exports and analysis.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="placeholder">Placeholder Text</Label>
        <Input
          id="placeholder"
          value={block.placeholder || ''}
          onChange={(e) => onChange('placeholder', e.target.value)}
          placeholder="e.g., Type your answer here..."
        />
        <p className="text-xs text-gray-500">
          Helpful hint shown in the text field before user types.
        </p>
      </div>
    </div>
  );
}
