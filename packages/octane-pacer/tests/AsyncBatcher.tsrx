import type { OctaneAsyncBatcher } from '@tanstack/octane-pacer';
import { useState } from 'octane';
import { useAsyncBatcher } from '@tanstack/octane-pacer';
export const capture: { utility?: OctaneAsyncBatcher<unknown, { count: number }>; other?: OctaneAsyncBatcher<unknown>; cleanups: number[] } = { cleanups: [] };
export function Fixture() @{
  const [amount, setAmount] = useState(100);
  const utility = useAsyncBatcher(async () => {}, { ...{ wait: amount, started: false }, onUnmount: () => capture.cleanups.push(amount) }, (state) => ({ count: state.executionCount }));
  const other = useAsyncBatcher(async () => {}, { wait: amount, started: false });
  capture.utility = utility;
  capture.other = other;
  <div>
    <button onClick={() => setAmount(200)}>Update</button>
    <output>{utility.state.count}</output>
  </div>
}
