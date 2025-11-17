"use client"

import { Wrench, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  const handleLogout = () => {
    localStorage.removeItem("ancap_authenticated")
    window.location.reload()
  }

  return (
    <header className="bg-white border-b border-primary/20 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary rounded-lg p-2">
              <Wrench className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary">FerreCar Service</h1>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="border-primary/20 text-primary hover:bg-primary/10 bg-transparent"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </header>
  )
}
