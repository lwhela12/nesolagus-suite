"use client";

import { useState, useEffect } from "react";
import { Loader2, AlertCircle, Download, Copy, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function JSONSection({ params }: { params: { id: string } }) {
  const [config, setConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadDraft = async () => {
      try {
        const response = await fetch(`/api/drafts/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to load draft");
        }
        const draft = await response.json();
        setConfig(draft.config);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load draft");
      } finally {
        setIsLoading(false);
      }
    };

    loadDraft();
  }, [params.id]);

  const handleDownload = () => {
    if (!config) return;

    const dataStr = JSON.stringify(config, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `survey-${params.id}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const handleCopy = async () => {
    if (!config) return;

    try {
      await navigator.clipboard.writeText(JSON.stringify(config, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading configuration...</p>
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Card className="card-elevated border-destructive/50 max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">Error Loading Configuration</CardTitle>
            </div>
            <CardDescription>{error || "Configuration not found"}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full p-6 overflow-auto">
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
        <Card className="card-elevated">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>JSON Configuration</CardTitle>
                <CardDescription>
                  Complete survey configuration in JSON format. This is the exact configuration that will be deployed.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <pre className="bg-muted text-foreground p-6 rounded-lg overflow-auto max-h-[calc(100vh-20rem)] text-xs font-mono border">
                {JSON.stringify(config, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Metadata Info */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Configuration Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Blocks</p>
                <p className="text-lg font-semibold text-foreground">
                  {config?.blocks ? Object.keys(config.blocks).length : 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Version</p>
                <p className="text-lg font-semibold text-foreground">
                  {config?.survey?.metadata?.version || "1.0.0"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Start Block</p>
                <p className="text-lg font-semibold font-mono text-foreground">
                  {config?.survey?.startBlockId || "b0"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">File Size</p>
                <p className="text-lg font-semibold text-foreground">
                  {(JSON.stringify(config).length / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
