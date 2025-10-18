import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Package, FolderOpen, Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const mockCategories = [
  { _id: '1', name: 'أغطية جوالات', description: 'جميع أنواع أغطية الجوال' },
  { _id: '2', name: 'حماية شاشة', description: 'حماية الشاشة الزجاجية والعادية' },
  { _id: '3', name: 'شواحن', description: 'شواحن سريعة وعادية' },
  { _id: '4', name: 'سماعات', description: 'سماعات سلكية ولاسلكية' },
]

const mockProducts = [
  { _id: 'p1', name: 'غطاء سيليكون شفاف', description: 'غطاء سيليكون عالي الجودة شفاف لحماية الجوال', price: 25, categoryId: '1', imageUrl: 'https://placehold.co/400x400/e2e8f0/475569?text=غطاء+سيليكون', stock: 100 },
  { _id: 'p2', name: 'حماية شاشة زجاجية', description: 'حماية شاشة زجاجية مقاومة للكسر والخدش', price: 35, categoryId: '2', imageUrl: 'https://placehold.co/400x400/e2e8f0/475569?text=حماية+شاشة', stock: 150 },
]

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'categories' | 'products'>('categories')
  const [categories, setCategories] = useState(mockCategories)
  const [products, setProducts] = useState(mockProducts)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [showProductForm, setShowProductForm] = useState(false)
  const [categoryName, setCategoryName] = useState('')
  const [categoryDescription, setCategoryDescription] = useState('')
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [productName, setProductName] = useState('')
  const [productDescription, setProductDescription] = useState('')
  const [productPrice, setProductPrice] = useState('')
  const [productStock, setProductStock] = useState('')
  const [productCategoryId, setProductCategoryId] = useState('')
  const [productImageUrl, setProductImageUrl] = useState('')
  const [editingProductId, setEditingProductId] = useState<string | null>(null)

  useEffect(() => {
    if (!localStorage.getItem('adminAuth')) navigate('/admin/login')
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('adminAuth')
    navigate('/')
  }

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingCategoryId) {
      setCategories(categories.map(cat => cat._id === editingCategoryId ? { ...cat, name: categoryName, description: categoryDescription } : cat))
    } else {
      setCategories([{ _id: Date.now().toString(), name: categoryName, description: categoryDescription }, ...categories])
    }
    setCategoryName('')
    setCategoryDescription('')
    setEditingCategoryId(null)
    setShowCategoryForm(false)
  }

  const handleEditCategory = (category: any) => {
    setCategoryName(category.name)
    setCategoryDescription(category.description || '')
    setEditingCategoryId(category._id)
    setShowCategoryForm(true)
  }

  const handleDeleteCategory = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا التصنيف؟')) setCategories(categories.filter(cat => cat._id !== id))
  }

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault()
    const productData = { name: productName, description: productDescription, price: Number(productPrice), stock: Number(productStock), categoryId: productCategoryId, imageUrl: productImageUrl || 'https://placehold.co/400x400/e2e8f0/475569?text=منتج' }
    if (editingProductId) {
      setProducts(products.map(prod => prod._id === editingProductId ? { ...prod, ...productData } : prod))
    } else {
      setProducts([{ _id: Date.now().toString(), ...productData }, ...products])
    }
    setProductName('')
    setProductDescription('')
    setProductPrice('')
    setProductStock('')
    setProductCategoryId('')
    setProductImageUrl('')
    setEditingProductId(null)
    setShowProductForm(false)
  }

  const handleEditProduct = (product: any) => {
    setProductName(product.name)
    setProductDescription(product.description)
    setProductPrice(product.price.toString())
    setProductStock(product.stock.toString())
    setProductCategoryId(product.categoryId)
    setProductImageUrl(product.imageUrl || '')
    setEditingProductId(product._id)
    setShowProductForm(true)
  }

  const handleDeleteProduct = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) setProducts(products.filter(prod => prod._id !== id))
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="text-2xl font-bold">لوحة تحكم خطّاب</h1>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/')}>الموقع الرئيسي</Button>
            <Button variant="outline" onClick={handleLogout} className="gap-2"><LogOut className="h-4 w-4" />تسجيل الخروج</Button>
          </div>
        </div>
      </header>
      <main className="container py-8">
        <div className="flex gap-4 mb-8">
          <Button variant={activeTab === 'categories' ? 'default' : 'outline'} onClick={() => setActiveTab('categories')} className="gap-2"><FolderOpen className="h-4 w-4" />التصنيفات</Button>
          <Button variant={activeTab === 'products' ? 'default' : 'outline'} onClick={() => setActiveTab('products')} className="gap-2"><Package className="h-4 w-4" />المنتجات</Button>
        </div>
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">إدارة التصنيفات</h2>
              <Button onClick={() => setShowCategoryForm(true)} className="gap-2"><Plus className="h-4 w-4" />إضافة تصنيف</Button>
            </div>
            {showCategoryForm && (
              <Card>
                <CardHeader><CardTitle>{editingCategoryId ? 'تعديل التصنيف' : 'تصنيف جديد'}</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveCategory} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">اسم التصنيف</label>
                      <Input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="مثال: أغطية جوالات" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">الوصف</label>
                      <Input value={categoryDescription} onChange={(e) => setCategoryDescription(e.target.value)} placeholder="وصف التصنيف" />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit">حفظ</Button>
                      <Button type="button" variant="outline" onClick={() => { setCategoryName(''); setCategoryDescription(''); setEditingCategoryId(null); setShowCategoryForm(false) }}>إلغاء</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
            <div className="grid gap-4">
              {categories.map((category) => (
                <Card key={category._id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{category.name}</CardTitle>
                        <CardDescription>{category.description}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditCategory(category)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(category._id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">إدارة المنتجات</h2>
              <Button onClick={() => setShowProductForm(true)} className="gap-2"><Plus className="h-4 w-4" />إضافة منتج</Button>
            </div>
            {showProductForm && (
              <Card>
                <CardHeader><CardTitle>{editingProductId ? 'تعديل المنتج' : 'منتج جديد'}</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveProduct} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">اسم المنتج</label>
                        <Input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="مثال: غطاء سيليكون" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">التصنيف</label>
                        <select value={productCategoryId} onChange={(e) => setProductCategoryId(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" required>
                          <option value="">اختر التصنيف</option>
                          {categories.map((cat) => (<option key={cat._id} value={cat._id}>{cat.name}</option>))}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">الوصف</label>
                      <Input value={productDescription} onChange={(e) => setProductDescription(e.target.value)} placeholder="وصف المنتج" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">السعر (ر.س)</label>
                        <Input type="number" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} placeholder="25" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">الكمية</label>
                        <Input type="number" value={productStock} onChange={(e) => setProductStock(e.target.value)} placeholder="100" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">رابط الصورة</label>
                      <Input value={productImageUrl} onChange={(e) => setProductImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit">حفظ</Button>
                      <Button type="button" variant="outline" onClick={() => { setProductName(''); setProductDescription(''); setProductPrice(''); setProductStock(''); setProductCategoryId(''); setProductImageUrl(''); setEditingProductId(null); setShowProductForm(false) }}>إلغاء</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
            <div className="grid gap-4">
              {products.map((product) => {
                const category = categories.find(c => c._id === product.categoryId)
                return (
                  <Card key={product._id}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <img src={product.imageUrl} alt={product.name} className="w-24 h-24 object-cover rounded-md" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{product.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                          <div className="flex gap-4 text-sm">
                            <span>التصنيف: {category?.name}</span>
                            <span>السعر: {product.price} ر.س</span>
                            <span>الكمية: {product.stock}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditProduct(product)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product._id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
