import { describe, expect, it, vi } from 'vitest'

vi.mock('../src/worker/mcp/retrieval', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../src/worker/mcp/retrieval')>()),
  searchMcpNotes: async () => ({
    mode: 'lexical',
    results: [{ id: 'a', title: 'T', url: 'https://notes.example/n/a', snippet: 's', score: 1, rev: 1, updatedAt: 1, excerpt: 'e', source: 'lexical' }],
  }),
}))

import { Client, InMemoryTransport } from '@modelcontextprotocol/client'
import { createInkstoneMcpServer } from '../src/worker/mcp/server'

describe('MCP search tool', () => {
  it('returns structured content that a strict MCP client accepts', async () => {
    const server = createInkstoneMcpServer({
      env: {} as never,
      auth: { userId: 'u', role: 'owner', scopes: ['notes:read'] },
      origin: 'https://notes.example',
      ftsEnabled: true,
      executionCtx: {} as never,
    })
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
    await server.connect(serverTransport)
    const client = new Client({ name: 'test', version: '1' })
    await client.connect(clientTransport)
    await client.listTools()
    const result = await client.callTool({ name: 'search', arguments: { query: 'garmr' } })
    expect(result.structuredContent).toEqual({ results: [{ id: 'a', title: 'T', url: 'https://notes.example/n/a' }] })
  })
})
