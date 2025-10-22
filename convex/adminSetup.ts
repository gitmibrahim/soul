// Utility script to create an admin user
// Run this in the Convex dashboard or use the Convex CLI

import { mutation } from './_generated/server'
import { v } from 'convex/values'

export const createDefaultAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if admin already exists
    const existingAdmin = await ctx.db
      .query('admin')
      .withIndex('by_username', (q) => q.eq('username', 'admin'))
      .first()
    
    if (existingAdmin) {
      return { message: 'Admin already exists', adminId: existingAdmin._id }
    }
    
    // Create default admin
    const adminId = await ctx.db.insert('admin', {
      username: 'admin',
      password: 'admin123', // In production, hash this password
    })
    
    return { message: 'Default admin created successfully', adminId }
  },
})

// Usage instructions:
// 1. Go to your Convex dashboard
// 2. Navigate to Functions tab
// 3. Find the createDefaultAdmin function
// 4. Click "Run" to execute it
// 5. This will create an admin with username: 'admin' and password: 'admin123'
