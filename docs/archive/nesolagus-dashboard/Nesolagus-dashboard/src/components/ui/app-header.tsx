// src/components/ui/app-header.tsx
'use client';

type Props = {
  title?: string;
  subtitle?: string;
};

export default function AppHeader({ title, subtitle }: Props) {
  if (!title && !subtitle) return null;
  return (
    <div className="mb-4">
      {title ? (
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
      ) : null}
      {subtitle ? (
        <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
      ) : null}
    </div>
  );
}
