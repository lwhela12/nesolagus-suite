"use client";

import { useState } from 'react';
import { Plus, Trash2, ArrowRight } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { SurveyBlock } from './types';

interface ConditionalLogicBuilderProps {
  block: SurveyBlock;
  allBlocks: Record<string, SurveyBlock>;
  onChange: (next: string | object) => void;
}

export function ConditionalLogicBuilder({
  block,
  allBlocks,
  onChange,
}: ConditionalLogicBuilderProps) {
  // Parse existing conditional logic
  const [mode, setMode] = useState<'simple' | 'conditional'>(
    typeof block.next === 'object' ? 'conditional' : 'simple'
  );

  const existingNext = typeof block.next === 'object' ? block.next : null;
  const existingConditions = existingNext?.if ? (Array.isArray(existingNext.if) ? existingNext.if : []) : [];
  const existingElse = typeof existingNext?.else === 'string' ? existingNext.else : '';

  const [conditions, setConditions] = useState(existingConditions);
  const [elseTarget, setElseTarget] = useState(existingElse);
  const [simpleNext, setSimpleNext] = useState(typeof block.next === 'string' ? block.next : '');

  const availableBlocks = Object.values(allBlocks).filter(b => b.id !== block.id);

  const handleModeChange = (newMode: 'simple' | 'conditional') => {
    setMode(newMode);
    if (newMode === 'simple') {
      onChange(simpleNext);
    } else {
      onChange({
        if: conditions,
        else: elseTarget,
      });
    }
  };

  const handleAddCondition = () => {
    const newCondition = {
      when: { equals: '' },
      goto: '',
    };
    const newConditions = [...conditions, newCondition];
    setConditions(newConditions);
    onChange({
      if: newConditions,
      else: elseTarget,
    });
  };

  const handleUpdateCondition = (index: number, field: 'operator' | 'value' | 'goto', value: any) => {
    const newConditions = [...conditions];

    if (field === 'operator') {
      // Update the operator type, keep existing value if present
      const currentOperator = Object.keys(newConditions[index].when)[0];
      const currentValue = newConditions[index].when[currentOperator];
      newConditions[index].when = { [value]: currentValue };
    } else if (field === 'value') {
      // Update the value directly (no answer wrapper)
      const operator = Object.keys(newConditions[index].when)[0];
      newConditions[index].when = { [operator]: value };
    } else if (field === 'goto') {
      newConditions[index].goto = value;
    }

    setConditions(newConditions);
    onChange({
      if: newConditions,
      else: elseTarget,
    });
  };

  const handleDeleteCondition = (index: number) => {
    const newConditions = conditions.filter((_, i) => i !== index);
    setConditions(newConditions);
    onChange({
      if: newConditions,
      else: elseTarget,
    });
  };

  const handleElseChange = (target: string) => {
    setElseTarget(target);
    onChange({
      if: conditions,
      else: target,
    });
  };

  const handleSimpleNextChange = (target: string) => {
    setSimpleNext(target);
    onChange(target);
  };

  const getOperatorFromCondition = (when: any): string => {
    if (when.equals) return 'equals';
    if (when.lt) return 'lt';
    if (when.gt) return 'gt';
    if (when.in) return 'in';
    return 'equals';
  };

  const getValueFromCondition = (when: any): string => {
    const operator = getOperatorFromCondition(when);
    const value = when[operator];
    // Handle both old format (with .answer) and new format (direct value)
    return typeof value === 'object' && value?.answer !== undefined ? value.answer : (value || '');
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>Routing Type</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant={mode === 'simple' ? 'default' : 'outline'}
            onClick={() => handleModeChange('simple')}
            className="h-auto py-3 flex flex-col items-start"
          >
            <span className="font-semibold">Simple</span>
            <span className="text-xs font-normal opacity-70">Always go to same block</span>
          </Button>
          <Button
            type="button"
            variant={mode === 'conditional' ? 'default' : 'outline'}
            onClick={() => handleModeChange('conditional')}
            className="h-auto py-3 flex flex-col items-start"
          >
            <span className="font-semibold">Conditional</span>
            <span className="text-xs font-normal opacity-70">Branch based on answer</span>
          </Button>
        </div>
      </div>

      {mode === 'simple' ? (
        <div className="space-y-2">
          <Label>Next Block</Label>
          <Select value={simpleNext} onValueChange={handleSimpleNextChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select next block..." />
            </SelectTrigger>
            <SelectContent>
              {availableBlocks.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  <span className="font-mono text-xs">{b.id}</span>
                  <span className="mx-2">•</span>
                  <span className="truncate">{b.content || b.text || b.type}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Conditions</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddCondition}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Condition
              </Button>
            </div>

            {conditions.map((condition, index) => (
              <Card key={index} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-8 rounded bg-green-100 text-green-700 flex items-center justify-center text-xs font-semibold">
                      IF
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <Select
                        value={getOperatorFromCondition(condition.when)}
                        onValueChange={(value) => handleUpdateCondition(index, 'operator', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equals">Equals</SelectItem>
                          <SelectItem value="lt">Less Than</SelectItem>
                          <SelectItem value="gt">Greater Than</SelectItem>
                          <SelectItem value="in">Includes</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        value={getValueFromCondition(condition.when)}
                        onChange={(e) => handleUpdateCondition(index, 'value', e.target.value)}
                        placeholder="Value..."
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCondition(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 pl-14">
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <div className="w-16 h-8 rounded bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">
                      GO TO
                    </div>
                    <Select
                      value={condition.goto}
                      onValueChange={(value) => handleUpdateCondition(index, 'goto', value)}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select block..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableBlocks.map((b) => (
                          <SelectItem key={b.id} value={b.id}>
                            <span className="font-mono text-xs">{b.id}</span>
                            <span className="mx-2">•</span>
                            <span className="truncate">{b.content || b.text || b.type}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            ))}

            {conditions.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm border-2 border-dashed rounded-lg">
                No conditions yet. Click "Add Condition" to create branching logic.
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Else (Default)</Label>
            <div className="flex items-center gap-2">
              <div className="w-12 h-8 rounded bg-red-100 text-red-700 flex items-center justify-center text-xs font-semibold">
                ELSE
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <Select value={elseTarget} onValueChange={handleElseChange}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select fallback block..." />
                </SelectTrigger>
                <SelectContent>
                  {availableBlocks.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      <span className="font-mono text-xs">{b.id}</span>
                      <span className="mx-2">•</span>
                      <span className="truncate">{b.content || b.text || b.type}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-gray-500">
              When no conditions match, route to this block.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
