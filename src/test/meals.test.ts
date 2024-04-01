import { execSync } from 'child_process'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { app } from '../app'
import request from 'supertest'

describe('meals routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('pnpm run knex migrate:rollback --all')
    execSync('pnpm run knex migrate:latest')
  })

  it('should be able create a meal', async () => {
    const user = await request(app.server)
      .post('/users')
      .send({ name: 'John Doe', email: 'johndoe@gmail.com' })
      .expect(201)

    const cookies = user.get('Set-Cookie')

    if (!cookies) throw new Error('No cookies')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Breakfast',
        description: 'A healthy breakfast',
        isOnDiet: true,
        date: new Date(),
      })
      .expect(201)
  })

  it('should to be able get the all meals of the user', async () => {
    const user = await request(app.server)
      .post('/users')
      .send({ name: 'John Doe', email: 'johndoe@gmail.com' })
      .expect(201)

    const cookies = user.get('Set-Cookie')

    if (!cookies) throw new Error('No cookies')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Breakfast',
        description: 'A healthy breakfast',
        isOnDiet: true,
        date: new Date(),
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Lunch',
        description: 'A healthy Lunch',
        isOnDiet: true,
        date: new Date(Date.now() + 1000 * 60 * 60 * 2), // 2 hours later
      })
      .expect(201)

    const mealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    expect(mealsResponse.body.meals).toHaveLength(2)

    expect(mealsResponse.body.meals[0].name).toBe('Breakfast')
    expect(mealsResponse.body.meals[1].name).toBe('Lunch')
  })

  it('should to be able get a unique meal', async () => {
    const user = await request(app.server)
      .post('/users')
      .send({ name: 'John Doe', email: 'johndoe@gmail.com' })
      .expect(201)

    const cookies = user.get('Set-Cookie')

    if (!cookies) throw new Error('No cookies')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Breakfast',
        description: "It's a breakfast",
        isOnDiet: true,
        date: new Date(),
      })
      .expect(201)

    const mealsResponse = await request(app.server)
      .get(`/meals`)
      .set('Cookie', cookies)
      .expect(200)

    console.log(mealsResponse.body)

    const mealId = mealsResponse.body.meals[0].id

    const mealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(mealResponse.body).toEqual({
      meal: expect.objectContaining({
        name: 'Breakfast',
        description: "It's a breakfast",
        is_in_diet: 1,
        date: expect.any(Number),
      }),
    })
  })

  it('should to be able edit a meal from user', async () => {
    const user = await request(app.server)
      .post('/users')
      .send({ name: 'John Doe', email: 'johndoe@gmail.com' })
      .expect(201)

    const cookies = user.get('Set-Cookie')

    if (!cookies) throw new Error('No cookies')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Breakfast',
        description: 'A healthy breakfast',
        isOnDiet: true,
        date: new Date(),
      })
      .expect(201)

    const mealsResponse = await request(app.server)
      .get(`/meals`)
      .set('Cookie', cookies)
      .expect(200)

    const mealId = mealsResponse.body.meals[0].id

    await request(app.server)
      .put(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .send({
        name: 'Lunch',
        description: 'A healthy lunch',
        isOnDiet: false,
        date: new Date(),
      })
      .expect(204)
  })

  it('should to be able delete a meal from user', async () => {
    const user = await request(app.server)
      .post('/users')
      .send({ name: 'John Doe', email: 'johndoe@gmail.com' })
      .expect(201)

    const cookies = user.get('Set-Cookie')

    if (!cookies) throw new Error('No cookies')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Breakfast',
        description: 'A healthy breakfast',
        isOnDiet: true,
        date: new Date(),
      })
      .expect(201)

    const mealsResponse = await request(app.server)
      .get(`/meals`)
      .set('Cookie', cookies)
      .expect(200)

    const mealId = mealsResponse.body.meals[0].id

    await request(app.server)
      .delete(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(204)
  })
})
