"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, Save, RotateCcw, Palette } from "lucide-react";
import { surveyTheme } from "@/lib/survey-theme";

interface ThemeEditorProps {
  clientSlug: string;
  onThemeChange?: (theme: any) => void;
}

export function ThemeEditor({ clientSlug, onThemeChange }: ThemeEditorProps) {
  const [theme, setTheme] = useState<any>(null);
  const [originalTheme, setOriginalTheme] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load client theme on mount
  useEffect(() => {
    loadTheme();
  }, [clientSlug]);

  const loadTheme = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/clients/${clientSlug}/theme`);

      if (!response.ok) {
        throw new Error("Failed to load theme");
      }

      const data = await response.json();
      const loadedTheme = data.theme || getDefaultTheme();

      setTheme(loadedTheme);
      setOriginalTheme(JSON.parse(JSON.stringify(loadedTheme)));
      setHasChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load theme");
      // Fall back to default theme
      const defaultTheme = getDefaultTheme();
      setTheme(defaultTheme);
      setOriginalTheme(JSON.parse(JSON.stringify(defaultTheme)));
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultTheme = () => ({
    colors: {
      primary: surveyTheme.colors.primary,
      secondary: surveyTheme.colors.secondary,
      accent: surveyTheme.colors.accent,
      background: surveyTheme.colors.background,
      surface: surveyTheme.colors.surface,
      text: {
        primary: surveyTheme.colors.text.primary,
        secondary: surveyTheme.colors.text.secondary,
      },
    },
    fonts: {
      body: surveyTheme.fonts.body,
      heading: surveyTheme.fonts.heading,
    },
    spacing: {
      questionGap: surveyTheme.spacing.xl,
    },
  });

  const handleColorChange = (path: string[], value: string) => {
    const newTheme = { ...theme };
    let current: any = newTheme;

    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) {
        current[path[i]] = {};
      }
      current = current[path[i]];
    }

    current[path[path.length - 1]] = value;

    setTheme(newTheme);
    setHasChanges(true);

    // Notify parent of theme change
    if (onThemeChange) {
      onThemeChange(newTheme);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/clients/${clientSlug}/theme`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ theme }),
      });

      if (!response.ok) {
        throw new Error("Failed to save theme");
      }

      const data = await response.json();
      setOriginalTheme(JSON.parse(JSON.stringify(theme)));
      setHasChanges(false);
      setSuccessMessage("Theme saved successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save theme");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setTheme(JSON.parse(JSON.stringify(originalTheme)));
    setHasChanges(false);
    if (onThemeChange) {
      onThemeChange(originalTheme);
    }
  };

  const handleUseDefaults = () => {
    const defaultTheme = getDefaultTheme();
    setTheme(defaultTheme);
    setHasChanges(true);
    if (onThemeChange) {
      onThemeChange(defaultTheme);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </CardContent>
      </Card>
    );
  }

  if (!theme) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-gray-500">
          Failed to load theme
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Palette className="h-6 w-6 text-blue-500" />
            Theme Customization
          </h2>
          <p className="text-gray-600 mt-1">
            Customize colors, fonts, and spacing for your survey
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Button onClick={handleReset} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          )}
          <Button onClick={handleSave} disabled={!hasChanges || isSaving} size="sm">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Theme
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Color Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Colors</CardTitle>
          <CardDescription>Customize the color scheme of your survey</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Primary Color */}
            <div className="space-y-2">
              <Label htmlFor="primary-color">Primary Color</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="primary-color"
                  type="color"
                  value={theme.colors?.primary || "#0055A5"}
                  onChange={(e) => handleColorChange(["colors", "primary"], e.target.value)}
                  className="w-20 h-10 cursor-pointer"
                />
                <Input
                  type="text"
                  value={theme.colors?.primary || "#0055A5"}
                  onChange={(e) => handleColorChange(["colors", "primary"], e.target.value)}
                  className="flex-1 font-mono"
                  placeholder="#0055A5"
                />
              </div>
              <p className="text-sm text-gray-500">Main brand color</p>
            </div>

            {/* Secondary Color */}
            <div className="space-y-2">
              <Label htmlFor="secondary-color">Secondary Color</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="secondary-color"
                  type="color"
                  value={theme.colors?.secondary || "#B2BB1C"}
                  onChange={(e) => handleColorChange(["colors", "secondary"], e.target.value)}
                  className="w-20 h-10 cursor-pointer"
                />
                <Input
                  type="text"
                  value={theme.colors?.secondary || "#B2BB1C"}
                  onChange={(e) => handleColorChange(["colors", "secondary"], e.target.value)}
                  className="flex-1 font-mono"
                  placeholder="#B2BB1C"
                />
              </div>
              <p className="text-sm text-gray-500">Accent color</p>
            </div>

            {/* Background Color */}
            <div className="space-y-2">
              <Label htmlFor="background-color">Background Color</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="background-color"
                  type="color"
                  value={theme.colors?.background || "#FFF8F1"}
                  onChange={(e) => handleColorChange(["colors", "background"], e.target.value)}
                  className="w-20 h-10 cursor-pointer"
                />
                <Input
                  type="text"
                  value={theme.colors?.background || "#FFF8F1"}
                  onChange={(e) => handleColorChange(["colors", "background"], e.target.value)}
                  className="flex-1 font-mono"
                  placeholder="#FFF8F1"
                />
              </div>
              <p className="text-sm text-gray-500">Main background</p>
            </div>

            {/* Surface Color */}
            <div className="space-y-2">
              <Label htmlFor="surface-color">Surface Color</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="surface-color"
                  type="color"
                  value={theme.colors?.surface || "#FFFFFF"}
                  onChange={(e) => handleColorChange(["colors", "surface"], e.target.value)}
                  className="w-20 h-10 cursor-pointer"
                />
                <Input
                  type="text"
                  value={theme.colors?.surface || "#FFFFFF"}
                  onChange={(e) => handleColorChange(["colors", "surface"], e.target.value)}
                  className="flex-1 font-mono"
                  placeholder="#FFFFFF"
                />
              </div>
              <p className="text-sm text-gray-500">Question card background</p>
            </div>
          </div>

          <div className="pt-4">
            <Button onClick={handleUseDefaults} variant="outline" size="sm">
              Use Default Colors
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Info */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>
            Your theme changes will be applied to the preview in real-time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Navigate to a draft's preview page to see your theme in action. Colors, fonts, and
            spacing will be applied to give you an accurate representation of the final survey.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
