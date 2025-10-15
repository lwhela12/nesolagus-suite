"use client";

import { useState, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, FileText, X } from "lucide-react";

interface DocumentUploadProps {
  label: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function DocumentUpload({
  label,
  description,
  value,
  onChange,
  placeholder = "Paste your document content here or upload a file...",
}: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        await handleFile(file);
      }
    },
    []
  );

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFile(file);
    }
  }, []);

  const handleFile = async (file: File) => {
    setFileName(file.name);

    // Read file content
    const text = await file.text();
    onChange(text);
  };

  const handleClear = () => {
    onChange("");
    setFileName(null);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      {/* File Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-gray-300 dark:border-gray-700"
          }
          ${value ? "hidden" : ""}
        `}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-4">
          <Upload className="h-12 w-12 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Drop your file here or{" "}
              <label className="text-primary cursor-pointer hover:underline">
                browse
                <input
                  type="file"
                  className="hidden"
                  accept=".txt,.md,.doc,.docx,.pdf"
                  onChange={handleFileInput}
                />
              </label>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Supports .txt, .md, .doc, .docx, .pdf
            </p>
          </div>
        </div>
      </div>

      {/* Text Area (shown when empty or after pasting) */}
      <div className={value ? "" : "hidden"}>
        {fileName && (
          <Card className="p-4 mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">{fileName}</span>
              <span className="text-xs text-gray-500">
                ({(value.length / 1000).toFixed(1)}KB)
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClear}>
              <X className="h-4 w-4" />
            </Button>
          </Card>
        )}

        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[200px] font-mono text-sm"
        />

        {!fileName && (
          <div className="flex justify-end mt-2">
            <Button variant="outline" size="sm" onClick={handleClear}>
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* Character count */}
      {value && (
        <p className="text-xs text-gray-500 text-right">
          {value.length} characters
        </p>
      )}
    </div>
  );
}
