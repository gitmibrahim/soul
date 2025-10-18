import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

export const login = query({
  args: {
    username: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query('admin')
      .withIndex('by_username', (q) => q.eq('username', args.username))
      .first()
    
    if (!admin || admin.password !== args.password) {
      return null
    }
    
    return { id: admin._id, username: admin.username }
  },
})

export const createAdmin = mutation({
  args: {
    username: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if admin already exists
    const existing = await ctx.db
      .query('admin')
      .withIndex('by_username', (q) => q.eq('username', args.username))
      .first()
    
    if (existing) {
      throw new Error('Admin already exists')
    }
    
    const adminId = await ctx.db.insert('admin', {
      username: args.username,
      password: args.password, // In production, hash this
    })
    return adminId
  },
})
