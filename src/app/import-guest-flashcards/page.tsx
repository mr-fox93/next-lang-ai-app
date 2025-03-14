import { Suspense } from "react";
import { checkSessionState } from "./actions";
import ImportGuestFlashcardsView from "./view";
import { Loader } from "@/components/ui/loader";

export default async function ImportGuestFlashcardsPage() {
  await checkSessionState();

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <Loader />
        </div>
      }
    >
      <ImportGuestFlashcardsView />
    </Suspense>
  );
}
