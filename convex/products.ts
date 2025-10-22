import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

// Generate automatic product code in format SO####
async function generateProductCode(ctx: any): Promise<string> {
  // Get all existing products to find the highest number
  const allProducts = await ctx.db.query('products').collect()
  
  // Extract numbers from existing product codes
  const existingNumbers = allProducts
    .map((product: any) => {
      const match = product.productCode?.match(/SO-(\d+)/)
      return match ? parseInt(match[1]) : 0
    })
    .filter((num: number) => !isNaN(num))
  
  // Find the next available number
  const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1
  
  // Format as SO-#### (4 digits with leading zeros)
  return `SO-${nextNumber.toString().padStart(4, '0')}`
}

export const list = query({
  handler: async (ctx) => {
    const products = await ctx.db.query('products').order('desc').collect()
    
    // Convert storage IDs to URLs
    return await Promise.all(
      products.map(async (product: any) => {
        const imageUrls = await Promise.all(
          product.imageUrls.map(async (storageId: any) => {
            // Check if it's already a URL
            if (storageId.startsWith('http')) return storageId
            // Convert storage ID to URL
            try {
              return await ctx.storage.getUrl(storageId as any) || storageId
            } catch {
              return storageId
            }
          })
        )
        return { ...product, imageUrls }
      })
    )
  },
})

export const getByCategory = query({
  args: { categoryId: v.id('categories') },
  handler: async (ctx: any, args: any) => {
    const products = await ctx.db
      .query('products')
      .withIndex('by_category', (q: any) => q.eq('categoryId', args.categoryId))
      .collect()
    
    // Convert storage IDs to URLs
    return await Promise.all(
      products.map(async (product: any) => {
        const imageUrls = await Promise.all(
          product.imageUrls.map(async (storageId: any) => {
            if (storageId.startsWith('http')) return storageId
            try {
              return await ctx.storage.getUrl(storageId as any) || storageId
            } catch {
              return storageId
            }
          })
        )
        return { ...product, imageUrls }
      })
    )
  },
})

export const get = query({
  args: { id: v.id('products') },
  handler: async (ctx: any, args: any) => {
    const product = await ctx.db.get(args.id)
    if (!product) return null
    
    // Convert storage IDs to URLs
    const imageUrls = await Promise.all(
      product.imageUrls.map(async (storageId: any) => {
        if (storageId.startsWith('http')) return storageId
        try {
          return await ctx.storage.getUrl(storageId as any) || storageId
        } catch {
          return storageId
        }
      })
    )
    
    return { ...product, imageUrls }
  },
})

export const getByProductCode = query({
  args: { productCode: v.string() },
  handler: async (ctx: any, args: any) => {
    const product = await ctx.db
      .query('products')
      .withIndex('by_product_code', (q: any) => q.eq('productCode', args.productCode))
      .first()
    
    if (!product) return null
    
    // Convert storage IDs to URLs
    const imageUrls = await Promise.all(
      product.imageUrls.map(async (storageId: any) => {
        if (storageId.startsWith('http')) return storageId
        try {
          return await ctx.storage.getUrl(storageId as any) || storageId
        } catch {
          return storageId
        }
      })
    )
    
    return { ...product, imageUrls }
  },
})

export const search = query({
  args: { searchTerm: v.string() },
  handler: async (ctx: any, args: any) => {
    const allProducts = await ctx.db.query('products').collect()
    if (!args.searchTerm) {
      // Convert storage IDs to URLs for all products
      return await Promise.all(
        allProducts.map(async (product: any) => {
          const imageUrls = await Promise.all(
            product.imageUrls.map(async (storageId: any) => {
              if (storageId.startsWith('http')) return storageId
              try {
                return await ctx.storage.getUrl(storageId as any) || storageId
              } catch {
                return storageId
              }
            })
          )
          return { ...product, imageUrls }
        })
      )
    }
    
    const searchLower = args.searchTerm.toLowerCase()
    const filteredProducts = allProducts.filter(
      (p: any) =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.productCode.toLowerCase().includes(searchLower)
    )
    
    // Convert storage IDs to URLs for filtered products
    return await Promise.all(
      filteredProducts.map(async (product: any) => {
        const imageUrls = await Promise.all(
          product.imageUrls.map(async (storageId: any) => {
            if (storageId.startsWith('http')) return storageId
            try {
              return await ctx.storage.getUrl(storageId as any) || storageId
            } catch {
              return storageId
            }
          })
        )
        return { ...product, imageUrls }
      })
    )
  },
})

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    price: v.number(),
    categoryId: v.id('categories'),
    imageUrls: v.array(v.string()),
    stock: v.optional(v.number()),
  },
  handler: async (ctx: any, args: any) => {
    // Generate automatic product code
    const productCode = await generateProductCode(ctx)
    
    const productId = await ctx.db.insert('products', {
      ...args,
      productCode,
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
    imageUrls: v.array(v.string()),
    stock: v.optional(v.number()),
  },
  handler: async (ctx: any, args: any) => {
    const { id, ...updates } = args
    await ctx.db.patch(id, updates)
  },
})

export const remove = mutation({
  args: { id: v.id('products') },
  handler: async (ctx: any, args: any) => {
    await ctx.db.delete(args.id)
  },
})
