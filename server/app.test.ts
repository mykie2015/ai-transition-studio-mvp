import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { buildServer } from './app.js'

describe('buildServer', () => {
  it('returns health metadata', async () => {
    const app = buildServer()

    const response = await request(app).get('/api/health')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      ok: true,
      service: 'transition-studio-api',
    })
  })

  it('returns a draft workflow response', async () => {
    const app = buildServer()

    const response = await request(app).post('/api/analyses').send({
      workflowName: 'Story delivery',
      artifacts: [
        {
          id: 'jira-1',
          type: 'tracker-export',
          title: 'AUTH-123',
          content: 'Story Points: 5. Write tests first. Open PR. Fix critical review findings.',
        },
      ],
    })

    expect(response.status).toBe(200)
    expect(response.body.draft.storyPoints).toBe(5)
  })
})
