"use client"

import { Button } from "@/components/ui/button"
import { Home, Car, Wrench, BarChart3, Users } from "lucide-react"

interface NavigationProps {
  currentView: "home" | "vehicles" | "services" | "admin" | "clientes"
  onNavigate: (view: "home" | "vehicles" | "services" | "admin" | "clientes") => void
}

export function Navigation({ currentView, onNavigate }: NavigationProps) {
  return (
    <nav className="bg-white border-b border-primary/20">
      <div className="container mx-auto px-4">
        <div className="flex gap-2 overflow-x-auto py-2">
          <Button
            variant={currentView === "home" ? "default" : "ghost"}
            onClick={() => onNavigate("home")}
            className={
              currentView === "home" ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"
            }
          >
            <Home className="h-4 w-4 mr-2" />
            Inicio
          </Button>
          <Button
            variant={currentView === "clientes" ? "default" : "ghost"}
            onClick={() => onNavigate("clientes")}
            className={
              currentView === "clientes" ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"
            }
          >
            <Users className="h-4 w-4 mr-2" />
            Clientes
          </Button>
          <Button
            variant={currentView === "vehicles" ? "default" : "ghost"}
            onClick={() => onNavigate("vehicles")}
            className={
              currentView === "vehicles" ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"
            }
          >
            <Car className="h-4 w-4 mr-2" />
            Vehículos
          </Button>
          <Button
            variant={currentView === "services" ? "default" : "ghost"}
            onClick={() => onNavigate("services")}
            className={
              currentView === "services" ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"
            }
          >
            <Wrench className="h-4 w-4 mr-2" />
            Servicios
          </Button>
          <Button
            variant={currentView === "admin" ? "default" : "ghost"}
            onClick={() => onNavigate("admin")}
            className={
              currentView === "admin" ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"
            }
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Administración
          </Button>
        </div>
      </div>
    </nav>
  )
}
