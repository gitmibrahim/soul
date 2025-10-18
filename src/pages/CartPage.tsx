import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Minus, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface CartItem {
  id: string
  name: string
  price: number
  imageUrl: string
  quantity: number
}

export default function CartPage() {
  const navigate = useNavigate()
  const [cart, setCart] = useState<CartItem[]>([])

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]')
    setCart(savedCart)
  }, [])

  const updateCart = (newCart: CartItem[]) => {
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
  }

  const updateQuantity = (id: string, delta: number) => {
    const newCart = cart.map((item) => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item)
    updateCart(newCart)
  }

  const removeItem = (id: string) => {
    updateCart(cart.filter((item) => item.id !== id))
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleOrderWhatsApp = () => {
    if (cart.length === 0) return
    const whatsappNumber = '966500000000'
    let message = '🛒 *طلب جديد من خطّاب*\n\n*المنتجات:*\n'
    cart.forEach((item, index) => {
      message += `${index + 1}. ${item.name}\n   الكمية: ${item.quantity}\n   السعر: ${item.price} ر.س\n   المجموع: ${item.price * item.quantity} ر.س\n\n`
    })
    message += `*المجموع الكلي: ${total} ر.س*\n\nيرجى تأكيد الطلب وإرسال معلومات الشحن.`
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Button variant="ghost" onClick={() => navigate('/')} className="gap-2">
            <ArrowRight className="h-4 w-4" />
            العودة للرئيسية
          </Button>
        </div>
      </header>
      <main className="container py-8">
        <h1 className="text-3xl font-bold mb-8">سلة المشتريات</h1>
        {cart.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">السلة فارغة</p>
              <Button onClick={() => navigate('/')}>تصفح المنتجات</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img src={item.imageUrl} alt={item.name} className="w-24 h-24 object-cover rounded-md" />
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">{item.name}</h3>
                        <p className="text-lg font-bold text-primary mb-4">{item.price} ر.س</p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" onClick={() => updateQuantity(item.id, -1)}><Minus className="h-4 w-4" /></Button>
                            <span className="w-12 text-center font-semibold">{item.quantity}</span>
                            <Button variant="outline" size="icon" onClick={() => updateQuantity(item.id, 1)}><Plus className="h-4 w-4" /></Button>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="text-sm text-muted-foreground mb-1">المجموع</p>
                        <p className="text-xl font-bold">{item.price * item.quantity} ر.س</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div>
              <Card className="sticky top-20">
                <CardHeader><CardTitle>ملخص الطلب</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">عدد المنتجات</span>
                    <span className="font-semibold">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>المجموع الكلي</span>
                      <span className="text-primary">{total} ر.س</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button size="lg" className="w-full" onClick={handleOrderWhatsApp}>طلب عبر واتساب</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
