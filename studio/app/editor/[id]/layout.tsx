import { ReactNode } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { EditorSidebar } from "@/components/editor/EditorSidebar";

interface EditorLayoutProps {
  children: ReactNode;
  params: {
    id: string;
  };
}

export default async function EditorLayout({ children, params }: EditorLayoutProps) {
  // Fetch draft data
  const draft = await prisma.draft.findUnique({
    where: { id: params.id },
    include: {
      client: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });

  if (!draft) {
    notFound();
  }

  const handleDeploy = () => {
    // Deploy logic will be handled client-side
  };

  const handleDownload = () => {
    // Download logic will be handled client-side
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <EditorSidebar
        draftId={draft.id}
        surveyName={draft.client.name}
        status={draft.status}
        lastSaved={draft.updatedAt}
      />
      <main className="flex-1 ml-64 overflow-auto bg-gradient-to-b from-secondary/30 to-background">
        {children}
      </main>
    </div>
  );
}
