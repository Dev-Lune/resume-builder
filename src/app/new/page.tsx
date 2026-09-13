import { Suspense } from "react";
import type { Metadata } from "next";
import { Interview } from "@/components/interview/Interview";

export const metadata: Metadata = { title: "New resume" };

export default function NewPage() {
  return (
    <Suspense>
      <Interview />
    </Suspense>
  );
}
