"use client"

import { useState, useEffect } from "react"
import { X, AlertTriangle, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PaymentReminder() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  useEffect(() => {
    // Mostrar el popup al cargar la página
    const timer = setTimeout(() => {
      setIsOpen(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    setIsMinimized(true)
  }

  const handleExpand = () => {
    setIsOpen(true)
    setIsMinimized(false)
  }

  return (
    <>
      {/* Modal Popup */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-amber-50 border-2 border-amber-400 rounded-lg shadow-xl max-w-md w-full animate-in fade-in zoom-in duration-300">
            <div className="bg-amber-400 px-4 py-3 rounded-t-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-amber-900" />
                <h2 className="text-lg font-bold text-amber-900">Aviso de Pago</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-8 w-8 text-amber-900 hover:bg-amber-500/50"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center space-y-3">
                <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto" />
                <h3 className="text-xl font-bold text-amber-900">Pago Retrasado</h3>
                <p className="text-amber-800 text-lg">
                  Le recordamos que tiene un <strong>pago pendiente</strong> que debe ser abonado este mes.
                </p>
                <p className="text-amber-700 text-sm">
                  Por favor, regularice su situación a la brevedad para evitar inconvenientes.
                </p>
              </div>
              <Button
                onClick={handleClose}
                className="w-full bg-amber-500 text-amber-950 hover:bg-amber-600 font-semibold"
              >
                Entendido
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Banner minimizado */}
      {isMinimized && !isOpen && (
        <div
          onClick={handleExpand}
          className="fixed bottom-4 right-4 z-40 bg-amber-400 text-amber-900 px-4 py-2 rounded-full shadow-lg cursor-pointer hover:bg-amber-500 transition-colors flex items-center gap-2 animate-in slide-in-from-bottom duration-300"
        >
          <AlertTriangle className="h-5 w-5" />
          <span className="font-semibold text-sm">Pago Pendiente</span>
          <ChevronUp className="h-4 w-4" />
        </div>
      )}
    </>
  )
}
