describe('Example Test Suite', () => {
  it('should pass a basic test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should handle async operations', async () => {
    const result = await Promise.resolve('test')
    expect(result).toBe('test')
  })

  it('should work with faker data', () => {
    const { faker } = require('@faker-js/faker')
    const email = faker.internet.email()
    expect(email).toContain('@')
  })
}) 