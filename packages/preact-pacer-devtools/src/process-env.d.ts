/** Minimal typing for `process.env.NODE_ENV` checks without pulling in full Node types. */
declare const process: {
  env: {
    NODE_ENV?: string
  }
}
