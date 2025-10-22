import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl()
  },
})

export const getImageUrl = query({
  args: { storageId: v.id('_storage') },
  handler: async (ctx: any, args: any) => {
    return await ctx.storage.getUrl(args.storageId)
  },
})

export const deleteImage = mutation({
  args: { storageId: v.id('_storage') },
  handler: async (ctx: any, args: any) => {
    await ctx.storage.delete(args.storageId)
  },
})
