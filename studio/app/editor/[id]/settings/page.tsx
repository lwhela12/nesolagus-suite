"use client";

import { useState, useEffect } from "react";
import { Loader2, AlertCircle, Rocket, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export default function SettingsSection({ params }: { params: { id: string } }) {
  const [config, setConfig] = useState<any>(null);
  const [draft, setDraft] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [surveyName, setSurveyName] = useState("");
  const [surveyDescription, setSurveyDescription] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState(0);
  const [version, setVersion] = useState("1.0.0");

  useEffect(() => {
    const loadDraft = async () => {
      try {
        const response = await fetch(`/api/drafts/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to load draft");
        }
        const draftData = await response.json();
        setDraft(draftData);
        setConfig(draftData.config);

        // Populate form
        setSurveyName(draftData.config?.survey?.name || "");
        setSurveyDescription(draftData.config?.survey?.metadata?.description || "");
        setEstimatedMinutes(draftData.maxMinutes || draftData.config?.survey?.metadata?.estimatedMinutes || 0);
        setVersion(draftData.config?.survey?.metadata?.version || "1.0.0");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load draft");
      } finally {
        setIsLoading(false);
      }
    };

    loadDraft();
  }, [params.id]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedConfig = {
        ...config,
        survey: {
          ...config.survey,
          name: surveyName,
          metadata: {
            ...config.survey?.metadata,
            description: surveyDescription,
            estimatedMinutes,
            version,
          },
        },
      };

      await fetch(`/api/drafts/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config: updatedConfig,
          maxMinutes: estimatedMinutes,
        }),
      });

      setConfig(updatedConfig);
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading settings...</p>
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
              <CardTitle className="text-destructive">Error Loading Settings</CardTitle>
            </div>
            <CardDescription>{error || "Configuration not found"}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full p-6 overflow-auto">
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        {/* Survey Metadata */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Survey Metadata</CardTitle>
            <CardDescription>
              Basic information about your survey that will be displayed to respondents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="survey-name">Survey Name</Label>
              <Input
                id="survey-name"
                value={surveyName}
                onChange={(e) => setSurveyName(e.target.value)}
                placeholder="Enter survey name..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="survey-description">Description</Label>
              <Textarea
                id="survey-description"
                value={surveyDescription}
                onChange={(e) => setSurveyDescription(e.target.value)}
                placeholder="Describe the purpose of this survey..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimated-minutes">Estimated Duration (minutes)</Label>
                <Input
                  id="estimated-minutes"
                  type="number"
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                  min={1}
                  max={60}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="1.0.0"
                />
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={isSaving}
              variant="gradient"
              className="w-full"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Draft Status */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Draft Status</CardTitle>
            <CardDescription>Current state of your survey draft</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge
                  className={
                    draft.status === "GENERATED" || draft.status === "READY"
                      ? "bg-primary/10 text-primary"
                      : ""
                  }
                >
                  {draft.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Draft ID</span>
                <code className="text-xs font-mono bg-muted px-2 py-1 rounded">{params.id}</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm">{new Date(draft.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Updated</span>
                <span className="text-sm">{new Date(draft.updatedAt).toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deployment */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Deployment</CardTitle>
            <CardDescription>Deploy your survey to production</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Ready to deploy? This will push your survey configuration to Vercel and make it live for respondents.
            </p>
            <Button variant="gradient" size="lg" className="w-full" disabled>
              <Rocket className="mr-2 h-4 w-4" />
              Deploy to Production
              <Badge variant="outline" className="ml-2">Coming Soon</Badge>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
