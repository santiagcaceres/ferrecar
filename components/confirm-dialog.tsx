"use client"

import { Button } from "@/components/ui/button"
import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      
      {/* Dialog */}
      <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4 border-2 border-primary">
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-primary">{title}</h2>
          </div>

          {/* Message */}
          <p className="text-foreground">{message}</p>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1 border-primary/30 text-foreground hover:bg-primary/5"
            >
              Cancelar
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              Eliminar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
