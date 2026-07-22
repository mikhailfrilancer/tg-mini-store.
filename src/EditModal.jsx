import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { X, Save, Loader2 } from 'lucide-react'

export default function EditModal({ isOpen, onClose, product, onProductUpdated }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (product) {
      setTitle(product.title || '')
      setDescription(product.description || '')
      setPrice(product.price || '')
    }
  }, [product])

  if (!isOpen || !product) return null

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const { error } = await supabase
        .from('products')
        .update({
          title,
          description,
          price: parseFloat(price),
        })
        .eq('id', product.id)

      if (error) throw error

      onProductUpdated()
      onClose()
    } catch (err) {
      alert('Ошибка при обновлении: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1F262E] border border-[#455A78]/50 w-full max-w-md rounded-2xl p-5 text-white shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-[#455A78]/40">
          <h2 className="font-bold text-lg">Редактировать товар</h2>
          <button onClick={onClose} className="p-1 text-[#98B0D3] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#98B0D3] mb-1">Название</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#455A78]/20 border border-[#455A78]/40 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#EAB87C]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#98B0D3] mb-1">Цена (₽)</label>
            <input
              type="number"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-[#455A78]/20 border border-[#455A78]/40 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#EAB87C]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#98B0D3] mb-1">Описание</label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#455A78]/20 border border-[#455A78]/40 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#EAB87C] resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#EAB87C] text-[#1F262E] font-bold py-3 rounded-xl hover:bg-[#8E583A] hover:text-white transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            <span>Сохранить изменения</span>
          </button>
        </form>
      </div>
    </div>
  )
}