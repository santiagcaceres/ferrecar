"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { storage, type Vehicle } from "@/lib/storage"
import { Car, User, Phone, Calendar, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface VehicleListProps {
  onSelectVehicle?: (vehicle: Vehicle) => void
  searchQuery?: string
}

export function VehicleList({ onSelectVehicle, searchQuery = "" }: VehicleListProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const { toast } = useToast()

  useEffect(() => {
    loadVehicles()
  }, [searchQuery])

  const loadVehicles = () => {
    if (searchQuery) {
      setVehicles(storage.searchVehicles(searchQuery))
    } else {
      setVehicles(storage.getVehicles())
    }
  }

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm("¿Está seguro de eliminar este vehículo?")) {
      storage.deleteVehicle(id)
      loadVehicles()
      toast({
        title: "Vehículo eliminado",
        description: "El vehículo ha sido eliminado correctamente",
      })
    }
  }

  if (vehicles.length === 0) {
    return (
      <Card className="bg-white border-primary/20">
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            {searchQuery ? "No se encontraron vehículos" : "No hay vehículos registrados"}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {vehicles.map((vehicle) => (
        <Card
          key={vehicle.id}
          className="bg-white border-primary/20 hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => onSelectVehicle?.(vehicle)}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-primary flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                {vehicle.matricula}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => handleDelete(vehicle.id, e)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-foreground">
              <Car className="h-4 w-4 text-primary" />
              <span className="font-medium">
                {vehicle.marca} {vehicle.modelo}
              </span>
            </div>
            <div className="flex items-center gap-2 text-foreground/80">
              <Calendar className="h-4 w-4 text-primary" />
              <span>{vehicle.año}</span>
            </div>
            <div className="flex items-center gap-2 text-foreground/80">
              <User className="h-4 w-4 text-primary" />
              <span>{vehicle.nombreDueño}</span>
            </div>
            <div className="flex items-center gap-2 text-foreground/80">
              <Phone className="h-4 w-4 text-primary" />
              <span>{vehicle.telefono}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
