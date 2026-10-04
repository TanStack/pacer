import type { OctaneAsyncQueuer } from '@tanstack/octane-pacer';
import { useState } from 'octane';
import { useAsyncQueuer } from '@tanstack/octane-pacer';
export const capture: { utility?: OctaneAsyncQueuer<unknown, { count: number }>; other?: OctaneAsyncQueuer<unknown>; cleanups: number[] } = { cleanups: [] };
export function Fixture() @{
  const [amount, setAmount] = useState(100);
  const utility = useAsyncQueuer(async () => {}, { ...{ wait: amount, started: false }, onUnmount: () => capture.cleanups.push(amount) }, (state) => ({ count: state.executionCount }));
  const other = useAsyncQueuer(async () => {}, { wait: amount, started: false });
  capture.utility = utility;
  capture.other = other;
  <div>
    <button onClick={() => setAmount(200)}>Update</button>
    <output>{utility.state.count}</output>
  </div>
}
