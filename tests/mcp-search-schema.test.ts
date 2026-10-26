import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { searchOutputSchema, searchToolValue } from '../src/worker/mcp/server'

describe('MCP search tool output', () => {
  it('only returns keys declared in its output schema (the advertised JSON Schema forbids extras)', () => {
    const value = searchToolValue({
      results: [{ id: 'a', title: 'T', url: 'https://notes.example/n/a', snippet: 'extra' } as never],
      mode: 'lexical',
    })
    expect(searchOutputSchema.strict().safeParse(value).success).toBe(true)
    const json = z.toJSONSchema(searchOutputSchema, { io: 'output' }) as { additionalProperties?: boolean; properties: Record<string, unknown> }
    expect(json.additionalProperties).toBe(false)
    expect(Object.keys(value).every((key) => key in json.properties)).toBe(true)
  })
})
