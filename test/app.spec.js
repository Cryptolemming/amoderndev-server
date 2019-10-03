const app = require('../src/app')

describe('App', () => {
  it('GET / responds with 200 containing "Greetings human"', () => {
    return supertest(app)
      .get("/")
      .expect(200, "Greetings human")
  })
})
