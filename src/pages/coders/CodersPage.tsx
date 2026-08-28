import { PageHero } from '@/components/sections/PageHero';
import { PhasePlaceholder } from '@/components/dev/PhasePlaceholder';

/**
 * Coders' Forum.
 *
 * Appears in the outline only as the highlighted right-hand nav item, with no
 * wireframe page of its own — so its structure is still unknown.
 */
export default function CodersPage() {
  return (
    <>
      <PageHero title="Coders" />
      <PhasePlaceholder
        phase="Unscoped"
        awaiting="The outline shows Coders as a highlighted nav action but includes no wireframe for it. It needs its own outline page, or confirmation that it links somewhere external."
      />
    </>
  );
}
