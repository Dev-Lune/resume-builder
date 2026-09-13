import { Suspense } from "react";
import type { Metadata } from "next";
import { Scanner } from "@/components/scan/Scanner";

export const metadata: Metadata = {
  title: "ATS scanner",
  description: "Scan a resume against a job posting: keyword match rate, parse-safety audit, and exactly what to fix.",
};

export default function ScanPage() {
  return (
    <Suspense>
      <Scanner />
    </Suspense>
  );
}
