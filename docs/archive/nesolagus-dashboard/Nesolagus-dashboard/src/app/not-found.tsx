export default function NotFound() {
  return (
    <main className="min-h-screen grid place-items-center bg-[#F7F7F6] text-[#0E2A23] p-6">
      <div className="text-center">
        <h1 className="text-6xl font-extrabold">404</h1>
        <p className="mt-2 text-gray-600">This page could not be found.</p>
        <a
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition bg-[linear-gradient(90deg,#64B37A_0%,#2F6D49_100%)] hover:brightness-95"
        >
          Go to Dashboard
        </a>
      </div>
    </main>
  );
}
