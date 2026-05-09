"use client";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="p-6">
        <h1 className="text-lg font-semibold">Something went wrong</h1>
        <p className="text-muted-foreground text-sm">{error.message}</p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-4 underline"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
