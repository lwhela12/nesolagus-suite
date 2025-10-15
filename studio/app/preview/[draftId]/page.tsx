import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { SurveyPreview } from "@/components/preview/SurveyPreview";

interface PreviewPageProps {
  params: {
    draftId: string;
  };
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  const { draftId } = params;

  // Fetch draft from database
  const draft = await prisma.draft.findUnique({
    where: { id: draftId },
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

  // Debug logging
  console.log('Draft found:', !!draft);
  console.log('Draft config exists:', !!draft?.config);
  console.log('Config type:', typeof draft?.config);
  console.log('Config keys:', draft?.config ? Object.keys(draft.config as any) : 'none');

  if (!draft) {
    console.log('Draft not found, returning 404');
    notFound();
  }

  if (!draft.config || typeof draft.config !== 'object') {
    console.log('Draft config is invalid:', draft.config);
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <SurveyPreview
        config={draft.config as any}
        draftId={draft.id}
        surveyName={draft.client.name}
        clientSlug={draft.client.slug}
      />
    </div>
  );
}
