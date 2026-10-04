import type { OctaneQueuer } from '@tanstack/octane-pacer';
import { useState } from 'octane';
import { useQueuer } from '@tanstack/octane-pacer';
export const capture: { utility?: OctaneQueuer<unknown, { count: number }>; other?: OctaneQueuer<unknown>; cleanups: number[] } = { cleanups: [] };
export function Fixture() @{
  const [amount, setAmount] = useState(100);
  const utility = useQueuer(() => {}, { ...{ wait: amount, started: false }, onUnmount: () => capture.cleanups.push(amount) }, (state) => ({ count: state.executionCount }));
  const other = useQueuer(() => {}, { wait: amount, started: false });
  capture.utility = utility;
  capture.other = other;
  <div>
    <button onClick={() => setAmount(200)}>Update</button>
    <output>{utility.state.count}</output>
  </div>
}
