import { prisma } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, Palette, Plus, Calendar } from "lucide-react";

export default async function ClientsPage() {
  // Fetch all clients with their drafts
  const clients = await prisma.client.findMany({
    include: {
      drafts: {
        orderBy: {
          createdAt: "desc",
        },
        take: 10, // Show latest 10 drafts per client
      },
      _count: {
        select: {
          drafts: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-background dark:from-card dark:to-background">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-foreground">Clients</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {clients.length} {clients.length === 1 ? "client" : "clients"}
              </p>
            </div>
          </div>

          <Link href="/generate">
            <Button variant="gradient" size="lg">
              <Plus className="h-4 w-4 mr-2" />
              New Survey
            </Button>
          </Link>
        </div>

        {/* Content */}
        {clients.length === 0 ? (
          <Card className="card-elevated animate-fade-in">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary mb-4">
                <FileText className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No clients yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first survey to get started
              </p>
              <Link href="/generate">
                <Button variant="gradient" size="lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Survey
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {clients.map((client, index) => (
              <Card key={client.id} className="card-elevated hover-lift animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{client.name}</CardTitle>
                      <CardDescription>
                        {client._count.drafts}{" "}
                        {client._count.drafts === 1 ? "survey" : "surveys"}
                        {" • "}
                        Created {new Date(client.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/clients/${client.slug}/theme`}>
                        <Button variant="outline" size="sm">
                          <Palette className="h-4 w-4 mr-2" />
                          Theme
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {client.drafts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No surveys yet for this client
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {client.drafts.map((draft) => (
                        <div
                          key={draft.id}
                          className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-all"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  Survey Draft
                                </span>
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    draft.status === "GENERATED"
                                      ? "bg-primary/10 text-primary border border-primary/20"
                                      : draft.status === "GENERATING"
                                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                                      : draft.status === "VALIDATION_FAILED"
                                      ? "bg-destructive/10 text-destructive border border-destructive/20"
                                      : "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  {draft.status}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(draft.createdAt).toLocaleDateString()}
                                </span>
                                {draft.maxMinutes && (
                                  <span>{draft.maxMinutes} min max</span>
                                )}
                                {draft.generationTime && (
                                  <span>
                                    Generated in {(draft.generationTime / 1000).toFixed(1)}s
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {draft.status === "GENERATED" && (
                              <>
                                <Link href={`/editor/${draft.id}/preview`}>
                                  <Button variant="outline" size="sm">
                                    Preview
                                  </Button>
                                </Link>
                                <Link href={`/editor/${draft.id}/flow`}>
                                  <Button variant="default" size="sm">
                                    Open Editor
                                  </Button>
                                </Link>
                              </>
                            )}
                            {draft.status === "GENERATING" && (
                              <Link href={`/generate?draft=${draft.id}`}>
                                <Button variant="outline" size="sm">
                                  View Status
                                </Button>
                              </Link>
                            )}
                            {draft.status === "VALIDATION_FAILED" && (
                              <Link href={`/generate?draft=${draft.id}`}>
                                <Button variant="outline" size="sm">
                                  View Errors
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
