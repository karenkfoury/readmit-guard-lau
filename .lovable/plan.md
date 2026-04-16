

# Fix: Preview showing blank placeholder page

## Problem
The Vite dev server has a stale cached version of the TanStack Router code-split component for `src/routes/index.tsx`. When the browser requests the split component (`?tsr-split=component`), Vite serves an old version that still contains `PlaceholderIndex` instead of the actual `LandingPage` component.

The file on disk is correct — this is purely a Vite/TanStack code-splitter cache issue.

## Fix
1. **Touch/re-save `src/routes/index.tsx`** to invalidate the Vite module cache. A trivial whitespace change (add/remove a blank line) will force the code-splitter to regenerate the split component with the correct `LandingPage` content.

2. **Verify** the page renders the LAU-branded landing page with the hero section, "The Real Cost" cards, "Meet Sarah" narrative, and role selection cards.

No logic or content changes are needed — the code is correct, the cache just needs to be invalidated.

