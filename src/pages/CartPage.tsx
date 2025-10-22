import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Minus, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useQuery, useMutation, useAction } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card'
import { SOULLogo } from '../components/SOULLogo'
import { ThemeToggle } from '../components/ThemeToggle'

export default function CartPage() {
  const navigate = useNavigate()
  const [guestId] = useState(() => {
    // Generate or retrieve session ID for guest cart
    let guestId = localStorage.getItem('guestIdKey')
    if (!guestId) {
      guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      localStorage.setItem('guestIdKey', guestId)
    }
    return guestId
  })

  // Convex queries
  const cart = useQuery(api.carts.getCartWithProducts, { guestId }) || { items: [] }

  // Convex mutations
  const updateCartItem = useMutation(api.carts.updateCartItem)
  const removeFromCart = useMutation(api.carts.removeFromCart)
  const placeOrder = useMutation(api.carts.placeOrder)

  const updateQuantity = async (productId: string, delta: number) => {
    const cartItem = cart.items.find((item: any) => item.productId === productId)
    if (!cartItem) return

    const newQuantity = cartItem.quantity + delta
    
    if (newQuantity <= 0) {
      await removeFromCart({
        guestId,
        productId: productId as Id<'products'>
      })
    } else {
      await updateCartItem({
        guestId,
        productId: productId as Id<'products'>,
        quantity: newQuantity
      })
    }
  }

  const removeItem = async (productId: string) => {
    await removeFromCart({
      guestId,
      productId: productId as Id<'products'>
    })
  }

  const handleOrderWhatsApp = async () => {
    if (cart.items.length === 0) return
    
    try {
      const whatsappNumber = '+201121320681'
      
      // Save cart items and total before placing order (cart gets cleared after)
      const cartItems = [...cart.items]
      const cartTotal = cart.total
      
      // Build the temporary message to get order ID first
      let tempMessage = '🛒 *طلب جديد من SOUL*\n\n*المنتجات:*\n'
      let hasItemsNeedingConfirmation = false
      cartItems.forEach((item: any, index: number) => {
        const needsConfirmation = item.quantity > (item.product.stock || 0)
        if (needsConfirmation) hasItemsNeedingConfirmation = true
        tempMessage += `${index + 1}. ${item.product.name} (${item.product.productCode})\n   الكمية المطلوبة: ${item.quantity}\n`
        if (needsConfirmation) {
          tempMessage += `   ⚠️ غير متوفر\n`
        }
        tempMessage += `   السعر: ${item.product.price} جنيه\n   المجموع: ${item.product.price * item.quantity} جنيه\n\n`
      })
      tempMessage += `*المجموع الكلي: ${cartTotal} جنيه*\n\n`
      if (hasItemsNeedingConfirmation) {
        tempMessage += '⚠️ *بعض المنتجات تحتاج تأكيد إذا كانت متوفرة*\n\n'
      }
      tempMessage += 'يرجى تأكيد الطلب وإرسال معلومات الشحن.'
      
      // Place the order to get the order ID
      const orderId = await placeOrder({
        guestId,
        whatsappMessage: tempMessage,
      })
      
      // Build the final WhatsApp message with order ID
      let message = `🛒 *طلب جديد من SOUL*\n📋 *رقم الطلب: #${orderId.slice(-8)}*\n\n*المنتجات:*\n`
      cartItems.forEach((item: any, index: number) => {
        const needsConfirmation = item.quantity > (item.product.stock || 0)
        message += `${index + 1}. ${item.product.name} (${item.product.productCode})\n   الكمية المطلوبة: ${item.quantity}\n`
        if (needsConfirmation) {
          message += `   ⚠️ غير متوفر\n`
        }
        message += `   السعر: ${item.product.price} جنيه\n   المجموع: ${item.product.price * item.quantity} جنيه\n\n`
      })
      message += `*المجموع الكلي: ${cartTotal} جنيه*\n\n`
      if (hasItemsNeedingConfirmation) {
        message += '⚠️ *بعض المنتجات تحتاج تأكيد إذا كانت متوفرة*\n\n'
      }
      message += 'يرجى تأكيد الطلب وإرسال معلومات الشحن.'
      
      // Open WhatsApp with the message
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, '_blank')
      
      // Show success message
      toast.success('تم إرسال الطلب بنجاح! سيتم التواصل معك قريباً.')
    } catch (error) {
      console.error('Error placing order:', error)
      toast.error(error instanceof Error ? error.message : 'حدث خطأ أثناء إرسال الطلب')
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto min-h-screen bg-background px-4 sm:px-6 lg:px-8">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <SOULLogo size="sm" />
            </Link>
          </div>
          <ThemeToggle />
        </div>
      </header>
      <main className="container py-8">
        <h1 className="text-3xl font-bold mb-8">سلة المشتريات</h1>
        {cart.items.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">السلة فارغة</p>
              <Button onClick={() => navigate('/')}>تصفح المنتجات</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 space-y-4">
              {cart.items.map((item: any) => {
                const needsConfirmation = item.quantity > (item.product.stock || 0)
                return (
                  <Card key={item.productId} className={needsConfirmation ? 'border-amber-500/50' : ''}>
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <img 
                          src={item.product.imageUrls?.[0] || 'https://placehold.co/400x400/e2e8f0/475569?text=منتج'} 
                          alt={item.product.name} 
                          className="w-full sm:w-24 h-48 sm:h-24 object-cover rounded-md" 
                        />
                        <div className="flex-1 space-y-4">
                          <div>
                            <h3 className="font-semibold mb-2 text-lg">
                              {item.product.name}
                              <span className="text-sm font-normal text-muted-foreground mx-2">({item.product.productCode})</span>
                            </h3>
                            <p className="text-lg font-bold text-primary">{item.product.price} جنيه</p>
                            {needsConfirmation && (
                              <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                                غير متوفر - سيتم التأكيد عبر واتساب
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="icon" onClick={() => updateQuantity(item.productId, -1)}><Minus className="h-4 w-4" /></Button>
                              <span className="w-12 text-center font-semibold">{item.quantity}</span>
                              <Button variant="outline" size="icon" onClick={() => updateQuantity(item.productId, 1)}><Plus className="h-4 w-4" /></Button>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-4">
                              <div className="text-left">
                                <p className="text-sm text-muted-foreground mb-1">المجموع</p>
                                <p className="text-xl font-bold">{item.product.price * item.quantity} جنيه</p>
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => removeItem(item.productId)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            <div className="xl:order-2">
              <Card className="sticky top-20">
                <CardHeader><CardTitle>ملخص الطلب</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">عدد المنتجات</span>
                    <span className="font-semibold">{cart.items.reduce((sum: number, item: any) => sum + item.quantity, 0)}</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>المجموع الكلي</span>
                      <span className="text-primary">{cart.total} جنيه</span>
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
