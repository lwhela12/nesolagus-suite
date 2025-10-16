"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Eye, Edit, Rocket, Download } from "lucide-react";
import Link from "next/link";

interface GeneratedSurveyViewProps {
  config: any;
  draftId: string;
  onReset: () => void;
}

export function GeneratedSurveyView({
  config: initialConfig,
  draftId,
  onReset,
}: GeneratedSurveyViewProps) {
  const [config] = useState(initialConfig);

  const surveyName = config?.survey?.name || "Untitled Survey";
  const blocksCount = config?.blocks ? Object.keys(config.blocks).length : 0;
  const estimatedMinutes = config?.survey?.metadata?.estimatedMinutes || 0;

  // Simple validation
  const hasValidation = config?.blocks && Object.keys(config.blocks).length > 0;
  const validationStatus = hasValidation ? "valid" : "invalid";

  const handleDownload = () => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `${draftId}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Success Header */}
      <Card className="card-elevated border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-foreground">
                  Survey Generated Successfully!
                </CardTitle>
                <CardDescription>
                  Your survey configuration is ready. Open the editor to customize, preview, and deploy.
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Survey Info */}
      <Card className="card-elevated">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{surveyName}</CardTitle>
              <CardDescription className="mt-2">
                Draft ID: <code className="text-xs font-mono bg-muted px-1 py-0.5 rounded">{draftId}</code>
              </CardDescription>
            </div>
            <Badge
              variant={validationStatus === "valid" ? "default" : "destructive"}
              className="text-sm"
            >
              {validationStatus === "valid" ? "Valid" : "Needs Fixes"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold text-foreground">
                {blocksCount}
              </div>
              <div className="text-sm text-muted-foreground">Blocks</div>
            </div>
            <div className="text-center p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold text-foreground">
                {estimatedMinutes}
              </div>
              <div className="text-sm text-muted-foreground">Minutes</div>
            </div>
            <div className="text-center p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold text-foreground">
                {config?.survey?.metadata?.version || "1.0.0"}
              </div>
              <div className="text-sm text-muted-foreground">Version</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main CTA - Open in Editor */}
      <Card className="card-elevated bg-gradient-to-br from-primary/5 to-secondary/50">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Ready to Customize?</h3>
              <p className="text-muted-foreground">
                Open the full editor to design your flow, configure analytics, and preview your survey.
              </p>
            </div>
            <Link href={`/editor/${draftId}/flow`}>
              <Button variant="gradient" size="lg" className="text-lg px-8 py-6 h-auto shadow-lg hover:shadow-xl">
                <Edit className="mr-2 h-5 w-5" />
                Open in Editor
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="card-elevated">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href={`/editor/${draftId}/preview`} className="w-full">
              <Button variant="outline" size="lg" className="w-full">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
            </Link>
            <Button variant="outline" size="lg" onClick={handleDownload} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button variant="outline" size="lg" onClick={onReset} className="w-full">
              Generate Another
            </Button>
            <Button variant="gradient" size="lg" disabled className="w-full">
              <Rocket className="mr-2 h-4 w-4" />
              Deploy
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
