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
carries a transparent margin, that margin is measured as part of the logo and
the mark shrinks to compensate. This is not hypothetical — HCLTech arrived with
its ink filling only 51% of its artboard height and drew at 23px against
Amazon's 44px. Cropping the `viewBox` to the ink fixed it without touching the
artwork. To find the ink box, open the file in a browser and call `getBBox()` on
the root `<svg>`.

## Optical size

Trimming gets every logo to a fair fit, but a fair fit is not the same apparent
size: a 3.3:1 mark and a 5.6:1 mark both filling 150px of width end up 45px and
27px tall. `logoScale` in `src/pages/mock-placements/data.ts` pulls them back
towards equal optical area. It is never above 1 — 1 is already the edge of the
slot — and it is set by eye after measuring.
