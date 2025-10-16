"use client";

import { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SurveyBlock } from '../types';

interface ChoiceEditorProps {
  block: SurveyBlock;
  onChange: (field: string, value: any) => void;
}

export function ChoiceEditor({ block, onChange }: ChoiceEditorProps) {
  const options = block.options || [];

  const handleOptionChange = (index: number, field: 'id' | 'label' | 'value', value: string) => {
    const newOptions = [...options];
    newOptions[index] = {
      ...newOptions[index],
      [field]: value,
    };
    onChange('options', newOptions);
  };

  const handleAddOption = () => {
    const newOptions = [
      ...options,
      {
        id: `option-${options.length + 1}`,
        label: '',
        value: `option-${options.length + 1}`,
      },
    ];
    onChange('options', newOptions);
  };

  const handleDeleteOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    onChange('options', newOptions);
  };

  const isMultiChoice = block.type === 'multi-choice';

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
          placeholder={isMultiChoice ? "e.g., selected_topics" : "e.g., user_choice"}
          className="font-mono text-sm"
        />
      </div>

      {isMultiChoice && (
        <div className="space-y-2">
          <Label htmlFor="maxSelections">Maximum Selections</Label>
          <Input
            id="maxSelections"
            type="number"
            value={block.maxSelections || options.length}
            onChange={(e) => onChange('maxSelections', parseInt(e.target.value) || options.length)}
            min={1}
            max={options.length}
          />
          <p className="text-xs text-gray-500">
            Maximum number of options users can select.
          </p>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Options ({options.length})</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddOption}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Option
          </Button>
        </div>

        <div className="space-y-3">
          {options.map((option, index) => (
            <div
              key={index}
              className="flex items-start gap-2 p-3 border rounded-lg bg-gray-50"
            >
              <div className="flex-1 space-y-2">
                <Input
                  value={option.label}
                  onChange={(e) => handleOptionChange(index, 'label', e.target.value)}
                  placeholder="Option label"
                  className="bg-white"
                />
                <div className="flex gap-2">
                  <Input
                    value={option.id}
                    onChange={(e) => handleOptionChange(index, 'id', e.target.value)}
                    placeholder="option-id"
                    className="bg-white font-mono text-xs flex-1"
                  />
                  <Input
                    value={option.value}
                    onChange={(e) => handleOptionChange(index, 'value', e.target.value)}
                    placeholder="value"
                    className="bg-white font-mono text-xs flex-1"
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteOption(index)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}

          {options.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">
              No options yet. Click "Add Option" to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
