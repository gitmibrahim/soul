import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

export const list = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx: any, args: any) => {
    if (args.status) {
      return await ctx.db
        .query('orders')
        .withIndex('by_status', (q: any) => q.eq('status', args.status!))
        .order('desc')
        .collect()
    }
    return await ctx.db.query('orders').order('desc').collect()
  },
})

export const get = query({
  args: { id: v.id('orders') },
  handler: async (ctx: any, args: any) => {
    return await ctx.db.get(args.id)
  },
})

export const getBySession = query({
  args: { guestId: v.string() },
  handler: async (ctx: any, args: any) => {
    return await ctx.db
      .query('orders')
      .withIndex('by_session', (q: any) => q.eq('guestId', args.guestId))
      .order('desc')
      .collect()
  },
})

export const create = mutation({
  args: {
    guestId: v.string(),
    items: v.array(v.object({
      productId: v.id('products'),
      quantity: v.number(),
      price: v.number(),
      productName: v.string(),
      productCode: v.string(),
    })),
    total: v.number(),
    whatsappMessage: v.string(),
    customerInfo: v.optional(v.object({
      name: v.string(),
      phone: v.string(),
      address: v.string(),
    })),
  },
  handler: async (ctx: any, args: any) => {
    // Create the order
    const orderId = await ctx.db.insert('orders', {
      ...args,
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    // Update product stock
    for (const item of args.items) {
      const product = await ctx.db.get(item.productId)
      if (product) {
        const newStock = (product.stock || 0) - item.quantity
        await ctx.db.patch(item.productId, {
          stock: Math.max(0, newStock), // Ensure stock doesn't go negative
        })
      }
    }

    return orderId
  },
})

export const updateStatus = mutation({
  args: {
    id: v.id('orders'),
    status: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: Date.now(),
    })
  },
})

export const updateCustomerInfo = mutation({
  args: {
    id: v.id('orders'),
    customerInfo: v.object({
      name: v.string(),
      phone: v.string(),
      address: v.string(),
    }),
  },
  handler: async (ctx: any, args: any) => {
    await ctx.db.patch(args.id, {
      customerInfo: args.customerInfo,
      updatedAt: Date.now(),
    })
  },
})

export const cancel = mutation({
  args: { id: v.id('orders') },
  handler: async (ctx: any, args: any) => {
    const order = await ctx.db.get(args.id)
    if (!order) return

    // Restore product stock
    for (const item of order.items) {
      const product = await ctx.db.get(item.productId)
      if (product) {
        await ctx.db.patch(item.productId, {
          stock: (product.stock || 0) + item.quantity,
        })
      }
    }

    // Update order status
    await ctx.db.patch(args.id, {
      status: 'cancelled',
      updatedAt: Date.now(),
    })
  },
})

export const updateItemQuantity = mutation({
  args: {
    orderId: v.id('orders'),
    productId: v.id('products'),
    newQuantity: v.number(),
  },
  handler: async (ctx: any, args: any) => {
    const order = await ctx.db.get(args.orderId)
    if (!order) throw new Error('Order not found')

    const itemIndex = order.items.findIndex((item: any) => item.productId === args.productId)
    if (itemIndex === -1) throw new Error('Item not found in order')

    const oldQuantity = order.items[itemIndex].quantity
    const quantityDiff = args.newQuantity - oldQuantity

    // Update product stock
    const product = await ctx.db.get(args.productId)
    if (product) {
      // If increasing quantity, reduce stock; if decreasing, add stock back
      await ctx.db.patch(args.productId, {
        stock: (product.stock || 0) - quantityDiff,
      })
    }

    // Update order item
    const updatedItems = [...order.items]
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      quantity: args.newQuantity,
    }

    // Recalculate total
    const newTotal = updatedItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)

    await ctx.db.patch(args.orderId, {
      items: updatedItems,
      total: newTotal,
      updatedAt: Date.now(),
    })
  },
})

export const removeItem = mutation({
  args: {
    orderId: v.id('orders'),
    productId: v.id('products'),
  },
  handler: async (ctx: any, args: any) => {
    const order = await ctx.db.get(args.orderId)
    if (!order) throw new Error('Order not found')

    const item = order.items.find((item: any) => item.productId === args.productId)
    if (!item) throw new Error('Item not found in order')

    // Restore product stock
    const product = await ctx.db.get(args.productId)
    if (product) {
      await ctx.db.patch(args.productId, {
        stock: (product.stock || 0) + item.quantity,
      })
    }

    // Remove item from order
    const updatedItems = order.items.filter((item: any) => item.productId !== args.productId)

    // If no items left, cancel the order
    if (updatedItems.length === 0) {
      await ctx.db.patch(args.orderId, {
        status: 'cancelled',
        updatedAt: Date.now(),
      })
      return
    }

    // Recalculate total
    const newTotal = updatedItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)

    await ctx.db.patch(args.orderId, {
      items: updatedItems,
      total: newTotal,
      updatedAt: Date.now(),
    })
  },
})

export const confirmItem = mutation({
  args: {
    orderId: v.id('orders'),
    productId: v.id('products'),
  },
  handler: async (ctx: any, args: any) => {
    const order = await ctx.db.get(args.orderId)
    if (!order) throw new Error('Order not found')

    const item = order.items.find((item: any) => item.productId === args.productId)
    if (!item) throw new Error('Item not found in order')

    // Mark item as confirmed by adding a flag
    const updatedItems = order.items.map((item: any) => 
      item.productId === args.productId 
        ? { ...item, confirmed: true }
        : item
    )

    await ctx.db.patch(args.orderId, {
      items: updatedItems,
      updatedAt: Date.now(),
    })
  },
})