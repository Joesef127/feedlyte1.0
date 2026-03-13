"use client";

import type { Feedback, Project, Status } from "@/types";
import { FeedbackTable } from "./feedback-table";

interface AllFeedbackPageProps {
  feedback: Feedback[];
  setFeedback: React.Dispatch<React.SetStateAction<Feedback[]>>;
  projects: Project[];
}

export function AllFeedbackPage({ feedback, setFeedback, projects }: AllFeedbackPageProps) {
  const updateStatus = (fbId: string, status: Status) =>
    setFeedback((prev) => prev.map((f) => (f.id === fbId ? { ...f, status } : f)));

  const deleteFb = (fbId: string) =>
    setFeedback((prev) => prev.filter((f) => f.id !== fbId));

  return (
    <div className="flex-1 px-9 py-8 overflow-y-auto">
      <div className="mb-7">
        <h1 className="text-[22px] font-bold text-foreground tracking-[-0.03em] m-0">
          All Feedback
        </h1>
        <p className="text-[13px] text-muted-foreground mt-1 m-0">
          {feedback.length} total entries across {projects.length} projects
        </p>
      </div>
      <FeedbackTable
        feedback={feedback}
        onUpdateStatus={updateStatus}
        onDelete={deleteFb}
      />
    </div>
  );
}
