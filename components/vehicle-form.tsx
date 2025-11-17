"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { storage, type Vehicle, type Cliente } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface VehicleFormProps {
  onSuccess?: (vehicle: Vehicle) => void
  onCancel?: () => void
}

export function VehicleForm({ onSuccess, onCancel }: VehicleFormProps) {
  const { toast } = useToast()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [open, setOpen] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)

  const [formData, setFormData] = useState({
    matricula: "",
    marca: "",
    modelo: "",
    año: new Date().getFullYear(),
  })

  useEffect(() => {
    setClientes(storage.getClientes())
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCliente) {
      toast({
        title: "Error",
        description: "Debe seleccionar un cliente",
        variant: "destructive",
      })
      return
    }

    try {
      const vehicle = storage.saveVehicle({
        ...formData,
        clienteId: selectedCliente.id,
        nombreDueño: selectedCliente.nombre,
        telefono: selectedCliente.telefono,
        email: selectedCliente.email,
      })

      toast({
        title: "Vehículo registrado",
        description: `${vehicle.marca} ${vehicle.modelo} - ${vehicle.matricula}`,
      })

      setFormData({
        matricula: "",
        marca: "",
        modelo: "",
        año: new Date().getFullYear(),
      })
      setSelectedCliente(null)

      onSuccess?.(vehicle)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo registrar el vehículo",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="bg-white border-primary/20">
      <CardHeader>
        <CardTitle className="text-primary">Registrar Vehículo</CardTitle>
        <CardDescription className="text-foreground/70">Ingrese los datos del vehículo</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="cliente" className="text-foreground">
                Cliente (Dueño) *
              </Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between bg-white border-primary/30 text-foreground"
                  >
                    {selectedCliente ? (
                      <span>
                        {selectedCliente.nombre} - {selectedCliente.telefono}
                      </span>
                    ) : (
                      <span className="text-foreground/50">Seleccionar cliente...</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar por nombre, teléfono o cédula..." className="text-foreground" />
                    <CommandList>
                      <CommandEmpty className="text-foreground/60 p-4 text-sm">No se encontraron clientes</CommandEmpty>
                      <CommandGroup>
                        {clientes.map((cliente) => (
                          <CommandItem
                            key={cliente.id}
                            value={`${cliente.nombre} ${cliente.telefono} ${cliente.cedula || ""}`}
                            onSelect={() => {
                              setSelectedCliente(cliente)
                              setOpen(false)
                            }}
                            className="cursor-pointer"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedCliente?.id === cliente.id ? "opacity-100" : "opacity-0",
                              )}
                            />
                            <div className="flex flex-col">
                              <span className="font-medium">{cliente.nombre}</span>
                              <span className="text-sm text-foreground/60">
                                {cliente.telefono} {cliente.cedula && `• CI: ${cliente.cedula}`}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="matricula" className="text-foreground">
                Matrícula *
              </Label>
              <Input
                id="matricula"
                value={formData.matricula}
                onChange={(e) => setFormData({ ...formData, matricula: e.target.value.toUpperCase() })}
                placeholder="ABC1234"
                required
                className="bg-white border-primary/30 text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="marca" className="text-foreground">
                Marca *
              </Label>
              <Input
                id="marca"
                value={formData.marca}
                onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                placeholder="Toyota"
                required
                className="bg-white border-primary/30 text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="modelo" className="text-foreground">
                Modelo *
              </Label>
              <Input
                id="modelo"
                value={formData.modelo}
                onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                placeholder="Corolla"
                required
                className="bg-white border-primary/30 text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="año" className="text-foreground">
                Año *
              </Label>
              <Input
                id="año"
                type="number"
                value={formData.año}
                onChange={(e) => setFormData({ ...formData, año: Number.parseInt(e.target.value) })}
                min="1900"
                max={new Date().getFullYear() + 1}
                required
                className="bg-white border-primary/30 text-foreground"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="border-primary/30 text-foreground bg-transparent"
              >
                Cancelar
              </Button>
            )}
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Registrar Vehículo
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
