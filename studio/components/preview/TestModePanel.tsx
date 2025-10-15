"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Clock, CheckCircle2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Response {
  questionId: string;
  answer: any;
  timestamp: number;
}

interface TestModePanelProps {
  responses: Response[];
  progress: number;
  onReset: () => void;
  config: any;
}

export function TestModePanel({ responses, progress, onReset, config }: TestModePanelProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  // Timer
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  // Stop timer when complete
  useEffect(() => {
    if (progress >= 100) {
      setIsRunning(false);
    }
  }, [progress]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatAnswer = (answer: any) => {
    if (typeof answer === 'string') return answer;
    if (typeof answer === 'number') return answer.toString();
    if (Array.isArray(answer)) return answer.join(', ');
    if (typeof answer === 'object') return JSON.stringify(answer, null, 2);
    return String(answer);
  };

  const getBlockLabel = (blockId: string) => {
    if (!config?.blocks?.[blockId]) return blockId;
    const block = config.blocks[blockId];
    return block.content || block.text || blockId;
  };

  const handleReset = () => {
    setElapsedTime(0);
    setIsRunning(true);
    onReset();
  };

  // Check for duplicate blocks
  const blockIds = config?.blocks ? Object.keys(config.blocks) : [];
  const duplicateBlocks = blockIds.filter((id, index, arr) => {
    const block = config.blocks[id];
    const nextBlock = arr[index + 1] ? config.blocks[arr[index + 1]] : null;
    return nextBlock && block.content === nextBlock.content && block.type === nextBlock.type;
  });

  return (
    <div className="h-full flex flex-col gap-4 p-4 bg-gray-50">
      {/* Duplicate Blocks Warning */}
      {duplicateBlocks.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-orange-900 flex items-center gap-2">
              ⚠️ Duplicate Blocks Detected
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-orange-700">
              {duplicateBlocks.length} duplicate or very similar blocks found. This may cause issues with survey flow.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            Test Mode
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Elapsed Time</span>
            </div>
            <Badge variant="secondary" className="font-mono">
              {formatTime(elapsedTime)}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle2 className="h-4 w-4" />
              <span>Progress</span>
            </div>
            <Badge variant="secondary">
              {Math.round(progress)}%
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">Responses</div>
            <Badge variant="secondary">
              {responses.length}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Responses Log */}
      <Card className="flex-1 flex flex-col min-h-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Response Log</CardTitle>
          <CardDescription>Answers captured during test</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 min-h-0">
          <ScrollArea className="h-full pr-4">
            {responses.length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-8">
                No responses yet. Start answering questions to see them logged here.
              </div>
            ) : (
              <div className="space-y-3">
                {responses.map((response, index) => (
                  <div
                    key={`${response.questionId}-${index}`}
                    className="bg-white border rounded-lg p-3 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-xs font-medium text-gray-500 truncate flex-1">
                        {getBlockLabel(response.questionId)}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-900 break-words">
                      {formatAnswer(response.answer)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
