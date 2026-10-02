import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { createServer } from 'vite'

export async function startExampleServer(exampleDir: string) {
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
