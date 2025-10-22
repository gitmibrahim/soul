import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Package, FolderOpen, BarChart3, Users, Settings } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { SOULLogo } from '../components/SOULLogo'
import { ThemeToggle } from '../components/ThemeToggle'

export default function AdminDashboard() {
  const navigate = useNavigate()

  useEffect(() => {
    if (!localStorage.getItem('adminAuth')) navigate('/admin/login')
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('adminAuth')
    navigate('/')
  }

  return (
    <div className="w-full md:w-4/5 mx-auto min-h-screen bg-background">
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2">
            <Link to="/">
              <SOULLogo size="md" />
            </Link>
            <span className="hidden sm:inline text-sm text-muted-foreground">لوحة التحكم</span>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <ThemeToggle />
            <Button variant="ghost" onClick={() => navigate('/')} className="hidden sm:inline-flex">
              الموقع الرئيسي
            </Button>
            <Button 
              variant="outline" 
              onClick={handleLogout} 
              className="gap-2"
              title="تسجيل الخروج"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">تسجيل الخروج</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8 px-4 md:px-8">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">مرحباً بك في لوحة التحكم</h1>
            <p className="text-sm md:text-base text-muted-foreground">إدارة متجرك بسهولة وأمان</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/categories')}>
              <CardHeader className="text-center">
                <FolderOpen className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                <CardTitle>إدارة التصنيفات</CardTitle>
                <CardDescription>
                  إضافة وتعديل وحذف تصنيفات المنتجات
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button className="w-full">إدارة التصنيفات</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/products')}>
              <CardHeader className="text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <CardTitle>إدارة المنتجات</CardTitle>
                <CardDescription>
                  إضافة وتعديل وحذف منتجات المتجر
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button className="w-full">إدارة المنتجات</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/orders')}>
              <CardHeader className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                <CardTitle>إدارة الطلبات</CardTitle>
                <CardDescription>
                  عرض وإدارة طلبات العملاء
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button className="w-full">إدارة الطلبات</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-orange-600" />
                <CardTitle>إدارة العملاء</CardTitle>
                <CardDescription>
                  عرض وإدارة بيانات العملاء
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button className="w-full" disabled>قريباً</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <Settings className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                <CardTitle>الإعدادات</CardTitle>
                <CardDescription>
                  إعدادات المتجر والمظهر
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button className="w-full" disabled>قريباً</Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>اختر أحد الخيارات أعلاه للبدء في إدارة متجرك</p>
          </div>
        </div>
      </main>
    </div>
  )
}
