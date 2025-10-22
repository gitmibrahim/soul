import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Package, Plus, Pencil, Trash2, Save, RotateCcw, AlertTriangle } from 'lucide-react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { SOULLogo } from '../components/SOULLogo'
import { ThemeToggle } from '../components/ThemeToggle'
import { ImageUpload } from '../components/ImageUpload'

interface ProductFormData {
  name: string
  description: string
  price: string
  stock: string
  categoryId: string
  imageUrls: string[]
}

export default function ProductsPage() {
  const navigate = useNavigate()
  const [showForm, setShowForm] = useState(false)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [formData, setFormData] = useState<ProductFormData>({ 
    name: '', 
    description: '', 
    price: '', 
    stock: '', 
    categoryId: '', 
    imageUrls: [] 
  })
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)
  const [draftData, setDraftData] = useState<ProductFormData | null>(null)

  // Convex queries
  const categories = useQuery(api.categories.list) || []
  const products = useQuery(api.products.list) || []

  // Convex mutations
  const createProduct = useMutation(api.products.create)
  const updateProduct = useMutation(api.products.update)
  const deleteProduct = useMutation(api.products.remove)

  useEffect(() => {
    if (!localStorage.getItem('adminAuth')) navigate('/admin/login')
  }, [navigate])

  // Load draft on component mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('productDraft')
    if (savedDraft) {
      const draft = JSON.parse(savedDraft)
      setDraftData(draft)
    }
  }, [])

  // Save draft to localStorage whenever form data changes
  useEffect(() => {
    const hasData = formData.name || formData.description || formData.price || 
                   formData.stock || formData.categoryId || formData.imageUrls.length > 0
    if (hasData) {
      localStorage.setItem('productDraft', JSON.stringify(formData))
      setHasUnsavedChanges(true)
    } else {
      localStorage.removeItem('productDraft')
      setHasUnsavedChanges(false)
    }
  }, [formData])

  // Warn user before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = 'لديك تغييرات غير محفوظة. هل تريد المغادرة؟'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  const handleLogout = () => {
    localStorage.removeItem('adminAuth')
    navigate('/')
  }

  const handleInputChange = (field: keyof ProductFormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSaveDraft = () => {
    setDraftData({ ...formData })
    localStorage.setItem('productDraft', JSON.stringify(formData))
    setHasUnsavedChanges(false)
  }

  const handleRestoreDraft = () => {
    if (draftData) {
      setFormData(draftData)
      setHasUnsavedChanges(true)
    }
  }

  const handleClearInputs = () => {
    setFormData({ name: '', description: '', price: '', stock: '', categoryId: '', imageUrls: [] })
    setDraftData(null)
    localStorage.removeItem('productDraft')
    setHasUnsavedChanges(false)
  }

  const handleDiscardChanges = () => {
    setShowDiscardConfirm(true)
  }

  const confirmDiscard = () => {
    setFormData({ name: '', description: '', price: '', stock: '', categoryId: '', imageUrls: [] })
    setDraftData(null)
    localStorage.removeItem('productDraft')
    setHasUnsavedChanges(false)
    setEditingProductId(null)
    setShowForm(false)
    setShowDiscardConfirm(false)
  }

  const cancelDiscard = () => {
    setShowDiscardConfirm(false)
  }

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        stock: Number(formData.stock),
        categoryId: formData.categoryId as Id<'categories'>,
        imageUrls: formData.imageUrls.length > 0 ? formData.imageUrls : ['https://placehold.co/400x400/e2e8f0/475569?text=منتج']
      }
      
      if (editingProductId) {
        await updateProduct({
          id: editingProductId as Id<'products'>,
          ...productData
        })
      } else {
        await createProduct(productData)
      }
      
      handleClearInputs()
      setEditingProductId(null)
      setShowForm(false)
    } catch (error) {
      console.error('Error saving product:', error)
    }
  }

  const handleEditProduct = (product: any) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      categoryId: product.categoryId,
      imageUrls: product.imageUrls || []
    })
    setEditingProductId(product._id)
    setShowForm(true)
  }

  const handleDeleteProduct = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      try {
        await deleteProduct({ id: id as Id<'products'> })
      } catch (error) {
        console.error('Error deleting product:', error)
      }
    }
  }

  const handleAddNew = () => {
    if (hasUnsavedChanges) {
      handleDiscardChanges()
    } else {
      setFormData({ name: '', description: '', price: '', stock: '', categoryId: '', imageUrls: [] })
      setEditingProductId(null)
      setShowForm(true)
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
            <span className="text-sm text-muted-foreground">إدارة المنتجات</span>
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
              إدارة المنتجات
            </h1>
            <Button onClick={handleAddNew} className="gap-2">
              <Plus className="h-4 w-4" />إضافة منتج
            </Button>
          </div>

          {/* Draft restoration notification */}
          {draftData && !showForm && (
            <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <span className="text-sm">لديك مسودة محفوظة للمنتج</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleRestoreDraft}>
                    استعادة المسودة
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form */}
          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {editingProductId ? 'تعديل المنتج' : 'منتج جديد'}
                  {hasUnsavedChanges && (
                    <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                      تغييرات غير محفوظة
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProduct} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">اسم المنتج</label>
                      <Input 
                        value={formData.name} 
                        onChange={(e) => handleInputChange('name', e.target.value)} 
                        placeholder="مثال: جراب سيليكون" 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">التصنيف</label>
                      <select 
                        value={formData.categoryId} 
                        onChange={(e) => handleInputChange('categoryId', e.target.value)} 
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" 
                        required
                      >
                        <option value="">اختر التصنيف</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">الوصف</label>
                    <Input 
                      value={formData.description} 
                      onChange={(e) => handleInputChange('description', e.target.value)} 
                      placeholder="وصف المنتج" 
                      required 
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">السعر (جنيه)</label>
                      <Input 
                        type="number" 
                        value={formData.price} 
                        onChange={(e) => handleInputChange('price', e.target.value)} 
                        placeholder="25" 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">الكمية</label>
                      <Input 
                        type="number" 
                        value={formData.stock} 
                        onChange={(e) => handleInputChange('stock', e.target.value)} 
                        placeholder="100" 
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <ImageUpload
                      onImagesChange={(urls) => handleInputChange('imageUrls', urls)}
                      existingImages={formData.imageUrls}
                      maxImages={5}
                    />
                  </div>
                  
                  <div className="flex gap-2 flex-wrap">
                    <Button type="submit">حفظ</Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleSaveDraft}
                      disabled={!formData.name && !formData.description && !formData.price && !formData.stock && !formData.categoryId}
                      className="gap-2"
                    >
                      <Save className="h-4 w-4" />حفظ كمسودة
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleClearInputs}
                      disabled={!formData.name && !formData.description && !formData.price && !formData.stock && !formData.categoryId && formData.imageUrls.length === 0}
                      className="gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />مسح الحقول
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleDiscardChanges}
                      disabled={!hasUnsavedChanges}
                    >
                      إلغاء
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Products List */}
          <div className="grid gap-4">
            {products.map((product) => {
              const category = categories.find(c => c._id === product.categoryId)
              return (
                <Card key={product._id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img 
                        src={product.imageUrls?.[0] || 'https://placehold.co/400x400/e2e8f0/475569?text=منتج'} 
                        alt={product.name} 
                        className="w-24 h-24 object-cover rounded-md" 
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {product.name}
                          <span className="text-sm font-normal text-muted-foreground mx-2">({product.productCode})</span>
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                        <div className="flex gap-4 text-sm">
                          <span>التصنيف: {category?.name}</span>
                          <span>السعر: {product.price} جنيه</span>
                          <span>الكمية: {product.stock}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEditProduct(product)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteProduct(product._id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </main>

      {/* Discard Confirmation Modal */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <AlertTriangle className="h-5 w-5" />
                تأكيد الإلغاء
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                لديك تغييرات غير محفوظة. هل تريد بالتأكيد تجاهل هذه التغييرات؟
              </p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={cancelDiscard}>
                  إلغاء
                </Button>
                <Button variant="destructive" onClick={confirmDiscard}>
                  تجاهل التغييرات
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
