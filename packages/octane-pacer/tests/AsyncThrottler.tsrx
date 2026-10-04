import type { OctaneAsyncThrottler } from '@tanstack/octane-pacer';
import { useState } from 'octane';
import { useAsyncThrottler } from '@tanstack/octane-pacer';
export const capture: { utility?: OctaneAsyncThrottler<() => Promise<void>, { count: number }>; other?: OctaneAsyncThrottler<() => Promise<void>>; cleanups: number[] } = { cleanups: [] };
export function Fixture() @{
  const [amount, setAmount] = useState(100);
  const utility = useAsyncThrottler(async () => {}, { ...{ wait: amount }, onUnmount: () => capture.cleanups.push(amount) }, (state) => ({ count: state.settleCount }));
  const other = useAsyncThrottler(async () => {}, { wait: amount });
  capture.utility = utility;
  capture.other = other;
  <div>
    <button onClick={() => setAmount(200)}>Update</button>
    <output>{utility.state.count}</output>
  </div>
}
