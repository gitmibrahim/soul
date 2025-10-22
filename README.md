# Khattab Wholesale - E-commerce Platform

A modern e-commerce platform built with React, TypeScript, and Convex for managing wholesale mobile accessories.

## Features

- **Product Management**: Add, edit, and delete products with multiple image support
- **Category Management**: Organize products into categories
- **Guest Cart System**: Shopping cart functionality for guest users using session-based storage
- **Admin Dashboard**: Complete admin interface for managing products and categories
- **Image Upload**: Support for uploading multiple product images using Convex file storage
- **Responsive Design**: Mobile-first design with dark/light theme support
- **WhatsApp Integration**: Direct order placement via WhatsApp

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Convex (real-time database and functions)
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: Convex React hooks
- **File Storage**: Convex file storage for images

## Database Schema

### Categories
- `name`: string
- `description`: optional string
- `createdAt`: number

### Products
- `name`: string
- `description`: string
- `price`: number
- `categoryId`: reference to categories
- `imageUrls`: array of strings (multiple images)
- `stock`: optional number
- `productCode`: string (auto-generated SO#### format)
- `createdAt`: number

### Carts (Guest Sessions)
- `guestId`: string (guest session identifier)
- `items`: array of cart items with product references and quantities
- `createdAt`: number
- `updatedAt`: number

### Admin
- `username`: string
- `password`: string (should be hashed in production)

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set up Convex**
   ```bash
   npx convex dev
   ```
   This will start the Convex development server and generate the API types.

3. **Environment Variables**
   Create a `.env.local` file with:
   ```
   VITE_CONVEX_URL=your_convex_deployment_url
   ```
   
   **Note**: If you don't set this variable, the app will use a mock URL for development.

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## Usage

### Admin Panel
- Navigate to `/admin/login` to access the admin panel
- Create admin account using the `createDefaultAdmin` function in Convex
- Manage categories at `/admin/categories`
- Manage products at `/admin/products`

### Customer Experience
- Browse products on the homepage
- Filter by categories
- Search products by name, description, or product code
- View detailed product pages with multiple image gallery
- Add products to cart (guest session-based)
- View cart and place orders via WhatsApp

### Image Management
- Upload multiple images per product (up to 5)
- Support for both file upload and direct URL input
- Images are stored in Convex file storage
- Automatic fallback to placeholder images

## API Functions

### Categories
- `list`: Get all categories
- `get`: Get category by ID
- `create`: Create new category
- `update`: Update category
- `remove`: Delete category

### Products
- `list`: Get all products
- `get`: Get product by ID
- `getByCategory`: Get products by category
- `getByProductCode`: Get product by code
- `search`: Search products
- `create`: Create new product
- `update`: Update product
- `remove`: Delete product

### Carts
- `getCart`: Get cart with product details
- `addToCart`: Add product to cart
- `updateCartItem`: Update item quantity
- `removeFromCart`: Remove item from cart
- `clearCart`: Clear entire cart
- `getCartItemCount`: Get total item count
- `getCartTotal`: Calculate cart total

### Files
- `generateUploadUrl`: Generate upload URL for files
- `getImageUrl`: Get public URL for uploaded file
- `deleteImage`: Delete uploaded file

## Production Considerations

1. **Security**: Hash admin passwords using bcrypt or similar
2. **File Storage**: Configure proper CORS and access policies
3. **Rate Limiting**: Implement rate limiting for API calls
4. **Error Handling**: Add comprehensive error handling and logging
5. **Monitoring**: Set up monitoring and analytics
6. **Backup**: Regular database backups

## Development

- The app uses Convex for real-time data synchronization
- All database operations are handled through Convex functions
- Frontend automatically updates when data changes
- TypeScript provides type safety across the entire stack

## License

This project is proprietary software for Khattab Wholesale.
