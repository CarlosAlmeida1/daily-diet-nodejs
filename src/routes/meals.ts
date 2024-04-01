import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import z from 'zod'
import { checkSessionIdExists } from '../middlewares/check-session-id'
import { randomUUID } from 'crypto'

export async function mealsRoutes(app: FastifyInstance) {
  app.post(
    '/',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        isOnDiet: z.boolean(),
        date: z.coerce.date(),
      })

      const { name, description, isOnDiet, date } = createMealBodySchema.parse(
        request.body,
      )

      await knex('meals').insert({
        id: randomUUID(),
        name,
        description,
        is_in_diet: isOnDiet,
        date: date.getTime(),
        user_id: request.user?.id,
      })

      return reply.status(201).send()
    },
  )

  app.get(
    '/',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const meals = await knex('meals')
        .where('user_id', request.user?.id)
        .select('*')

      return reply.send({ meals })
    },
  )

  app.get(
    '/:mealId',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const paramsSchema = z.object({
        mealId: z.string().uuid(),
      })

      const { mealId } = paramsSchema.parse(request.params)

      const meal = await knex('meals').where('id', mealId).first()

      if (!meal) {
        return reply.status(404).send({ error: 'Meal not found' })
      }

      return reply.send({ meal })
    },
  )

  app.put(
    '/:mealId',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const paramsSchema = z.object({
        mealId: z.string().uuid(),
      })

      const { mealId } = paramsSchema.parse(request.params)

      const meal = await knex('meals').where('id', mealId).first()

      if (!meal) {
        return reply.status(404).send({ error: 'Meal not found' })
      }

      const updateMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        isOnDiet: z.boolean(),
        date: z.coerce.date(),
      })

      const { date, description, isOnDiet, name } = updateMealBodySchema.parse(
        request.body,
      )

      await knex('meals').where('id', mealId).update({
        name,
        description,
        is_in_diet: isOnDiet,
        date: date.getTime(),
        updated_at: new Date(),
      })

      return reply.status(204).send()
    },
  )

  app.delete(
    '/:mealId',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const paramsSchema = z.object({
        mealId: z.string().uuid(),
      })

      const { mealId } = paramsSchema.parse(request.params)

      if (!mealId) {
        return reply.status(404).send({ error: 'Meal not found' })
      }

      const meal = await knex('meals').where('id', mealId).first()

      if (!meal) {
        return reply.status(404).send({ error: 'Meal not found' })
      }

      await knex('meals').where('id', mealId).delete()

      return reply.status(204).send()
    },
  )

  app.get(
    '/metrics',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const totalMeals = await knex('meals')
        .where({ user_id: request.user?.id })
        .orderBy('date', 'desc')

      const totalMealsOnDiet = await knex('meals')
        .where({
          user_id: request.user?.id,
          is_in_diet: true,
        })
        .count('id', { as: 'total' })
        .first()

      const totalMealsOfDiet = await knex('meals')
        .where({
          user_id: request.user?.id,
          is_in_diet: false,
        })
        .count('id', { as: 'total' })
        .first()

      const { bestSequence } = totalMeals.reduce(
        (acc, meal) => {
          if (meal.is_in_diet) {
            acc.currentSequence += 1
          } else {
            acc.currentSequence = 0
          }

          if (acc.currentSequence > acc.bestSequence) {
            acc.bestSequence = acc.currentSequence
          }

          return acc
        },
        { currentSequence: 0, bestSequence: 0 },
      )

      return reply.send({
        totalMeals: totalMeals.length,
        totalMealsOnDiet: totalMealsOnDiet?.total,
        totalMealsOfDiet: totalMealsOfDiet?.total,
        bestSequence,
      })
    },
  )
}
