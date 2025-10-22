import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, ShoppingCart, Plus, Minus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useQuery, useMutation, useAction } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card'
import { SOULLogo } from '../components/SOULLogo'
import { ThemeToggle } from '../components/ThemeToggle'

export default function HomePage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const category = searchParams.get('category') || ''
  
  const [searchTerm, setSearchTerm] = useState(q)
  const [guestId] = useState(() => {
    // Generate or retrieve session ID for guest cart
    let guestId = localStorage.getItem('guestIdKey')
    if (!guestId) {
      guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('guestIdKey', guestId)
    }
    return guestId
  })

  // Convex queries
  const categories = useQuery(api.categories.list) || []
  const products = useQuery(api.products.list)
  const cart = useQuery(api.carts.getCart, { guestId }) || { items: [] }
  const cartItemCount = useQuery(api.carts.getCartItemCount, { guestId }) || 0

  // Convex mutations
  const addToCart = useMutation(api.carts.addToCart)
  const updateCartItem = useMutation(api.carts.updateCartItem)
  const removeFromCart = useMutation(api.carts.removeFromCart)

  // Check if products are loading
  const isLoading = products === undefined

  const filteredProducts = products ? products.filter((product) => {
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !category || product.categoryId === category
    return matchesSearch && matchesCategory
  }) : []

  // Get cart quantities for each product
  const productCartQuantities = cart.items.reduce((acc: Record<string, number>, item: any) => {
    acc[item.productId] = item.quantity
    return acc
  }, {})

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchParams({ q: searchTerm, category })
  }

  const handleCategoryFilter = (categoryId: string) => {
    const newCategory = categoryId === category ? '' : categoryId
    setSearchParams({ q: searchTerm, category: newCategory })
  }

  const handleAddToCart = async (product: any) => {
    try {
      await addToCart({
        guestId,
        productId: product._id as Id<'products'>,
        quantity: 1
      })
      toast.success(`تمت إضافة ${product.name} إلى السلة`, {
        position: 'top-center',
        richColors: true,
        icon: '🛒',
        duration: 3000,
        style: {
          backgroundColor: '#16a34a',
          color: '#fff',
          borderRadius: '10px',
          padding: '10px',
          fontSize: '16px',
        },
      })
    } catch (error) {
      toast.error('حدث خطأ أثناء إضافة المنتج للسلة')
    }
  }

  const handleQuantityChange = async (product: any, delta: number) => {
    try {
      const currentQuantity = productCartQuantities[product._id] || 0
      const newQuantity = currentQuantity + delta
      
      if (newQuantity <= 0) {
        await removeFromCart({
          guestId,
          productId: product._id as Id<'products'>
        })
      } else {
        await updateCartItem({
          guestId,
          productId: product._id as Id<'products'>,
          quantity: newQuantity
        })
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء تحديث الكمية')
    }
  }

  return (
    <div className="w-4/5 mx-auto min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <SOULLogo size="md" />
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => navigate('/cart')}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="ابحث عن المنتجات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Button type="submit">بحث</Button>
          </form>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">التصنيفات</h2>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={!category ? 'default' : 'outline'}
              onClick={() => handleCategoryFilter('')}
            >
              الكل
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat._id}
                variant={category === cat._id ? 'default' : 'outline'}
                onClick={() => handleCategoryFilter(cat._id)}
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div 
                    className="aspect-square bg-muted cursor-pointer"
                    onClick={() => navigate(`/products/${product._id}`)}
                  >
                    <img
                      src={product.imageUrls?.[0] || 'https://placehold.co/400x400/e2e8f0/475569?text=منتج'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {product.name}
                      <span className="text-sm font-normal text-muted-foreground mx-2">({product.productCode})</span>
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {product.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-right">{product.price} جنيه</span>
                      <span className={`text-sm ${product.stock && product.stock <= 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {product.stock && product.stock <= 0 && 'غير متوفر'}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex-col gap-2">
                    {productCartQuantities[product._id] > 0 ? (
                      <div className="flex items-center gap-2 w-full">
                        <Button 
                          variant="outline"
                          size="icon"
                          onClick={() => handleQuantityChange(product, -1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="flex-1 text-center font-semibold">
                          {productCartQuantities[product._id]}
                        </span>
                        <Button 
                          variant="outline"
                          size="icon"
                          onClick={() => handleQuantityChange(product, 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        className="w-full gap-2"
                        onClick={() => handleAddToCart(product)}
                        variant={product.stock && product.stock <= 0 ? 'outline' : 'default'}
                      >
                        <Plus className="h-4 w-4" />
                        {product.stock && product.stock <= 0 ? 'أضف للاستعلام عبر واتساب' : 'إضافة للسلة'}
                      </Button>
                    )}
                    {productCartQuantities[product._id] > 0 && productCartQuantities[product._id] > (product.stock || 0) && (
                      <p className="text-xs text-amber-600 dark:text-amber-500 text-center w-full">
                        سيتم التأكيد عبر واتساب
                      </p>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">لا توجد منتجات</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
