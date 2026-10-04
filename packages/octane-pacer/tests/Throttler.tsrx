import type { OctaneThrottler } from '@tanstack/octane-pacer';
import { useState } from 'octane';
import { useThrottler } from '@tanstack/octane-pacer';
export const capture: { utility?: OctaneThrottler<() => void, { count: number }>; other?: OctaneThrottler<() => void>; cleanups: number[] } = { cleanups: [] };
export function Fixture() @{
  const [amount, setAmount] = useState(100);
  const utility = useThrottler(() => {}, { ...{ wait: amount }, onUnmount: () => capture.cleanups.push(amount) }, (state) => ({ count: state.executionCount }));
  const other = useThrottler(() => {}, { wait: amount });
  capture.utility = utility;
  capture.other = other;
  <div>
    <button onClick={() => setAmount(200)}>Update</button>
    <output>{utility.state.count}</output>
  </div>
}
