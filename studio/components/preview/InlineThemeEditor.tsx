"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, Save, X, Palette, ChevronRight, ChevronLeft } from "lucide-react";

interface InlineThemeEditorProps {
  clientSlug: string;
  initialTheme: any;
  onThemeChange: (theme: any) => void;
}

export function InlineThemeEditor({ clientSlug, initialTheme, onThemeChange }: InlineThemeEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState(initialTheme || getDefaultTheme());
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  function getDefaultTheme() {
    return {
      colors: {
        primary: "#0055A5",
        secondary: "#B2BB1C",
        background: "#FFF8F1",
        surface: "#FFFFFF",
        botBubble: "#D9F7FF",
        userBubble: "#2F2F2F",
        text: {
          primary: "#1F2937",
          inverse: "#FFFFFF",
        },
      },
      fonts: {
        sizes: {
          base: "16px",
        },
      },
    };
  }

  const handleColorChange = (key: string, value: string) => {
    const newTheme = {
      ...theme,
      colors: {
        ...theme.colors,
        [key]: value,
      },
    };
    setTheme(newTheme);
    onThemeChange(newTheme);
  };

  const handleTextColorChange = (key: string, value: string) => {
    const newTheme = {
      ...theme,
      colors: {
        ...theme.colors,
        text: {
          ...(theme.colors?.text || {}),
          [key]: value,
        },
      },
    };
    setTheme(newTheme);
    onThemeChange(newTheme);
  };

  const handleFontSizeChange = (value: string) => {
    const newTheme = {
      ...theme,
      fonts: {
        ...(theme.fonts || {}),
        sizes: {
          ...(theme.fonts?.sizes || {}),
          base: value,
        },
      },
    };
    setTheme(newTheme);
    onThemeChange(newTheme);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

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

      setSaveMessage("Theme saved!");
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage("Failed to save");
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 bg-white border-l border-t border-b border-gray-200 rounded-l-lg shadow-lg px-2 py-4 hover:bg-gray-50 transition-colors z-50"
      >
        <div className="flex flex-col items-center gap-2">
          <Palette className="h-5 w-5 text-blue-500" />
          <ChevronLeft className="h-4 w-4 text-gray-400" />
        </div>
      </button>
    );
  }

  return (
    <div className="fixed right-0 top-0 bottom-0 w-80 bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-blue-500" />
          <h3 className="font-semibold">Theme Editor</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="text-sm text-gray-600">
          Customize colors and see changes in real-time
        </div>

        {/* Primary Color */}
        <div className="space-y-2">
          <Label htmlFor="inline-primary-color">Primary Color</Label>
          <div className="flex items-center gap-2">
            <Input
              id="inline-primary-color"
              type="color"
              value={theme.colors?.primary || "#0055A5"}
              onChange={(e) => handleColorChange("primary", e.target.value)}
              className="w-12 h-12 cursor-pointer p-1"
            />
            <Input
              type="text"
              value={theme.colors?.primary || "#0055A5"}
              onChange={(e) => handleColorChange("primary", e.target.value)}
              className="flex-1 font-mono text-sm"
            />
          </div>
          <p className="text-xs text-gray-500">Buttons and accents</p>
        </div>

        {/* Secondary Color */}
        <div className="space-y-2">
          <Label htmlFor="inline-secondary-color">Secondary Color</Label>
          <div className="flex items-center gap-2">
            <Input
              id="inline-secondary-color"
              type="color"
              value={theme.colors?.secondary || "#B2BB1C"}
              onChange={(e) => handleColorChange("secondary", e.target.value)}
              className="w-12 h-12 cursor-pointer p-1"
            />
            <Input
              type="text"
              value={theme.colors?.secondary || "#B2BB1C"}
              onChange={(e) => handleColorChange("secondary", e.target.value)}
              className="flex-1 font-mono text-sm"
            />
          </div>
          <p className="text-xs text-gray-500">Highlights</p>
        </div>

        {/* Background Color */}
        <div className="space-y-2">
          <Label htmlFor="inline-background-color">Background Color</Label>
          <div className="flex items-center gap-2">
            <Input
              id="inline-background-color"
              type="color"
              value={theme.colors?.background || "#FFF8F1"}
              onChange={(e) => handleColorChange("background", e.target.value)}
              className="w-12 h-12 cursor-pointer p-1"
            />
            <Input
              type="text"
              value={theme.colors?.background || "#FFF8F1"}
              onChange={(e) => handleColorChange("background", e.target.value)}
              className="flex-1 font-mono text-sm"
            />
          </div>
          <p className="text-xs text-gray-500">Main background</p>
        </div>

        {/* Surface Color */}
        <div className="space-y-2">
          <Label htmlFor="inline-surface-color">Card Color</Label>
          <div className="flex items-center gap-2">
            <Input
              id="inline-surface-color"
              type="color"
              value={theme.colors?.surface || "#FFFFFF"}
              onChange={(e) => handleColorChange("surface", e.target.value)}
              className="w-12 h-12 cursor-pointer p-1"
            />
            <Input
              type="text"
              value={theme.colors?.surface || "#FFFFFF"}
              onChange={(e) => handleColorChange("surface", e.target.value)}
              className="flex-1 font-mono text-sm"
            />
          </div>
          <p className="text-xs text-gray-500">Question cards</p>
        </div>

        {/* Bot Bubble Color */}
        <div className="space-y-2">
          <Label htmlFor="inline-bot-bubble-color">Bot Message Color</Label>
          <div className="flex items-center gap-2">
            <Input
              id="inline-bot-bubble-color"
              type="color"
              value={theme.colors?.botBubble || "#D9F7FF"}
              onChange={(e) => handleColorChange("botBubble", e.target.value)}
              className="w-12 h-12 cursor-pointer p-1"
            />
            <Input
              type="text"
              value={theme.colors?.botBubble || "#D9F7FF"}
              onChange={(e) => handleColorChange("botBubble", e.target.value)}
              className="flex-1 font-mono text-sm"
            />
          </div>
          <p className="text-xs text-gray-500">Bot message bubbles</p>
        </div>

        {/* User Bubble Color */}
        <div className="space-y-2">
          <Label htmlFor="inline-user-bubble-color">User Message Color</Label>
          <div className="flex items-center gap-2">
            <Input
              id="inline-user-bubble-color"
              type="color"
              value={theme.colors?.userBubble || "#2F2F2F"}
              onChange={(e) => handleColorChange("userBubble", e.target.value)}
              className="w-12 h-12 cursor-pointer p-1"
            />
            <Input
              type="text"
              value={theme.colors?.userBubble || "#2F2F2F"}
              onChange={(e) => handleColorChange("userBubble", e.target.value)}
              className="flex-1 font-mono text-sm"
            />
          </div>
          <p className="text-xs text-gray-500">User message bubbles</p>
        </div>

        {/* Text Color */}
        <div className="space-y-2">
          <Label htmlFor="inline-text-color">Text Color</Label>
          <div className="flex items-center gap-2">
            <Input
              id="inline-text-color"
              type="color"
              value={theme.colors?.text?.primary || "#1F2937"}
              onChange={(e) => handleTextColorChange("primary", e.target.value)}
              className="w-12 h-12 cursor-pointer p-1"
            />
            <Input
              type="text"
              value={theme.colors?.text?.primary || "#1F2937"}
              onChange={(e) => handleTextColorChange("primary", e.target.value)}
              className="flex-1 font-mono text-sm"
            />
          </div>
          <p className="text-xs text-gray-500">Main text color</p>
        </div>

        {/* Font Size */}
        <div className="space-y-2">
          <Label htmlFor="inline-font-size">Font Size</Label>
          <div className="flex items-center gap-2">
            <Input
              id="inline-font-size"
              type="range"
              min="12"
              max="20"
              value={parseInt(theme.fonts?.sizes?.base || "16")}
              onChange={(e) => handleFontSizeChange(`${e.target.value}px`)}
              className="flex-1"
            />
            <Input
              type="text"
              value={theme.fonts?.sizes?.base || "16px"}
              onChange={(e) => handleFontSizeChange(e.target.value)}
              className="w-20 font-mono text-sm"
            />
          </div>
          <p className="text-xs text-gray-500">Base font size</p>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-2">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full"
        >
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
        {saveMessage && (
          <div className={`text-sm text-center ${saveMessage.includes("Failed") ? "text-red-600" : "text-green-600"}`}>
            {saveMessage}
          </div>
        )}
      </div>
    </div>
  );
}
