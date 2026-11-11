import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center bg-night px-5 pt-24 text-center text-cream">
      <h1 className="font-display text-5xl">यह पृष्ठ नहीं मिला</h1>
      <p className="mt-2 text-cream/80" lang="en">
        Page not found
      </p>
      <Link href="/" className="btn-primary mt-8">
        मुखपृष्ठ पर लौटें · Back to home
      </Link>
    </div>
  );
}
