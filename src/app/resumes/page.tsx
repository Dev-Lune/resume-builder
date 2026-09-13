import type { Metadata } from "next";
import { ResumeList } from "@/components/resume/ResumeList";

export const metadata: Metadata = { title: "My resumes" };

export default function ResumesPage() {
  return <ResumeList />;
}
