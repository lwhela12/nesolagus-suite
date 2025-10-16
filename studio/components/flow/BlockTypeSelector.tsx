"use client";

import { useState } from 'react';
import { Plus } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { BLOCK_TYPE_INFO } from './types';

interface BlockTypeSelectorProps {
  onAddBlock: (blockType: string) => void;
}

export function BlockTypeSelector({ onAddBlock }: BlockTypeSelectorProps) {
  const [showSelector, setShowSelector] = useState(false);

  const blockTypes = [
    { type: 'text-input', group: 'Questions' },
    { type: 'single-choice', group: 'Questions' },
    { type: 'multi-choice', group: 'Questions' },
    { type: 'scale', group: 'Questions' },
    { type: 'yes-no', group: 'Questions' },
    { type: 'dynamic-message', group: 'Messages' },
    { type: 'final-message', group: 'Messages' },
  ];

  const handleAddBlock = (blockType: string) => {
    onAddBlock(blockType);
    setShowSelector(false);
  };

  return (
    <div className="fixed bottom-8 right-8 z-10">
      {showSelector ? (
        <Card className="p-4 w-72 shadow-xl mb-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Add Block</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSelector(false)}
              >
                Cancel
              </Button>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-gray-600">Select block type:</p>
              {Object.entries(
                blockTypes.reduce((acc, { type, group }) => {
                  if (!acc[group]) acc[group] = [];
                  acc[group].push(type);
                  return acc;
                }, {} as Record<string, string[]>)
              ).map(([group, types]) => (
                <div key={group} className="space-y-1">
                  <p className="text-xs font-semibold text-gray-500">{group}</p>
                  <div className="grid gap-1">
                    {types.map((type) => {
                      const typeInfo = BLOCK_TYPE_INFO[type] || BLOCK_TYPE_INFO.default;
                      return (
                        <Button
                          key={type}
                          variant="outline"
                          size="sm"
                          className="justify-start h-auto py-2"
                          onClick={() => handleAddBlock(type)}
                        >
                          <span className="mr-2">{typeInfo.icon}</span>
                          <span className="text-xs">{typeInfo.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      ) : null}

      <button
        className="relative rounded-full h-16 w-16 shadow-2xl hover:shadow-xl hover:scale-105 transition-all duration-200 bg-gradient-to-br from-primary to-primary-foreground flex items-center justify-center group"
        onClick={() => setShowSelector(!showSelector)}
        aria-label="Add new block"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src="/logos/nesolagus-bug.png"
            alt="Add block"
            width={40}
            height={40}
            className="transition-opacity"
          />
        </div>
        <Plus className="w-7 h-7 text-white absolute opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={2.5} />
      </button>
    </div>
  );
}
