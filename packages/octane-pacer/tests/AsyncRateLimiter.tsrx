import type { OctaneAsyncRateLimiter } from '@tanstack/octane-pacer';
import { useState } from 'octane';
import { useAsyncRateLimiter } from '@tanstack/octane-pacer';
export const capture: { utility?: OctaneAsyncRateLimiter<() => Promise<void>, { count: number }>; other?: OctaneAsyncRateLimiter<() => Promise<void>>; cleanups: number[] } = { cleanups: [] };
export function Fixture() @{
  const [amount, setAmount] = useState(100);
  const utility = useAsyncRateLimiter(async () => {}, { ...{ limit: amount, window: 1000 }, onUnmount: () => capture.cleanups.push(amount) }, (state) => ({ count: state.settleCount }));
  const other = useAsyncRateLimiter(async () => {}, { limit: amount, window: 1000 });
  capture.utility = utility;
  capture.other = other;
  <div>
    <button onClick={() => setAmount(200)}>Update</button>
    <output>{utility.state.count}</output>
  </div>
}
