import { Suspense } from "react";
import type { Metadata } from "next";
import { BulkScan } from "@/components/scan/BulkScan";

export const metadata: Metadata = {
  title: "Bulk scan",
  description: "Scan one resume against several job postings at once, ranked by fit.",
};

export default function BulkScanPage() {
  return (
    <Suspense>
      <BulkScan />
    </Suspense>
  );
}
