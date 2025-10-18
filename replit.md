# خطّاب - Wholesale Mobile Accessories E-Commerce

## Overview
A full-featured Arabic wholesale e-commerce website for خطّاب (Khattab), specializing in mobile phone cases and accessories. Built with React, Vite, and Tailwind CSS with complete RTL (right-to-left) support.

## Features
- **Arabic RTL Interface**: Complete Arabic language support with right-to-left layout
- **Product Catalog**: Browse products with search and category filters
- **Shopping Cart**: Add/remove products with quantity management
- **WhatsApp Integration**: Send orders directly to WhatsApp with formatted messages
- **Admin Dashboard**: Manage categories and products with a secure login
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack
- **Frontend**: React 19, Vite 7, React Router DOM
- **Styling**: Tailwind CSS v3, shadcn/ui components
- **Backend Ready**: Convex schema prepared (not yet integrated)
- **State Management**: localStorage for cart and admin auth

## Project Structure
```
├── src/
│   ├── components/ui/     # Reusable UI components (Button, Card, Input)
│   ├── pages/             # Route pages
│   │   ├── HomePage.tsx           # Main products page
│   │   ├── ProductDetailPage.tsx  # Product details
│   │   ├── CartPage.tsx           # Shopping cart
│   │   ├── AdminLoginPage.tsx     # Admin login
│   │   └── AdminDashboard.tsx     # Admin management
│   ├── lib/               # Utilities (cn helper)
│   ├── styles/            # Global styles
│   ├── App.tsx            # Routes configuration
│   └── main.tsx           # App entry point
├── convex/                # Convex backend schema (ready for integration)
├── index.html             # HTML entry point
├── vite.config.ts         # Vite configuration
└── tailwind.config.ts     # Tailwind configuration
```

## Default Admin Credentials
- **Username**: admin
- **Password**: admin123

## WhatsApp Configuration
The WhatsApp number is currently set to a placeholder: `966500000000`
To change it, update the `whatsappNumber` variable in `src/pages/CartPage.tsx`

## Development
- Run `npm run dev` to start the development server on port 5000
- The app is configured to bind to `0.0.0.0:5000` for Replit compatibility

## Current Implementation Status
✅ Homepage with product grid
✅ Search and category filtering with URL query params
✅ Product details page
✅ Shopping cart with localStorage persistence
✅ WhatsApp order integration
✅ Admin login (localStorage-based)
✅ Admin dashboard for categories
✅ Admin dashboard for products
✅ Full Arabic RTL support
✅ Cairo font integration
✅ Responsive design

## Future Enhancements
- Integrate Convex for real-time database
- Add product image upload functionality
- Implement proper authentication with session management
- Add order history tracking
- Support for product variants (colors, sizes)
- Bulk product import/export

## Recent Changes
- **2025-10-18**: Switched from TanStack Start to Vite + React Router for better stability
- **2025-10-18**: Implemented all core features with mock data
- **2025-10-18**: Added complete Arabic RTL support with Cairo font
