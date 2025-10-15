import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <main className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
            Nesolagus <span className="text-blue-600">Studio</span>
          </h1>
          <p className="max-w-2xl text-xl text-gray-600 dark:text-gray-300">
            Generate AI-powered conversational surveys from discovery documents. Preview, edit, and deploy in minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl w-full">
          <FeatureCard
            title="Generate"
            description="Upload discovery and methodology docs, and let AI create your survey structure"
            icon="✨"
          />
          <FeatureCard
            title="Preview"
            description="See exactly how your survey will look with live preview and test mode"
            icon="👁️"
          />
          <FeatureCard
            title="Deploy"
            description="One-click deployment to Vercel with client-specific configuration"
            icon="🚀"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/generate"
            className="rounded-lg bg-blue-600 px-8 py-3 text-lg font-semibold text-white shadow-lg hover:bg-blue-700 transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/clients"
            className="rounded-lg border-2 border-blue-600 px-8 py-3 text-lg font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
          >
            View Clients
          </Link>
        </div>

        <div className="mt-12 text-sm text-gray-500 dark:text-gray-400">
          <p>Phase 2: Foundation Setup Complete ✅</p>
        </div>
      </main>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="text-4xl">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
      <p className="text-center text-sm text-gray-600 dark:text-gray-300">
        {description}
      </p>
    </div>
  );
}
