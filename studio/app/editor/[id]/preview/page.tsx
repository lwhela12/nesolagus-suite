import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { SurveyPreview } from "@/components/preview/SurveyPreview";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PreviewSection({ params }: { params: { id: string } }) {
  const draft = await prisma.draft.findUnique({
    where: { id: params.id },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  if (!draft) {
    notFound();
  }

  if (!draft.config || typeof draft.config !== "object") {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Card className="card-elevated border-destructive/50 max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Invalid Configuration</CardTitle>
            <CardDescription>
              The survey configuration is invalid or missing. Please return to the Flow Editor to fix it.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full p-6">
      <Card className="card-elevated h-full flex flex-col">
        <CardHeader>
          <CardTitle>Live Survey Preview</CardTitle>
          <CardDescription>
            Experience your survey as respondents will see it. This is a real-time preview of the current configuration.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto">
          <div className="bg-background rounded-lg border p-6">
            <SurveyPreview
              config={draft.config as any}
              draftId={draft.id}
              surveyName={draft.client.name}
              clientSlug={draft.client.slug}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
