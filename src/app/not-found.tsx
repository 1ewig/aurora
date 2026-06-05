import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F7F5] px-6">
      <h1 className="font-display font-black text-6xl md:text-8xl text-[#111111]">
        404
      </h1>
      <p className="text-[#6B6B6B] mt-4 text-lg">
        This page does not exist.
      </p>
      <Link
        href="/"
        className="mt-8 px-8 py-4 rounded-full bg-[#0D0D0D] text-[#F7F7F5] font-medium hover:bg-[#111111] transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
}
