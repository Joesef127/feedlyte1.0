import { MessageSquare } from "lucide-react";

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="relative mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary animate-pulse">
          <MessageSquare size={18} strokeWidth={2.5} />
        </div>
        <div className="absolute -inset-1 rounded-xl bg-primary/20 blur-md -z-10 animate-pulse" />
      </div>
      <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}
