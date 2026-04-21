import { Suspense } from "react";

import { BasketPageClient } from "./BasketPageClient";

export default function BasketPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <BasketPageClient />
    </Suspense>
  );
}
