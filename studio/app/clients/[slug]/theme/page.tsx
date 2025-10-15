import { ThemeEditor } from "@/components/theme/ThemeEditor";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ThemePageProps {
  params: {
    slug: string;
  };
}

export default async function ThemePage({ params }: ThemePageProps) {
  const { slug } = params;

  // Fetch client to verify it exists
  const client = await prisma.client.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  if (!client) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/generate">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Drafts
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold">{client.name}</h1>
              <p className="text-sm text-gray-500">Theme Editor</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <ThemeEditor clientSlug={slug} />
      </main>
    </div>
  );
}
