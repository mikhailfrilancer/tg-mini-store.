import React, { useState } from 'react'
import { X, ChevronLeft, ChevronRight, Send, MessageCircle } from 'lucide-react'

// Укажи здесь юзернейм продавца (без символа @)
const SELLER_TELEGRAM_USERNAME = 'mihail_fl' 

export default function ProductDetailModal({ isOpen, onClose, product }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  if (!isOpen || !product) return null

  const images = product.images && product.images.length > 0 ? product.images : []

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  // Ссылка на диалог в Telegram с предзаполненным текстом
  const handleContactSeller = () => {
    const text = encodeURIComponent(`Здравствуйте! Интересует товар: ${product.title} (${product.price} ₽)`)
    const tgUrl = `https://t.me/${SELLER_TELEGRAM_USERNAME}?text=${text}`
    
    // Если открыто внутри Telegram Mini App
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.openTelegramLink(tgUrl)
    } else {
      window.open(tgUrl, '_blank')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-[#1F262E] border border-[#455A78]/50 w-full max-w-md rounded-t-3xl sm:rounded-2xl max-h-[90vh] overflow-y-auto text-white shadow-2xl relative flex flex-col">
        
        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 bg-black/50 text-white p-2 rounded-full hover:bg-black transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Слайдер картинок */}
        <div className="relative aspect-square w-full bg-black/40 overflow-hidden flex-shrink-0">
          {images.length > 0 ? (
            <img
              src={images[currentImageIndex]}
              alt={product.title}
              className="w-full h-full object-cover transition-all duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#98B0D3]">
              Нет изображений
            </div>
          )}

          {/* Стрелки переключения слайдов */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/70 transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/70 transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Буллеты/Точки слайдера */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentImageIndex ? 'w-5 bg-[#EAB87C]' : 'w-2 bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Инфо и Кнопка */}
        <div className="p-5 flex flex-col justify-between flex-1 space-y-4">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-xl font-bold text-white">{product.title}</h2>
              <span className="text-xl font-bold text-[#EAB87C] whitespace-nowrap">{product.price} ₽</span>
            </div>
            <p className="text-sm text-[#98B0D3] mt-3 whitespace-pre-line leading-relaxed">
              {product.description || 'Описание отсутствует.'}
            </p>
          </div>

          {/* Кнопка написать продавцу */}
          <button
            onClick={handleContactSeller}
            className="w-full bg-[#EAB87C] text-[#1F262E] font-bold py-3.5 rounded-xl hover:bg-[#8E583A] hover:text-white transition flex items-center justify-center gap-2.5 text-base shadow-lg"
          >
            <MessageCircle className="w-5 h-5 stroke-[2.5]" />
            <span>Написать продавцу</span>
          </button>
        </div>
      </div>
    </div>
  )
}