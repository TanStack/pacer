import { For } from "solid-js";
import { useStyles } from "./styles/use-styles";

export function JsonTree(props: { value: any; keyName?: string }) {
  const { value, keyName } = props;
  const styles = useStyles();

  if (typeof value === 'string') {
    return <span class={styles().valueContainer}>
      <span>{keyName && <span class={styles().valueKey}>&quot;{keyName}&quot;: </span>}
        <span class={styles().valueString}>&quot;{value}&quot;</span></span>
      <span>,</span>
    </span>;
  }
  if (typeof value === 'number') {
    return <span class={styles().valueContainer}>
      <span>{keyName && <span class={styles().valueKey}>&quot;{keyName}&quot;: </span>}
        <span class={styles().valueNumber}>{value}</span></span>
      <span>,</span>
    </span>;
  }
  if (typeof value === 'boolean') {
    return <span class={styles().valueContainer}>
      <span>
        {keyName && <span class={styles().valueKey}>&quot;{keyName}&quot;: </span>}
        <span class={styles().valueBoolean}>{String(value)}</span>
      </span>
      <span>,</span>
    </span>;
  }
  if (value === null) {
    return <span class={styles().valueContainer}>
      <span>{keyName && <span class={styles().valueKey}>&quot;{keyName}&quot;: </span>}
        <span class={styles().valueNull}>null</span></span>
      <span>,</span>
    </span>;
  }
  if (value === undefined) {
    return <span class={styles().valueContainer}>
      <span>{keyName && <span class={styles().valueKey}>&quot;{keyName}&quot;: </span>}
        <span class={styles().valueNull}>undefined</span></span>
      <span>,</span>
    </span>;
  }
  if (Array.isArray(value)) {
    return <span class={styles().valueContainer}>
      <span>{keyName && <span class={styles().valueKey}>&quot;{keyName}&quot;: </span>}
        <span class={styles().valueBraces}>[</span>
        <For each={value}>{(item) => <>
          <JsonTree value={item} />
        </>}
        </For>
        <span class={styles().valueBraces}>]</span></span>
      <span>,</span>
    </span>;
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    return <span class={styles().valueContainer}>
      <span> {keyName && <span class={styles().valueKey}>&quot;{keyName}&quot;: </span>}
        <span class={styles().valueBraces}>{'{'}</span>
        <For each={keys}>{(k,) => <>
          <JsonTree value={value[k]} keyName={k} />
        </>}
        </For>
        <span class={styles().valueBraces}>{'}'}</span></span>

    </span>;
  }
  return <span />;
}