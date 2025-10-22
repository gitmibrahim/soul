import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Package, CheckCircle, XCircle, Clock, Eye, User, Phone, MapPin, Edit2, Trash2, Check, Plus, Minus } from 'lucide-react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { SOULLogo } from '../components/SOULLogo'
import { ThemeToggle } from '../components/ThemeToggle'
import { toast } from 'sonner'

export default function OrdersPage() {
  const navigate = useNavigate()
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [editingItem, setEditingItem] = useState<{orderId: string, productId: string, quantity: number} | null>(null)
  const [editQuantity, setEditQuantity] = useState<number>(0)

  // Convex queries
  const orders = useQuery(api.orders.list, { status: selectedStatus || undefined }) || []
  const products = useQuery(api.products.list) || []

  // Convex mutations
  const updateOrderStatus = useMutation(api.orders.updateStatus)
  const cancelOrder = useMutation(api.orders.cancel)
  const updateItemQuantity = useMutation(api.orders.updateItemQuantity)
  const removeItem = useMutation(api.orders.removeItem)
  const confirmItem = useMutation(api.orders.confirmItem)

  useEffect(() => {
    if (!localStorage.getItem('adminAuth')) navigate('/admin/login')
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('adminAuth')
    navigate('/')
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      if (newStatus === 'cancelled') {
        await cancelOrder({ id: orderId as Id<'orders'> })
      } else {
        await updateOrderStatus({ id: orderId as Id<'orders'>, status: newStatus })
      }
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'confirmed': return 'text-green-600 bg-green-100'
      case 'cancelled': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />
      case 'confirmed': return <CheckCircle className="h-4 w-4" />
      case 'cancelled': return <XCircle className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getProductStock = (productId: string) => {
    const product = products.find((p: any) => p._id === productId)
    return product?.stock || 0
  }

  const handleEditItem = (orderId: string, productId: string, currentQuantity: number) => {
    setEditingItem({ orderId, productId, quantity: currentQuantity })
    setEditQuantity(currentQuantity)
  }

  const handleSaveQuantity = async () => {
    if (!editingItem) return
    
    try {
      await updateItemQuantity({
        orderId: editingItem.orderId as Id<'orders'>,
        productId: editingItem.productId as Id<'products'>,
        newQuantity: editQuantity,
      })
      setEditingItem(null)
      toast.success('تم تحديث الكمية بنجاح')
    } catch (error) {
      toast.error('حدث خطأ أثناء تحديث الكمية')
    }
  }

  const handleRemoveItem = async (orderId: string, productId: string) => {
    try {
      await removeItem({
        orderId: orderId as Id<'orders'>,
        productId: productId as Id<'products'>,
      })
      toast.success('تم إزالة المنتج بنجاح')
    } catch (error) {
      toast.error('حدث خطأ أثناء إزالة المنتج')
    }
  }

  const handleConfirmItem = async (orderId: string, productId: string) => {
    try {
      await confirmItem({
        orderId: orderId as Id<'orders'>,
        productId: productId as Id<'products'>,
      })
      toast.success('تم تأكيد المنتج بنجاح')
    } catch (error) {
      toast.error('حدث خطأ أثناء تأكيد المنتج')
    }
  }

  return (
    <div className="w-4/5 mx-auto min-h-screen bg-background">
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/">
              <SOULLogo size="md" />
            </Link>
            <span className="text-sm text-muted-foreground">إدارة الطلبات</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="ghost" onClick={() => navigate('/admin')}>لوحة التحكم</Button>
            <Button variant="ghost" onClick={() => navigate('/')}>الموقع الرئيسي</Button>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />تسجيل الخروج
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Package className="h-6 w-6" />
              إدارة الطلبات
            </h1>
            <div className="flex gap-2">
              <Button
                variant={selectedStatus === '' ? 'default' : 'outline'}
                onClick={() => setSelectedStatus('')}
              >
                الكل
              </Button>
              <Button
                variant={selectedStatus === 'pending' ? 'default' : 'outline'}
                onClick={() => setSelectedStatus('pending')}
              >
                في الانتظار
              </Button>
              <Button
                variant={selectedStatus === 'confirmed' ? 'default' : 'outline'}
                onClick={() => setSelectedStatus('confirmed')}
              >
                مؤكدة
              </Button>
              <Button
                variant={selectedStatus === 'cancelled' ? 'default' : 'outline'}
                onClick={() => setSelectedStatus('cancelled')}
              >
                ملغية
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {orders.map((order: any) => (
              <Card key={order._id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        طلب #{order._id.slice(-8)}
                        <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status === 'pending' ? 'في الانتظار' : 
                           order.status === 'confirmed' ? 'مؤكد' : 'ملغي'}
                        </span>
                      </CardTitle>
                      <CardDescription>
                        تاريخ الطلب: {formatDate(order.createdAt)}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{order.total} جنيه</p>
                      <p className="text-sm text-muted-foreground">
                        {order.items.reduce((sum: number, item: any) => sum + item.quantity, 0)} منتج
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Order Items */}
                    <div>
                      <h4 className="font-semibold mb-2">المنتجات:</h4>
                      <div className="space-y-2">
                        {order.items.map((item: any, index: number) => {
                          const productStock = getProductStock(item.productId)
                          const needsConfirmation = item.quantity > productStock && !item.confirmed
                          const isEditing = editingItem?.orderId === order._id && editingItem?.productId === item.productId
                          
                          return (
                            <div 
                              key={index} 
                              className={`p-3 rounded border-2 ${
                                needsConfirmation ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/20' : 
                                item.confirmed ? 'border-green-500 bg-green-50 dark:bg-green-950/20' :
                                'border-transparent bg-muted'
                              }`}
                            >
                              <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                  <p className="font-medium">{item.productName}</p>
                                  <p className="text-sm text-muted-foreground">{item.productCode}</p>
                                  {needsConfirmation && (
                                    <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                                      ⚠️ الكمية المتوفرة: {productStock} - يحتاج تأكيد
                                    </p>
                                  )}
                                  {item.confirmed && (
                                    <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                                      ✓ تم التأكيد
                                    </p>
                                  )}
                                </div>
                                
                                {isEditing ? (
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => setEditQuantity(Math.max(1, editQuantity - 1))}
                                    >
                                      <Minus className="h-4 w-4" />
                                    </Button>
                                    <Input
                                      type="number"
                                      value={editQuantity}
                                      onChange={(e) => setEditQuantity(parseInt(e.target.value) || 0)}
                                      className="w-20 text-center"
                                      min="1"
                                    />
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => setEditQuantity(editQuantity + 1)}
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={handleSaveQuantity}
                                      className="gap-1"
                                    >
                                      <Check className="h-4 w-4" />
                                      حفظ
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setEditingItem(null)}
                                    >
                                      إلغاء
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-end gap-2">
                                    <div className="text-right">
                                      <p className="font-medium">{item.quantity} × {item.price} جنيه</p>
                                      <p className="text-sm text-muted-foreground">
                                        المجموع: {item.quantity * item.price} جنيه
                                      </p>
                                    </div>
                                    
                                    {order.status === 'pending' && (
                                      <div className="flex gap-1">
                                        {needsConfirmation && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleConfirmItem(order._id, item.productId)}
                                            className="gap-1 text-green-600 border-green-600 hover:bg-green-50"
                                          >
                                            <CheckCircle className="h-3 w-3" />
                                            تأكيد
                                          </Button>
                                        )}
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleEditItem(order._id, item.productId, item.quantity)}
                                          className="gap-1"
                                        >
                                          <Edit2 className="h-3 w-3" />
                                          تعديل
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleRemoveItem(order._id, item.productId)}
                                          className="gap-1 text-destructive border-destructive hover:bg-destructive/10"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                          إزالة
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Customer Info */}
                    {order.customerInfo && (
                      <div>
                        <h4 className="font-semibold mb-2">معلومات العميل:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{order.customerInfo.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{order.customerInfo.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{order.customerInfo.address}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* WhatsApp Message */}
                    <div>
                      <h4 className="font-semibold mb-2">رسالة الواتساب:</h4>
                      <div className="p-3 bg-muted rounded text-sm whitespace-pre-wrap">
                        {order.whatsappMessage}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4 border-t">
                      {order.status === 'pending' && (
                        <>
                          <Button
                            onClick={() => handleStatusChange(order._id, 'confirmed')}
                            className="gap-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                            تأكيد الطلب
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleStatusChange(order._id, 'cancelled')}
                            className="gap-2"
                          >
                            <XCircle className="h-4 w-4" />
                            إلغاء الطلب
                          </Button>
                        </>
                      )}
                      {order.status === 'confirmed' && (
                        <Button
                          variant="destructive"
                          onClick={() => handleStatusChange(order._id, 'cancelled')}
                          className="gap-2"
                        >
                          <XCircle className="h-4 w-4" />
                          إلغاء الطلب
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {orders.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">لا توجد طلبات</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
