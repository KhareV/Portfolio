"use client";

// Last-resort route error UI. Scene/widget failures are contained by
// SceneBoundary/section boundaries; this only renders if something outside
// them throws, replacing Next's blank "Application error" screen.
export default function Error({ reset }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#FEFFFC] px-6 text-center text-slate-800">
      <div>
        <p className="text-lg font-medium">Something went wrong while loading this page.</p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-4 rounded-full border border-slate-300 px-5 py-2 text-sm font-medium hover:bg-slate-100"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
