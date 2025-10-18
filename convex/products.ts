import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query('products').order('desc').collect()
  },
})

export const getByCategory = query({
  args: { categoryId: v.id('categories') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('products')
      .withIndex('by_category', (q) => q.eq('categoryId', args.categoryId))
      .collect()
  },
})

export const get = query({
  args: { id: v.id('products') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

export const search = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const allProducts = await ctx.db.query('products').collect()
    if (!args.searchTerm) return allProducts
    
    const searchLower = args.searchTerm.toLowerCase()
    return allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
    )
  },
})

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    price: v.number(),
    categoryId: v.id('categories'),
    imageUrl: v.optional(v.string()),
    stock: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const productId = await ctx.db.insert('products', {
      ...args,
      createdAt: Date.now(),
    })
    return productId
  },
})

export const update = mutation({
  args: {
    id: v.id('products'),
    name: v.string(),
    description: v.string(),
    price: v.number(),
    categoryId: v.id('categories'),
    imageUrl: v.optional(v.string()),
    stock: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args
    await ctx.db.patch(id, updates)
  },
})

export const remove = mutation({
  args: { id: v.id('products') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
  },
})
