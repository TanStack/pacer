import { QueryClient } from '@tanstack/svelte-query'

export interface Post {
  id: number
  title: string
  body: string
}

export const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 10_000 } },
})

export async function fetchPosts(): Promise<Array<Post>> {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts')
  return response.json()
}

export async function fetchPost(id: number): Promise<Post> {
  await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate a slow response.
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/posts/${id}`,
  )
  return response.json()
}
