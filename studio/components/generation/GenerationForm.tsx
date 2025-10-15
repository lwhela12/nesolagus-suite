"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DocumentUpload } from "./DocumentUpload";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  clientName: z.string().min(2, "Client name must be at least 2 characters"),
  discoveryDoc: z.string().min(100, "Discovery document is too short (min 100 characters)"),
  methodologyDoc: z.string().min(100, "Methodology document is too short (min 100 characters)"),
  maxMinutes: z.number().min(1).max(60),
  tone: z.string().optional(),
  segments: z.string().optional(),
  archetypes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface GenerationFormProps {
  onGenerate: (data: FormData) => void;
}

export function GenerationForm({ onGenerate }: GenerationFormProps) {
  const [discoveryDoc, setDiscoveryDoc] = useState("");
  const [methodologyDoc, setMethodologyDoc] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      maxMinutes: 8,
    },
  });

  // Update form values when documents change
  const handleDiscoveryChange = (value: string) => {
    setDiscoveryDoc(value);
    setValue("discoveryDoc", value);
  };

  const handleMethodologyChange = (value: string) => {
    setMethodologyDoc(value);
    setValue("methodologyDoc", value);
  };

  const onSubmit = (data: FormData) => {
    onGenerate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Client Information */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="clientName">
            Client Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="clientName"
            placeholder="e.g., Acme Corporation"
            {...register("clientName")}
          />
          {errors.clientName && (
            <p className="text-sm text-red-500 mt-1">{errors.clientName.message}</p>
          )}
        </div>
      </div>

      <Separator />

      {/* Documents */}
      <div className="space-y-6">
        <div>
          <DocumentUpload
            label="Discovery Document"
            description="Upload or paste your discovery document that outlines project goals, audience, and research objectives."
            value={discoveryDoc}
            onChange={handleDiscoveryChange}
            placeholder="Paste your discovery document here..."
          />
          {errors.discoveryDoc && (
            <p className="text-sm text-red-500 mt-1">{errors.discoveryDoc.message}</p>
          )}
        </div>

        <div>
          <DocumentUpload
            label="Methodology Document"
            description="Upload or paste your methodology document with question framework, types, and survey approach."
            value={methodologyDoc}
            onChange={handleMethodologyChange}
            placeholder="Paste your methodology document here..."
          />
          {errors.methodologyDoc && (
            <p className="text-sm text-red-500 mt-1">{errors.methodologyDoc.message}</p>
          )}
        </div>
      </div>

      <Separator />

      {/* Parameters */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Survey Parameters</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="maxMinutes">
              Max Duration (minutes) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="maxMinutes"
              type="number"
              min={1}
              max={60}
              {...register("maxMinutes", { valueAsNumber: true })}
            />
            {errors.maxMinutes && (
              <p className="text-sm text-red-500 mt-1">{errors.maxMinutes.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="tone">Tone (optional)</Label>
            <Input
              id="tone"
              placeholder="e.g., warm, professional, friendly"
              {...register("tone")}
            />
            <p className="text-xs text-gray-500 mt-1">
              Comma-separated keywords
            </p>
          </div>

          <div>
            <Label htmlFor="segments">Audience Segments (optional)</Label>
            <Input
              id="segments"
              placeholder="e.g., customers, prospects, employees"
              {...register("segments")}
            />
            <p className="text-xs text-gray-500 mt-1">
              Comma-separated segments
            </p>
          </div>

          <div>
            <Label htmlFor="archetypes">Target Archetypes (optional)</Label>
            <Input
              id="archetypes"
              placeholder="e.g., innovators, pragmatists, skeptics"
              {...register("archetypes")}
            />
            <p className="text-xs text-gray-500 mt-1">
              Comma-separated archetypes
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Submit */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" disabled={isSubmitting}>
          Save as Draft
        </Button>
        <Button type="submit" disabled={isSubmitting} size="lg">
          {isSubmitting ? "Generating..." : "Generate Survey"}
        </Button>
      </div>
    </form>
  );
}
