import { readFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import path from 'node:path'
import { stripVTControlCharacters } from 'node:util'
import { createServer } from 'vite'

export async function startExampleServer(exampleDir: string) {
  if (path.basename(path.dirname(exampleDir)) === 'angular') {
    return startAngularServer(exampleDir)
  }
  const server = await createServer({
    root: exampleDir,
    logLevel: 'error',
    server: { host: '127.0.0.1', port: 0, strictPort: false },
  })

  try {
    await server.listen()
    // Warm dependency optimization before the first browser requests modules.
    const html = await readFile(path.join(exampleDir, 'index.html'), 'utf8')
    await server.transformIndexHtml('/', html)
    await server.waitForRequestsIdle()
    const address = server.httpServer?.address()
    if (!address || typeof address === 'string') {
      throw new Error(`No listening address for ${exampleDir}`)
    }
    return {
      url: `http://127.0.0.1:${address.port}/`,
      close: () => server.close(),
    }
  } catch (error) {
    await server.close()
    throw error
  }
}

async function startAngularServer(exampleDir: string) {
  // Use the CLI version owned by the example, rather than a root dependency.
  const require = createRequire(path.join(exampleDir, 'package.json'))
  const cli = path.join(
    path.dirname(require.resolve('@angular/cli/package.json')),
    'bin/ng.js',
  )
  const child = spawn(
    process.execPath,
    [cli, 'serve', '--host', '127.0.0.1', '--port', '0', '--no-open'],
    {
      cwd: exampleDir,
      env: { ...process.env, NG_CLI_ANALYTICS: 'false', NO_COLOR: '1' },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  )
  let output = ''
  const exited = new Promise<void>((resolve) =>
    child.once('close', () => resolve()),
  )
  const close = async () => {
    if (child.exitCode !== null || child.signalCode !== null) return
    child.kill('SIGTERM')
    const forceKill = setTimeout(() => child.kill('SIGKILL'), 5_000)
    try {
      await exited
    } finally {
      clearTimeout(forceKill)
    }
  }
  try {
    const url = await new Promise<string>((resolve, reject) => {
      const timeout = setTimeout(
        () =>
          reject(
            new Error(`Angular server timed out: ${exampleDir}\n${output}`),
          ),
        90_000,
      )
      const cleanup = () => clearTimeout(timeout)
      const read = (chunk: Buffer) => {
        output += stripVTControlCharacters(chunk.toString())
        const match = output.match(/Local:\s+(http:\/\/127\.0\.0\.1:\d+\/)/)
        if (match) {
          cleanup()
          resolve(match[1]!)
        }
      }
      child.stdout.on('data', read)
      child.stderr.on('data', read)
      child.once('error', (error) => {
        cleanup()
        reject(error)
      })
      child.once('exit', (code) => {
        cleanup()
        reject(
          new Error(
            `Angular server exited (${code}): ${exampleDir}\n${output}`,
          ),
        )
      })
    })
    return { url, close }
  } catch (error) {
    await close()
    throw error
  }
}
