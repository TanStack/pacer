import { useState } from 'octane';
import { PacerProvider, useDebouncer } from '@tanstack/octane-pacer';
import type { OctaneDebouncer } from '@tanstack/octane-pacer';
export const capture: { utility?: OctaneDebouncer<() => void>; local?: OctaneDebouncer<() => void> } = {};
export function Fixture() @{
  const [enabled, setEnabled] = useState(false);
  <PacerProvider defaultOptions={{ debouncer: { enabled } }}>
    <div><button onClick={() => setEnabled(true)}>Enable</button><Consumer /></div>
  </PacerProvider>
}
function Consumer() @{
  const utility = useDebouncer(() => {}, { wait: 100 });
  const local = useDebouncer(() => {}, { wait: 100, enabled: false });
  capture.utility = utility; capture.local = local;
  <span>consumer</span>
}
