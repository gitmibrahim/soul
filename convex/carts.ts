import { v } from 'convex/values'
import { action, mutation, query } from './_generated/server'
import { api, internal } from './_generated/api'

async function getCartByGuestId(ctx: any, guestId: string) {
  return await ctx.db
    .query('carts')
    .withIndex('by_session', (q: any) => q.eq('guestId', guestId))
    .first()
}

async function calculateTotal(ctx: any, items: any[]) {
  let total = 0
  for (const item of items) {
    const product = await ctx.db.get(item.productId)
    if (product && 'price' in product) {
      total += (product as any).price * item.quantity
    }
  }
  return total
}

export const getCart = query({
  args: { guestId: v.string() },
  handler: async (ctx, args) => {
    let cart = await getCartByGuestId(ctx, args.guestId)
    
    if (!cart) {
      return { items: [], total: 0 }
    }
    
    return cart
  },
})

export const getCartWithProducts = query({
  args: { guestId: v.string() },
  handler: async (ctx, args) => {
    let cart = await getCartByGuestId(ctx, args.guestId)
    
    if (!cart) {
      return { items: [], total: 0 }
    }
    
    // Fetch product details for each cart item
    const itemsWithProducts = await Promise.all(
      cart.items.map(async (item: any) => {
        const product = await ctx.db.get(item.productId)
        if (!product) return { ...item, product: null }
        
        // Convert storage IDs to URLs (only for products table)
        const imageUrls = 'imageUrls' in product && Array.isArray(product.imageUrls)
          ? await Promise.all(
              product.imageUrls.map(async (storageId: string) => {
                if (storageId.startsWith('http')) return storageId
                try {
                  return await ctx.storage.getUrl(storageId as any) || storageId
                } catch {
                  return storageId
                }
              })
            )
          : []
        
        return {
          ...item,
          product: { ...product, imageUrls },
        }
      })
    )
    
    return {
      ...cart,
      items: itemsWithProducts,
    }
  },
})

export const addToCart = mutation({
  args: {
    guestId: v.string(),
    productId: v.id('products'),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    let cart = await getCartByGuestId(ctx, args.guestId)
    
    if (!cart) {
      const cartId = await ctx.db.insert('carts', {
        guestId: args.guestId,
        items: [],
        total: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
      cart = await ctx.db.get(cartId)
    }
    
    if (!cart) {
      throw new Error('Failed to create cart')
    }
    
    // Check if product already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item: any) => item.productId === args.productId
    )
    
    let updatedItems
    if (existingItemIndex >= 0) {
      // Update existing item quantity
      updatedItems = [...cart.items]
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + args.quantity,
      }
    } else {
      // Add new item
      updatedItems = [
        ...cart.items,
        {
          productId: args.productId,
          quantity: args.quantity,
          addedAt: Date.now(),
        },
      ]
    }

    const total = await calculateTotal(ctx, updatedItems)
    
    await ctx.db.patch(cart._id, {
      items: updatedItems,
      total,
      updatedAt: Date.now(),
    })
    
    return cart._id
  },
})

export const updateCartItem = mutation({
  args: {
    guestId: v.string(),
    productId: v.id('products'),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const cart = await getCartByGuestId(ctx, args.guestId)
    
    if (!cart) {
      throw new Error('Cart not found')
    }
    
    const updatedItems = cart.items.map((item: any) =>
      item.productId === args.productId
        ? { ...item, quantity: args.quantity }
        : item
    )

    const total = await calculateTotal(ctx, updatedItems)
    
    await ctx.db.patch(cart._id, {
      items: updatedItems,
      total,
      updatedAt: Date.now(),
    })
    
    return cart._id
  },
})

export const removeFromCart = mutation({
  args: {
    guestId: v.string(),
    productId: v.id('products'),
  },
  handler: async (ctx, args) => {
    const cart = await getCartByGuestId(ctx, args.guestId)
    
    if (!cart) {
      throw new Error('Cart not found')
    }
    
    const updatedItems = cart.items.filter(
      (item: any) => item.productId !== args.productId
    )

    const total = await calculateTotal(ctx, updatedItems)
    
    await ctx.db.patch(cart._id, {
      items: updatedItems,
      total,
      updatedAt: Date.now(),
    })
    
    return cart._id
  },
})

export const clearCart = mutation({
  args: { guestId: v.string() },
  handler: async (ctx, args) => {
    const cart = await getCartByGuestId(ctx, args.guestId)
    
    if (!cart) {
      throw new Error('Cart not found')
    }
    
    await ctx.db.patch(cart._id, {
      items: [],
      total: 0,
      updatedAt: Date.now(),
    })
    
    return cart._id
  },
})

export const getCartItemCount = query({
  args: { guestId: v.string() },
  handler: async (ctx, args) => {
    const cart = await getCartByGuestId(ctx, args.guestId)
    
    if (!cart) {
      return 0
    }
    
    return cart.items.reduce((total: number, item: any) => total + item.quantity, 0)
  },
})

export const placeOrder = mutation({
  args: {
    guestId: v.string(),
    whatsappMessage: v.string(),
    customerInfo: v.optional(v.object({
      name: v.string(),
      phone: v.string(),
      address: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const cart = await getCartByGuestId(ctx, args.guestId)
    
    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty')
    }

    // Fetch product details for each cart item
    const orderItems = []
    let total = 0
    
    for (const item of cart.items) {
      const product = await ctx.db.get(item.productId)
      if (!product) continue
      
      const itemTotal = (product as any).price * item.quantity
      total += itemTotal
      
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: (product as any).price,
        productName: (product as any).name,
        productCode: (product as any).productCode,
      })
    }

    // Create the order (stock will be managed by admin)
    const orderId = await ctx.db.insert('orders', {
      guestId: args.guestId,
      items: orderItems,
      total,
      status: 'pending',
      whatsappMessage: args.whatsappMessage,
      customerInfo: args.customerInfo,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    // Update product stock only for items with sufficient stock
    for (const item of orderItems) {
      const product = await ctx.db.get(item.productId)
      if (product) {
        const currentStock = (product as any).stock || 0
        if (currentStock >= item.quantity) {
          // Only deduct if there's enough stock
          const newStock = currentStock - item.quantity
          await ctx.db.patch(item.productId, {
            stock: Math.max(0, newStock),
          })
        }
        // If insufficient stock, admin will handle it
      }
    }

    // Clear the cart
    await ctx.db.patch(cart._id, {
      items: [],
      total: 0,
      updatedAt: Date.now(),
    })

    return orderId
  },
})
