import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowRight, Minus, Plus, ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Mock product data
const mockProducts: Record<string, any> = {
  p1: {
    _id: 'p1',
    name: 'غطاء سيليكون شفاف',
    description: 'غطاء سيليكون عالي الجودة شفاف لحماية الجوال من الصدمات والخدوش. مصنوع من مواد مرنة ومقاومة للاصفرار.',
    price: 25,
    categoryId: '1',
    imageUrl: 'https://placehold.co/600x600/e2e8f0/475569?text=غطاء+سيليكون',
    stock: 100,
    createdAt: Date.now(),
  },
  p2: {
    _id: 'p2',
    name: 'حماية شاشة زجاجية',
    description: 'حماية شاشة زجاجية مقاومة للكسر والخدش بدرجة صلابة 9H. سهلة التركيب بدون فقاعات هواء.',
    price: 35,
    categoryId: '2',
    imageUrl: 'https://placehold.co/600x600/e2e8f0/475569?text=حماية+شاشة',
    stock: 150,
    createdAt: Date.now(),
  },
  p3: {
    _id: 'p3',
    name: 'شاحن سريع 20 واط',
    description: 'شاحن سريع بقوة 20 واط مع كيبل USB-C. يدعم الشحن السريع لجميع الأجهزة الحديثة.',
    price: 45,
    categoryId: '3',
    imageUrl: 'https://placehold.co/600x600/e2e8f0/475569?text=شاحن+سريع',
    stock: 80,
    createdAt: Date.now(),
  },
  p4: {
    _id: 'p4',
    name: 'سماعات بلوتوث',
    description: 'سماعات بلوتوث لاسلكية مع جودة صوت عالية وبطارية تدوم حتى 24 ساعة.',
    price: 120,
    categoryId: '4',
    imageUrl: 'https://placehold.co/600x600/e2e8f0/475569?text=سماعات',
    stock: 50,
    createdAt: Date.now(),
  },
  p5: {
    _id: 'p5',
    name: 'غطاء جلد فاخر',
    description: 'غطاء من الجلد الطبيعي الفاخر بتصميم أنيق وعصري. يوفر حماية ممتازة مع مظهر راقي.',
    price: 85,
    categoryId: '1',
    imageUrl: 'https://placehold.co/600x600/e2e8f0/475569?text=غطاء+جلد',
    stock: 40,
    createdAt: Date.now(),
  },
  p6: {
    _id: 'p6',
    name: 'حماية كاميرا',
    description: 'حماية زجاجية لعدسة الكاميرا تحمي من الخدوش والكسر. مقاومة للبصمات.',
    price: 20,
    categoryId: '2',
    imageUrl: 'https://placehold.co/600x600/e2e8f0/475569?text=حماية+كاميرا',
    stock: 200,
    createdAt: Date.now(),
  },
}

export const Route = createFileRoute('/products/$productId')({
  component: ProductDetailPage,
})

function ProductDetailPage() {
  const { productId } = Route.useParams()
  const navigate = useNavigate()
  const [quantity, setQuantity] = useState(1)

  const product = mockProducts[productId]

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">المنتج غير موجود</h2>
          <Button onClick={() => navigate({ to: '/' })}>
            العودة للرئيسية
          </Button>
        </div>
      </div>
    )
  }

  const handleAddToCart = () => {
    if (typeof window === 'undefined') return
    
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingIndex = cart.findIndex((item: any) => item.id === product._id)
    
    if (existingIndex >= 0) {
      cart[existingIndex].quantity += quantity
    } else {
      cart.push({
        id: product._id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        quantity,
      })
    }
    
    localStorage.setItem('cart', JSON.stringify(cart))
    alert('تمت إضافة المنتج إلى السلة')
    navigate({ to: '/cart' })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Button
            variant="ghost"
            onClick={() => navigate({ to: '/' })}
            className="gap-2"
          >
            <ArrowRight className="h-4 w-4" />
            العودة للرئيسية
          </Button>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="aspect-square bg-muted rounded-lg overflow-hidden">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <p className="text-4xl font-bold text-primary mb-4">
                {product.price} ر.س
              </p>
              <p className="text-muted-foreground">
                الكمية المتوفرة: <span className="font-semibold">{product.stock}</span>
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>وصف المنتج</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-semibold">الكمية:</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full gap-2"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="h-5 w-5" />
                إضافة إلى السلة
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
