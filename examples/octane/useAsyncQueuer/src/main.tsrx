import { createRoot, useState } from 'octane';
import { useAsyncQueuer } from '@tanstack/octane-pacer';
import './style.css';
function Example() @{
  const [input, setInput] = useState('hello');
  const [wait, setWait] = useState(200);
  const [history, setHistory] = useState<Array<string>>([]);
  const utility = useAsyncQueuer(async (value: string) => { setHistory((previous) => [...previous, value]); }, { wait: wait, started: false }, (state) => state);
  <main>
<h1>Octane useAsyncQueuer</h1><p>Keep each task in order. Start and stop processing without losing pending items.</p>
<label>Task <input value={input} onInput={(event) => setInput(event.currentTarget.value)} /></label><label>Wait (ms) <input value={wait} onInput={(event) => setWait(Number(event.currentTarget.value))} type="number" min="0" /></label>
<div><button onClick={() => { void utility.addItem(input); }}>Schedule</button><button onClick={() => { for (let i = 1; i <= 3; i++) void utility.addItem(`${input} ${i}`); }}>Schedule three</button><button onClick={() => { void utility.start(); }}>Start queue</button><button onClick={() => { utility.stop(); }}>Stop queue</button><button onClick={() => setHistory([])}>Clear history</button></div>
<section><h2>Processed results</h2><pre data-testid="history">{JSON.stringify(history, null, 2)}</pre></section>
<section><h2>Utility state</h2><pre>{JSON.stringify(utility.state, null, 2)}</pre></section>
<p class="caption">The hook retains one utility across renders and commits current options and callbacks.</p>
</main>
}
createRoot(document.getElementById('app')!).render(Example);
