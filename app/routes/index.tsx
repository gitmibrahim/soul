import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Search, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

// Mock data for development
const mockCategories = [
  { _id: '1', name: 'أغطية جوالات', description: 'جميع أنواع أغطية الجوال', createdAt: Date.now() },
  { _id: '2', name: 'حماية شاشة', description: 'حماية الشاشة الزجاجية والعادية', createdAt: Date.now() },
  { _id: '3', name: 'شواحن', description: 'شواحن سريعة وعادية', createdAt: Date.now() },
  { _id: '4', name: 'سماعات', description: 'سماعات سلكية ولاسلكية', createdAt: Date.now() },
]

const mockProducts = [
  {
    _id: 'p1',
    name: 'غطاء سيليكون شفاف',
    description: 'غطاء سيليكون عالي الجودة شفاف لحماية الجوال',
    price: 25,
    categoryId: '1',
    imageUrl: 'https://placehold.co/400x400/e2e8f0/475569?text=غطاء+سيليكون',
    stock: 100,
    createdAt: Date.now(),
  },
  {
    _id: 'p2',
    name: 'حماية شاشة زجاجية',
    description: 'حماية شاشة زجاجية مقاومة للكسر والخدش',
    price: 35,
    categoryId: '2',
    imageUrl: 'https://placehold.co/400x400/e2e8f0/475569?text=حماية+شاشة',
    stock: 150,
    createdAt: Date.now(),
  },
  {
    _id: 'p3',
    name: 'شاحن سريع 20 واط',
    description: 'شاحن سريع بقوة 20 واط مع كيبل USB-C',
    price: 45,
    categoryId: '3',
    imageUrl: 'https://placehold.co/400x400/e2e8f0/475569?text=شاحن+سريع',
    stock: 80,
    createdAt: Date.now(),
  },
  {
    _id: 'p4',
    name: 'سماعات بلوتوث',
    description: 'سماعات بلوتوث لاسلكية مع جودة صوت عالية',
    price: 120,
    categoryId: '4',
    imageUrl: 'https://placehold.co/400x400/e2e8f0/475569?text=سماعات',
    stock: 50,
    createdAt: Date.now(),
  },
  {
    _id: 'p5',
    name: 'غطاء جلد فاخر',
    description: 'غطاء من الجلد الطبيعي الفاخر',
    price: 85,
    categoryId: '1',
    imageUrl: 'https://placehold.co/400x400/e2e8f0/475569?text=غطاء+جلد',
    stock: 40,
    createdAt: Date.now(),
  },
  {
    _id: 'p6',
    name: 'حماية كاميرا',
    description: 'حماية زجاجية لعدسة الكاميرا',
    price: 20,
    categoryId: '2',
    imageUrl: 'https://placehold.co/400x400/e2e8f0/475569?text=حماية+كاميرا',
    stock: 200,
    createdAt: Date.now(),
  },
]

export const Route = createFileRoute('/')({
  component: HomePage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      q: (search.q as string) || '',
      category: (search.category as string) || '',
    }
  },
})

function HomePage() {
  const navigate = useNavigate()
  const { q, category } = Route.useSearch()
  const [searchTerm, setSearchTerm] = useState(q)

  // Get cart from localStorage
  const getCartCount = () => {
    if (typeof window === 'undefined') return 0
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    return cart.reduce((sum: number, item: any) => sum + item.quantity, 0)
  }

  const [cartCount, setCartCount] = useState(0)

  // Filter products
  const filteredProducts = mockProducts.filter((product) => {
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !category || product.categoryId === category
    return matchesSearch && matchesCategory
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate({
      search: (prev) => ({ ...prev, q: searchTerm }),
    })
  }

  const handleCategoryFilter = (categoryId: string) => {
    navigate({
      search: (prev) => ({ ...prev, category: categoryId === category ? '' : categoryId }),
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">خطّاب</h1>
            <span className="text-sm text-muted-foreground">جملة إكسسوارات الجوال</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => navigate({ to: '/cart' })}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>
            <Button variant="outline" onClick={() => navigate({ to: '/admin' })}>
              لوحة التحكم
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Search Bar */}
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

        {/* Category Filters */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">التصنيفات</h2>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={!category ? 'default' : 'outline'}
              onClick={() => handleCategoryFilter('')}
            >
              الكل
            </Button>
            {mockCategories.map((cat) => (
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

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product._id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div 
                className="aspect-square bg-muted cursor-pointer"
                onClick={() => navigate({ to: `/products/${product._id}` })}
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {product.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{product.price} ر.س</span>
                  <span className="text-sm text-muted-foreground">
                    متوفر: {product.stock}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button 
                  className="flex-1"
                  onClick={() => navigate({ to: `/products/${product._id}` })}
                >
                  عرض التفاصيل
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">لا توجد منتجات</p>
          </div>
        )}
      </main>
    </div>
  )
}
