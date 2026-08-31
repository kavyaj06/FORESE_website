# Company logos

Drop each company's **official** SVG here under exactly these names. They are
read by `MOCK_PLACEMENT_COMPANIES` in `src/pages/mock-placements/data.ts` and
drawn by the carousel on `/mocks`.

    cognizant.svg   zoho.svg      amazon.svg     lnt.svg        hcltech.svg
    tcs.svg         wipro.svg     freshworks.svg capgemini.svg  accenture.svg

Until a file is here the carousel sets that company's **name** in the page's own
typeface, in the same slot, with the same scale and blur. Nothing breaks and
nothing needs changing in code when a file arrives.

## What to supply

Each company publishes a brand or press kit; take the SVG from there rather than
from a search result. These are trademarks, and an approximation is worse than
the text fallback.

## Sizing is handled for you

Every logo is drawn into an identical 180x80 slot and scaled to fit inside
150x55 by whichever axis binds first, so a wordmark and a monogram both look
deliberate side by side. One scale factor is applied to both axes, so nothing is
ever stretched. **Do not** pre-scale the files to match each other.

The one thing that does matter: **trim the artboard.** If an SVG's `viewBox`
carries a wide transparent margin, that margin is measured as part of the logo
and the mark inside it shrinks to compensate, so it will look smaller than its
neighbours. Crop the `viewBox` to the visible mark.
