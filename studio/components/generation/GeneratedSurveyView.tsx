"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, AlertCircle, Eye, Edit, Rocket, Download, Maximize2 } from "lucide-react";
import Link from "next/link";
import { FlowEditor } from "@/components/flow/FlowEditor";
import { FlowLayout } from "@/components/flow/types";

interface GeneratedSurveyViewProps {
  config: any;
  draftId: string;
  onReset: () => void;
}

export function GeneratedSurveyView({
  config,
  draftId,
  onReset,
}: GeneratedSurveyViewProps) {
  const [activeTab, setActiveTab] = useState("flow");
  const [flowLayout, setFlowLayout] = useState<FlowLayout | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load flowLayout from draft
  useEffect(() => {
    const loadFlowLayout = async () => {
      try {
        const response = await fetch(`/api/drafts/${draftId}`);
        const draft = await response.json();
        setFlowLayout(draft.flowLayout || null);
      } catch (error) {
        console.error('Failed to load flowLayout:', error);
      }
    };
    loadFlowLayout();
  }, [draftId]);

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

  // Handle config changes from FlowEditor
  const handleConfigChange = async (newConfig: any) => {
    // TODO: Save config to API
    console.log('Config changed:', newConfig);
  };

  // Handle flowLayout changes from FlowEditor
  const handleFlowLayoutChange = async (newLayout: FlowLayout) => {
    setFlowLayout(newLayout);

    // Auto-save flowLayout
    setIsSaving(true);
    try {
      await fetch(`/api/drafts/${draftId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flowLayout: newLayout }),
      });
    } catch (error) {
      console.error('Failed to save flowLayout:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle pop-out flow editor
  const handlePopOutFlow = () => {
    const flowUrl = `/flow/${draftId}`;
    window.open(flowUrl, '_blank', 'width=1400,height=900,menubar=no,toolbar=no,location=no,status=no');
  };

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              <div>
                <CardTitle className="text-green-900 dark:text-green-100">
                  Survey Generated Successfully!
                </CardTitle>
                <CardDescription className="text-green-700 dark:text-green-300">
                  Your survey configuration is ready for preview and deployment
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Survey Info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{surveyName}</CardTitle>
              <CardDescription className="mt-2">
                Draft ID: {draftId}
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
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {blocksCount}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Blocks</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {estimatedMinutes}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Minutes</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {config?.survey?.metadata?.version || "1.0.0"}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Version</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="flow">Flow View</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="json">JSON Config</TabsTrigger>
        </TabsList>

        <TabsContent value="flow" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle>Visual Flow Editor</CardTitle>
                  <CardDescription>
                    Interactive canvas showing your survey structure. Drag blocks to reposition, click to edit.
                    {isSaving && <span className="ml-2 text-blue-600">Saving...</span>}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePopOutFlow}
                  className="ml-4"
                  title="Open in full screen"
                >
                  <Maximize2 className="h-4 w-4 mr-2" />
                  Full Screen
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <FlowEditor
                config={config}
                flowLayout={flowLayout}
                onConfigChange={handleConfigChange}
                onFlowLayoutChange={handleFlowLayoutChange}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Survey Structure</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {config?.blocks &&
                  Object.entries(config.blocks).map(([blockId, block]: [string, any]) => (
                    <div
                      key={blockId}
                      className="flex items-center gap-3 p-3 border rounded-lg"
                    >
                      <Badge variant="outline">{block.type}</Badge>
                      <div className="flex-1">
                        <p className="text-sm font-medium truncate">
                          {block.content || block.text || "Untitled Block"}
                        </p>
                        {block.variable && (
                          <p className="text-xs text-gray-500">Variable: {block.variable}</p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="json">
          <Card>
            <CardHeader>
              <CardTitle>JSON Configuration</CardTitle>
              <CardDescription>
                This is the complete survey configuration that will be deployed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-[500px] text-xs">
                {JSON.stringify(config, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3">
            <Link href={`/preview/${draftId}`}>
              <Button size="lg" className="flex-1 sm:flex-none">
                <Eye className="mr-2 h-4 w-4" />
                Preview Survey
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="flex-1 sm:flex-none">
              <Edit className="mr-2 h-4 w-4" />
              Edit Config
            </Button>
            <Button variant="outline" size="lg" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <div className="flex-1" />
            <Button variant="outline" onClick={onReset}>
              Generate Another
            </Button>
            <Button size="lg" className="bg-green-600 hover:bg-green-700">
              <Rocket className="mr-2 h-4 w-4" />
              Deploy to Vercel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
