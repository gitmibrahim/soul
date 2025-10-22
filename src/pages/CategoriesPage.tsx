import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, FolderOpen, Plus, Pencil, Trash2, Save, RotateCcw, AlertTriangle } from 'lucide-react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { SOULLogo } from '../components/SOULLogo'
import { ThemeToggle } from '../components/ThemeToggle'

interface CategoryFormData {
  name: string
  description: string
}

export default function CategoriesPage() {
  const navigate = useNavigate()
  const [showForm, setShowForm] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [formData, setFormData] = useState<CategoryFormData>({ name: '', description: '' })
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)
  const [draftData, setDraftData] = useState<CategoryFormData | null>(null)

  // Convex queries
  const categories = useQuery(api.categories.list) || []

  // Convex mutations
  const createCategory = useMutation(api.categories.create)
  const updateCategory = useMutation(api.categories.update)
  const deleteCategory = useMutation(api.categories.remove)

  useEffect(() => {
    if (!localStorage.getItem('adminAuth')) navigate('/admin/login')
  }, [navigate])

  // Load draft on component mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('categoryDraft')
    if (savedDraft) {
      const draft = JSON.parse(savedDraft)
      setDraftData(draft)
    }
  }, [])

  // Save draft to localStorage whenever form data changes
  useEffect(() => {
    if (formData.name || formData.description) {
      localStorage.setItem('categoryDraft', JSON.stringify(formData))
      setHasUnsavedChanges(true)
    } else {
      localStorage.removeItem('categoryDraft')
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

  const handleInputChange = (field: keyof CategoryFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSaveDraft = () => {
    setDraftData({ ...formData })
    localStorage.setItem('categoryDraft', JSON.stringify(formData))
    setHasUnsavedChanges(false)
  }

  const handleRestoreDraft = () => {
    if (draftData) {
      setFormData(draftData)
      setHasUnsavedChanges(true)
    }
  }

  const handleClearInputs = () => {
    setFormData({ name: '', description: '' })
    setDraftData(null)
    localStorage.removeItem('categoryDraft')
    setHasUnsavedChanges(false)
  }

  const handleDiscardChanges = () => {
    setShowDiscardConfirm(true)
  }

  const confirmDiscard = () => {
    setFormData({ name: '', description: '' })
    setDraftData(null)
    localStorage.removeItem('categoryDraft')
    setHasUnsavedChanges(false)
    setEditingCategoryId(null)
    setShowForm(false)
    setShowDiscardConfirm(false)
  }

  const cancelDiscard = () => {
    setShowDiscardConfirm(false)
  }

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingCategoryId) {
        await updateCategory({
          id: editingCategoryId as Id<'categories'>,
          name: formData.name,
          description: formData.description
        })
      } else {
        await createCategory({
          name: formData.name,
          description: formData.description
        })
      }
      
      handleClearInputs()
      setEditingCategoryId(null)
      setShowForm(false)
    } catch (error) {
      console.error('Error saving category:', error)
    }
  }

  const handleEditCategory = (category: any) => {
    setFormData({ name: category.name, description: category.description || '' })
    setEditingCategoryId(category._id)
    setShowForm(true)
  }

  const handleDeleteCategory = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا التصنيف؟')) {
      try {
        await deleteCategory({ id: id as Id<'categories'> })
      } catch (error) {
        console.error('Error deleting category:', error)
      }
    }
  }

  const handleAddNew = () => {
    if (hasUnsavedChanges) {
      handleDiscardChanges()
    } else {
      setFormData({ name: '', description: '' })
      setEditingCategoryId(null)
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
            <span className="text-sm text-muted-foreground">إدارة التصنيفات</span>
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
              <FolderOpen className="h-6 w-6" />
              إدارة التصنيفات
            </h1>
            <Button onClick={handleAddNew} className="gap-2">
              <Plus className="h-4 w-4" />إضافة تصنيف
            </Button>
          </div>

          {/* Draft restoration notification */}
          {draftData && !showForm && (
            <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <span className="text-sm">لديك مسودة محفوظة للتصنيف</span>
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
                  {editingCategoryId ? 'تعديل التصنيف' : 'تصنيف جديد'}
                  {hasUnsavedChanges && (
                    <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                      تغييرات غير محفوظة
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveCategory} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">اسم التصنيف</label>
                    <Input 
                      value={formData.name} 
                      onChange={(e) => handleInputChange('name', e.target.value)} 
                      placeholder="مثال: جرابات" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">الوصف</label>
                    <Input 
                      value={formData.description} 
                      onChange={(e) => handleInputChange('description', e.target.value)} 
                      placeholder="وصف التصنيف" 
                    />
                  </div>
                  
                  <div className="flex gap-2 flex-wrap">
                    <Button type="submit">حفظ</Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleSaveDraft}
                      disabled={!formData.name && !formData.description}
                      className="gap-2"
                    >
                      <Save className="h-4 w-4" />حفظ كمسودة
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleClearInputs}
                      disabled={!formData.name && !formData.description}
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

          {/* Categories List */}
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
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEditCategory(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteCategory(category._id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
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
