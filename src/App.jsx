import React, { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { ShoppingBag, Loader2, Sparkles, Plus, Trash2, Edit3 } from 'lucide-react'
import AdminModal from './AdminModal'
import EditModal from './EditModal'
import ProductDetailModal from './ProductDetailModal'


const ADMIN_USERNAMES = [
  'lampa_damba', // Впиши юзернейм своего нового аккаунта (без @)
  '@kot_334618'       // Впиши юзернейм второго админа
]

export default function App() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  
  // Модальные окна
  const [isAdminOpen, setIsAdminOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [editingProduct, setEditingProduct] = useState(null)

  useEffect(() => {
    checkAdminAccess()
    fetchProducts()
  }, [])

  const checkAdminAccess = () => {
    const tg = window.Telegram?.WebApp
    const user = tg?.initDataUnsafe?.user
  
    // Переводим username в нижний регистр для защиты от случайных заглавных букв
    if (user?.username && ADMIN_USERNAMES.map(u => u.toLowerCase()).includes(user.username.toLowerCase())) {
      setIsAdmin(true)
    } else {
      setIsAdmin(false)
    }
  }

  async function fetchProducts() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (err) {
      console.error('Ошибка при загрузке товаров:', err.message)
    } finally {
      setLoading(false)
    }
  }

  // Функция удаления товара из БД и Storage
  const handleDeleteProduct = async (e, product) => {
    e.preventDefault()
    e.stopPropagation()

    if (!confirm(`Удалить товар "${product.title}"?`)) return

    try {
      if (product.images && product.images.length > 0) {
        try {
          const fileNames = product.images.map((url) => url.split('/').pop())
          await supabase.storage.from('product-images').remove(fileNames)
        } catch (storageErr) {
          console.warn('Ошибка при удалении из Storage:', storageErr)
        }
      }

      const { error } = await supabase.from('products').delete().eq('id', product.id)
      if (error) throw error

      setProducts((prev) => prev.filter((p) => p.id !== product.id))
      if (selectedProduct?.id === product.id) setSelectedProduct(null)
    } catch (err) {
      alert('Ошибка при удалении: ' + err.message)
    }
  }

  const handleEditClick = (e, product) => {
    e.preventDefault()
    e.stopPropagation()
    setEditingProduct(product)
  }

  return (
    <div className="min-h-screen bg-[#1F262E] text-slate-100 pb-10">
      {/* Шапка */}
      <header className="bg-[#1F262E]/90 backdrop-blur-md border-b border-[#455A78]/40 sticky top-0 z-10 px-4 py-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="bg-[#EAB87C] p-2 rounded-xl text-[#1F262E]">
            <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">
            Click<span className="text-[#EAB87C]">&</span>Buy
          </span>
        </div>

        {/* Плюс виден только админу */}
        {isAdmin && (
          <button
            type="button"
            onClick={() => setIsAdminOpen(true)}
            className="bg-[#455A78]/40 border border-[#455A78] text-[#EAB87C] hover:bg-[#EAB87C] hover:text-[#1F262E] p-2 rounded-xl transition-all"
            title="Добавить товар"
          >
            <Plus className="w-5 h-5" />
          </button>
        )}
      </header>

      {/* Каталог */}
      <main className="max-w-md mx-auto p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center pt-20 gap-3 text-[#98B0D3]">
            <Loader2 className="w-8 h-8 animate-spin text-[#EAB87C]" />
            <p className="text-sm font-medium">Загружаем витрину...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-[#455A78]/20 border border-[#455A78]/40 rounded-2xl p-6 backdrop-blur-sm">
            <div className="inline-flex p-3 bg-[#455A78]/30 rounded-full text-[#EAB87C] mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <p className="text-white font-semibold text-lg">Каталог пока пуст</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {products.map((item) => (
              <div 
                key={item.id} 
                onClick={() => setSelectedProduct(item)}
                className="bg-[#455A78]/20 border border-[#455A78]/40 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-[#98B0D3]/50 transition-all duration-200 cursor-pointer group relative"
              >
                {/* Админские кнопки видны только админу */}
                {isAdmin && (
                  <div className="absolute top-2 right-2 z-10 flex gap-1">
                    <button
                      type="button"
                      onClick={(e) => handleEditClick(e, item)}
                      className="p-1.5 bg-black/60 hover:bg-black text-white rounded-lg backdrop-blur-sm transition"
                      title="Редактировать"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteProduct(e, item)}
                      className="p-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-lg backdrop-blur-sm transition"
                      title="Удалить"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Фото */}
                <div className="aspect-square bg-[#1F262E] overflow-hidden relative">
                  {item.images && item.images[0] ? (
                    <img 
                      src={item.images[0]} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-[#98B0D3]">
                      Нет фото
                    </div>
                  )}
                </div>

                {/* Информация без кнопки Купить */}
                <div className="p-3 flex flex-col flex-1 justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-sm text-white line-clamp-1">{item.title}</h3>
                    {item.description && (
                      <p className="text-xs text-[#98B0D3] mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
                    )}
                  </div>
                  <div className="pt-2 border-t border-[#455A78]/30">
                    <span className="font-bold text-[#EAB87C] text-base leading-none block">
                      {Number(item.price).toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Модалки рендерятся только для админа */}
      {isAdmin && (
        <>
          <AdminModal
            isOpen={isAdminOpen}
            onClose={() => setIsAdminOpen(false)}
            onProductAdded={fetchProducts}
          />

          <EditModal
            isOpen={!!editingProduct}
            product={editingProduct}
            onClose={() => setEditingProduct(null)}
            onProductUpdated={fetchProducts}
          />
        </>
      )}

      <ProductDetailModal
        isOpen={!!selectedProduct}
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  )
}
