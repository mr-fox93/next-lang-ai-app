import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Routes requiring authentication
const isProtectedRoute = createRouteMatcher([
  "/flashcards(.*)",
  "/api/generate-flashcards(.*)",
  "/api/progress(.*)",
  "/import-guest-flashcards(.*)",
]);

// Public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/guest-flashcard(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Check if the path requires authentication
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // For public routes, continue without authentication
  console.log(`Request path: ${req.nextUrl.pathname}`);
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
