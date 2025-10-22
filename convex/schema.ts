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
    imageUrls: v.array(v.string()), // Support multiple images
    stock: v.optional(v.number()),
    productCode: v.string(),
    createdAt: v.number(),
  }).index('by_category', ['categoryId']).index('by_product_code', ['productCode']),
  
  carts: defineTable({
    guestId: v.string(), // Guest session identifier
    // TODO: Add customer information by the admin
    //     : that associates with the guestId to the cart
    //     : and creates a new record in the customers table 
    //     : if not exists or adding new customer order and cart
    items: v.array(v.object({
      productId: v.id('products'),
      quantity: v.number(),
      addedAt: v.number(),
    })),
    total: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_session', ['guestId']),
  
  orders: defineTable({
    guestId: v.string(), // Guest session identifier
    items: v.array(v.object({
      productId: v.id('products'),
      quantity: v.number(),
      price: v.number(), // Price at time of order
      productName: v.string(),
      productCode: v.string(),
      confirmed: v.optional(v.boolean()), // Flag to track if out-of-stock item is confirmed
    })),
    total: v.number(),
    status: v.string(), // 'pending', 'confirmed', 'cancelled'
    customerInfo: v.optional(v.object({
      name: v.string(),
      phone: v.string(),
      address: v.string(),
    })),
    whatsappMessage: v.string(), // The message sent to WhatsApp
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_status', ['status']).index('by_session', ['guestId']),
  
  admin: defineTable({
    username: v.string(),
    password: v.string(), // In production, this should be hashed
  }).index('by_username', ['username']),
})
