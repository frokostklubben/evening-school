//TODO: Fikse at det virker at bruge Jest
import supertest from 'supertest' // request??
import app from '../app.js'

describe('GET api/users', () => {
  describe('GET /api/users - success', async () => {
    const response = await request(app).get('/api/users')
    expect(response.statusCode).toBe(200)
    expect(response.body.data).toBeInstanceOf(Array)
  })

  it('POST /api/users - fail', async () => {
    const response = await request(app).post('/api/users').send({
      first_name: 'Test111',
      last_name: 'User',
      email: 'testuser@example.com',
      school_id: '1',
    })
    expect(response.status).toBe(400)
    expect(response.body.message).toContain('fejl')
  })

  // Flere tests her
})
