import React, { useState } from 'react'
import { supabase } from './supabaseClient'
import imageCompression from 'browser-image-compression'
import { X, Upload, Loader2, ImagePlus } from 'lucide-react'

export default function AdminModal({ isOpen, onClose, onProductAdded }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [uploading, setUploading] = useState(false)

  if (!isOpen) return null

  // Обработка выбора файлов
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    if (selectedFiles.length + files.length > 4) {
      alert('Можно загрузить не более 4 изображений')
      return
    }

    const newFiles = [...files, ...selectedFiles]
    setFiles(newFiles)

    // Создаем превью
    const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file))
    setPreviews((prev) => [...prev, ...newPreviews])
  }

  // Удаление выбранного фото из списка
  const removeImage = (index) => {
    setFiles(files.filter((_, i) => i !== index))
    setPreviews(previews.filter((_, i) => i !== index))
  }

  // Загрузка и создание товара
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title || !price || files.length === 0) {
      alert('Заполните название, цену и добавьте хотя бы 1 фото')
      return
    }

    try {
      setUploading(true)
      const uploadedImageUrls = []

      // 1. Сжимаем и загружаем каждое фото
      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Опции сжатия в WebP
        const options = {
          maxSizeMB: 0.3,
          maxWidthOrHeight: 1080,
          useWebWorker: true,
          fileType: 'image/webp',
        }

        const compressedFile = await imageCompression(file, options)
        const fileName = `product_${Date.now()}_${i}.webp`

        // Загрузка в Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, compressedFile)

        if (uploadError) throw uploadError

        // Получаем публичный URL
        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName)

        uploadedImageUrls.push(urlData.publicUrl)
      }

      // 2. Записываем товар в таблицу products
      const { error: dbError } = await supabase
        .from('products')
        .insert([
          {
            title,
            description,
            price: parseFloat(price),
            images: uploadedImageUrls,
          },
        ])

      if (dbError) throw dbError

      // Сброс формы и закрытие
      setTitle('')
      setDescription('')
      setPrice('')
      setFiles([])
      setPreviews([])
      onProductAdded()
      onClose()
    } catch (err) {
      console.error('Ошибка добавления товара:', err)
      alert('Не удалось добавить товар: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1F262E] border border-[#455A78]/50 w-full max-w-md rounded-2xl p-5 text-white shadow-2xl relative">
        {/* Шапка модалки */}
        <div className="flex items-center justify-between pb-3 border-b border-[#455A78]/40">
          <h2 className="font-bold text-lg">Добавить товар</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#98B0D3] hover:text-white hover:bg-[#455A78]/30 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#98B0D3] mb-1">
              Название товара *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Худи Click&Buy Oversize"
              className="w-full bg-[#455A78]/20 border border-[#455A78]/40 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#EAB87C]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#98B0D3] mb-1">
              Цена (₽) *
            </label>
            <input
              type="number"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="4990"
              className="w-full bg-[#455A78]/20 border border-[#455A78]/40 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#EAB87C]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#98B0D3] mb-1">
              Описание
            </label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Укажите размеры, состав или особенность товара..."
              className="w-full bg-[#455A78]/20 border border-[#455A78]/40 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#EAB87C] resize-none"
            />
          </div>

          {/* Загрузка фото */}
          <div>
            <label className="block text-xs font-medium text-[#98B0D3] mb-1">
              Фотографии (до 4 шт) *
            </label>

            <div className="grid grid-cols-4 gap-2 mt-2">
              {previews.map((src, index) => (
                <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-[#455A78]/50">
                  <img src={src} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {files.length < 4 && (
                <label className="aspect-square rounded-xl border border-dashed border-[#455A78] flex flex-col items-center justify-center cursor-pointer hover:border-[#EAB87C] transition bg-[#455A78]/10 text-[#98B0D3] hover:text-[#EAB87C]">
                  <ImagePlus className="w-5 h-5" />
                  <span className="text-[10px] mt-1">Добавить</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Кнопка отправки */}
          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-[#EAB87C] text-[#1F262E] font-bold py-3 rounded-xl hover:bg-[#8E583A] hover:text-white transition flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Сжимаем и сохраняем...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>Опубликовать товар</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}