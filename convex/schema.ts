import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  categories: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    createdAt: v.number(),
  }),
  
  products: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.number(),
    categoryId: v.id('categories'),
    imageUrl: v.optional(v.string()),
    stock: v.optional(v.number()),
    createdAt: v.number(),
  }).index('by_category', ['categoryId']),
  
  admin: defineTable({
    username: v.string(),
    password: v.string(), // In production, this should be hashed
  }).index('by_username', ['username']),
})
