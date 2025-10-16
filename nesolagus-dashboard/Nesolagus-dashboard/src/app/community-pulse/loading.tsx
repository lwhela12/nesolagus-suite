export default function Loading() {
  return (
    <main className="min-h-screen bg-[#F7F7F6] p-6 animate-pulse">
      <div className="h-8 w-56 bg-gray-200 rounded mb-6" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="h-32 bg-white border rounded-2xl" />
        <div className="h-32 bg-white border rounded-2xl" />
        <div className="h-32 bg-white border rounded-2xl" />
      </div>
    </main>
  );
}
