"use client";

import { useState, useCallback, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SurveyBlock } from './types';
import { TextInputEditor } from './editors/TextInputEditor';
import { ChoiceEditor } from './editors/ChoiceEditor';
import { ScaleEditor } from './editors/ScaleEditor';
import { MessageEditor } from './editors/MessageEditor';
import { ConditionalLogicBuilder } from './ConditionalLogicBuilder';
import { AIRegenerationPanel } from './AIRegenerationPanel';

interface BlockEditPanelProps {
  block: SurveyBlock | null;
  open: boolean;
  onClose: () => void;
  onSave: (blockId: string, updates: Partial<SurveyBlock>) => void;
  allBlocks: Record<string, SurveyBlock>;
}

export function BlockEditPanel({
  block,
  open,
  onClose,
  onSave,
  allBlocks,
}: BlockEditPanelProps) {
  const [editedBlock, setEditedBlock] = useState<SurveyBlock | null>(block);
  const [activeTab, setActiveTab] = useState('content');

  // Update edited block when prop changes
  useEffect(() => {
    setEditedBlock(block);
  }, [block]);

  const handleFieldChange = useCallback((field: string, value: any) => {
    if (!editedBlock) return;
    setEditedBlock({
      ...editedBlock,
      [field]: value,
    });
  }, [editedBlock]);

  const handleSave = useCallback(() => {
    if (!editedBlock) return;
    onSave(editedBlock.id, editedBlock);
    onClose();
  }, [editedBlock, onSave, onClose]);

  const handleCancel = useCallback(() => {
    setEditedBlock(block);
    onClose();
  }, [block, onClose]);

  if (!editedBlock) return null;

  // Render appropriate editor based on block type
  const renderContentEditor = () => {
    switch (editedBlock.type) {
      case 'text-input':
        return (
          <TextInputEditor
            block={editedBlock}
            onChange={handleFieldChange}
          />
        );
      case 'single-choice':
      case 'multi-choice':
        return (
          <ChoiceEditor
            block={editedBlock}
            onChange={handleFieldChange}
          />
        );
      case 'scale':
        return (
          <ScaleEditor
            block={editedBlock}
            onChange={handleFieldChange}
          />
        );
      case 'dynamic-message':
      case 'final-message':
        return (
          <MessageEditor
            block={editedBlock}
            onChange={handleFieldChange}
          />
        );
      default:
        return (
          <div className="p-4 text-sm text-gray-500">
            No editor available for block type: {editedBlock.type}
          </div>
        );
    }
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
      <SheetContent side="right" className="w-[600px] sm:max-w-[600px] p-0 flex flex-col h-full">
        <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <SheetTitle className="text-xl font-semibold">
                Edit Block
              </SheetTitle>
              <SheetDescription className="mt-1">
                <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                  {editedBlock.id}
                </span>
                <span className="mx-2">•</span>
                <span className="text-gray-600">{editedBlock.type}</span>
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="mx-6 mt-4 shrink-0">
            <TabsTrigger value="content" className="flex-1">Content</TabsTrigger>
            <TabsTrigger value="logic" className="flex-1">Logic</TabsTrigger>
            <TabsTrigger value="ai" className="flex-1">
              <Sparkles className="w-4 h-4 mr-2" />
              AI
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="px-6 pb-6">
              <TabsContent value="content" className="mt-4 space-y-4">
                {renderContentEditor()}
              </TabsContent>

              <TabsContent value="logic" className="mt-4 space-y-4">
                <ConditionalLogicBuilder
                  block={editedBlock}
                  allBlocks={allBlocks}
                  onChange={(next) => handleFieldChange('next', next)}
                />
              </TabsContent>

              <TabsContent value="ai" className="mt-4 space-y-4">
                <AIRegenerationPanel
                  block={editedBlock}
                  onRegenerate={(regeneratedBlock) => {
                    setEditedBlock(regeneratedBlock);
                  }}
                />
              </TabsContent>
            </div>
          </div>
        </Tabs>

        <SheetFooter className="px-6 py-4 border-t shrink-0">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
