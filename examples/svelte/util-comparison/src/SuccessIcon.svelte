<script lang="ts">
  let { size = 16 }: { size?: number } = $props()
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  style="display: inline-block; vertical-align: middle"
>
  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
  <polyline points="22,4 12,14.01 9,11.01" />
</svg>
