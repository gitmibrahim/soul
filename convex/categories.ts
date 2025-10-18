import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query('categories').order('desc').collect()
  },
})

export const get = query({
  args: { id: v.id('categories') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const categoryId = await ctx.db.insert('categories', {
      name: args.name,
      description: args.description,
      createdAt: Date.now(),
    })
    return categoryId
  },
})

export const update = mutation({
  args: {
    id: v.id('categories'),
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args
    await ctx.db.patch(id, updates)
  },
})

export const remove = mutation({
  args: { id: v.id('categories') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
  },
})
