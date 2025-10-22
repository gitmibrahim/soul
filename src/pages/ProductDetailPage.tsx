import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowRight, Minus, Plus, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { SOULLogo } from '../components/SOULLogo'
import { ThemeToggle } from '../components/ThemeToggle'

export default function ProductDetailPage() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const [quantity, setQuantity] = useState(1)
  const [cartQuantity, setCartQuantity] = useState(0)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
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
  const product = useQuery(api.products.get, { id: productId as Id<'products'> })
  const cart = useQuery(api.carts.getCart, { guestId }) || { items: [] }

  // Convex mutations
  const addToCart = useMutation(api.carts.addToCart)
  const updateCartItem = useMutation(api.carts.updateCartItem)
  const removeFromCart = useMutation(api.carts.removeFromCart)
  const cartItemCount = useQuery(api.carts.getCartItemCount, { guestId }) || 0

  useEffect(() => {
    if (product) {
      const cartItem = cart.items.find((item: any) => item.productId === product._id)
      setCartQuantity(cartItem ? cartItem.quantity : 0)
    }
  }, [product, cart.items])

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">المنتج غير موجود</h2>
          <Button onClick={() => navigate('/')}>العودة للمنتجات</Button>
        </div>
      </div>
    )
  }

  const handleAddToCart = async () => {
    if (!product) return
    
    try {
      await addToCart({
        guestId,
        productId: product._id,
        quantity: quantity
      })
      toast.success('تمت إضافة المنتج إلى السلة')
    } catch (error) {
      toast.error('حدث خطأ أثناء إضافة المنتج للسلة')
    }
  }

  return (
    <div className="w-4/5 mx-auto min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <SOULLogo size="sm" />
            </Link>         
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-lg overflow-hidden relative">
              <img 
                src={product.imageUrls?.[currentImageIndex] || 'https://placehold.co/600x600/e2e8f0/475569?text=منتج'} 
                alt={product.name} 
                className="w-full h-full object-cover" 
              />
              {product.imageUrls && product.imageUrls.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2"
                    onClick={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
                    disabled={currentImageIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setCurrentImageIndex(Math.min(product.imageUrls.length - 1, currentImageIndex + 1))}
                    disabled={currentImageIndex === product.imageUrls.length - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
            {product.imageUrls && product.imageUrls.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.imageUrls.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 ${
                      index === currentImageIndex ? 'border-primary' : 'border-muted'
                    }`}
                  >
                    <img
                      src={url}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {product.name}
                <span className="text-lg font-normal text-muted-foreground mx-2">({product.productCode})</span>
              </h1>
              <p className="text-4xl font-bold text-primary mb-4">{product.price} جنيه</p>
              {cartQuantity > 0 && (
                <p className="text-primary font-semibold mt-2">الكمية في السلة: <span className="font-bold">{cartQuantity}</span></p>
              )}
            </div>
            <Card>
              <CardHeader><CardTitle>وصف المنتج</CardTitle></CardHeader>
              <CardContent><p className="text-muted-foreground leading-relaxed">{product.description}</p></CardContent>
            </Card>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-semibold">الكمية:</span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus className="h-4 w-4" /></Button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}><Plus className="h-4 w-4" /></Button>
                </div>
              </div>
              {cartQuantity > 0 && cartQuantity > (product.stock || 0) && (
                <p className="text-sm text-amber-600 dark:text-amber-500 text-center">
                  الكمية المتوفرة: {product.stock || 0} - سيتم التأكيد عبر واتساب
                </p>
              )}
              <Button 
                size="lg" 
                className="w-full gap-2" 
                onClick={handleAddToCart}
                variant={product.stock && product.stock <= 0 ? 'outline' : 'default'}
              >
                <ShoppingCart className="h-5 w-5" />
                {product.stock && product.stock <= 0 
                  ? 'أضف للاستعلام عبر واتساب' 
                  : cartQuantity > 0 
                    ? `إضافة ${quantity} أخرى إلى السلة` 
                    : 'إضافة إلى السلة'}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
