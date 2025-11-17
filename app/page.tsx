"use client"

import { useState } from "react"
import { AuthProvider } from "@/components/auth-provider"
import { Header } from "@/components/header"
import { Navigation } from "@/components/navigation"
import { SearchBar } from "@/components/search-bar"
import { VehicleForm } from "@/components/vehicle-form"
import { VehicleList } from "@/components/vehicle-list"
import { VehicleDetail } from "@/components/vehicle-detail"
import { ServiceForm } from "@/components/service-form"
import { ServicesList } from "@/components/services-list"
import { AdminDashboard } from "@/components/admin-dashboard"
import { ClienteForm } from "@/components/cliente-form"
import { ClientesList } from "@/components/clientes-list"
import { ClienteDetail } from "@/components/cliente-detail"
import { Button } from "@/components/ui/button"
import { Plus, Car, Wrench, BarChart3, Users } from "lucide-react"
import type { Vehicle, Cliente } from "@/lib/storage"

type View = "home" | "vehicles" | "services" | "admin" | "clientes"
type VehicleView = "list" | "form" | "detail"
type ServiceView = "list" | "form"
type ClienteView = "list" | "form" | "detail"

function AppContent() {
  const [currentView, setCurrentView] = useState<View>("home")
  const [vehicleView, setVehicleView] = useState<VehicleView>("list")
  const [serviceView, setServiceView] = useState<ServiceView>("list")
  const [clienteView, setClienteView] = useState<ClienteView>("list")
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const handleNavigate = (view: View) => {
    setCurrentView(view)
    setVehicleView("list")
    setServiceView("list")
    setClienteView("list")
    setSelectedVehicle(null)
    setSelectedCliente(null)
    setSearchQuery("")
  }

  const handleSelectVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setVehicleView("detail")
  }

  const handleSelectCliente = (cliente: Cliente) => {
    setSelectedCliente(cliente)
    setClienteView("detail")
  }

  const handleAddService = () => {
    setServiceView("form")
  }

  const handleServiceSuccess = () => {
    setServiceView("list")
    if (selectedVehicle) {
      setVehicleView("detail")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Navigation currentView={currentView} onNavigate={handleNavigate} />

      <main className="container mx-auto px-4 py-8">
        {currentView === "home" && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-primary">FerreCar Service</h1>
              <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
                Sistema integral de gestión de servicios vehiculares. Registre vehículos, administre servicios y
                consulte reportes de manera eficiente.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <Button
                onClick={() => setCurrentView("clientes")}
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-auto py-4 px-6 flex flex-col items-center gap-2 min-w-[160px]"
              >
                <Users className="h-8 w-8" />
                <span className="font-semibold">Clientes</span>
              </Button>

              <Button
                onClick={() => setCurrentView("vehicles")}
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-auto py-4 px-6 flex flex-col items-center gap-2 min-w-[160px]"
              >
                <Car className="h-8 w-8" />
                <span className="font-semibold">Vehículos</span>
              </Button>

              <Button
                onClick={() => setCurrentView("services")}
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-auto py-4 px-6 flex flex-col items-center gap-2 min-w-[160px]"
              >
                <Wrench className="h-8 w-8" />
                <span className="font-semibold">Servicios</span>
              </Button>

              <Button
                onClick={() => setCurrentView("admin")}
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-auto py-4 px-6 flex flex-col items-center gap-2 min-w-[160px]"
              >
                <BarChart3 className="h-8 w-8" />
                <span className="font-semibold">Administración</span>
              </Button>
            </div>
          </div>
        )}

        {currentView === "clientes" && (
          <div className="space-y-6">
            {clienteView === "list" && (
              <>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <h1 className="text-3xl font-bold text-primary">Clientes</h1>
                  <Button
                    onClick={() => setClienteView("form")}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Cliente
                  </Button>
                </div>

                <SearchBar onSearch={setSearchQuery} placeholder="Buscar por nombre, teléfono o cédula..." />

                <ClientesList onSelectCliente={handleSelectCliente} />
              </>
            )}

            {clienteView === "form" && (
              <>
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold text-primary">Nuevo Cliente</h1>
                </div>
                <ClienteForm onSuccess={() => setClienteView("list")} onCancel={() => setClienteView("list")} />
              </>
            )}

            {clienteView === "detail" && selectedCliente && (
              <ClienteDetail
                cliente={selectedCliente}
                onBack={() => {
                  setClienteView("list")
                  setSelectedCliente(null)
                }}
              />
            )}
          </div>
        )}

        {currentView === "vehicles" && (
          <div className="space-y-6">
            {vehicleView === "list" && (
              <>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <h1 className="text-3xl font-bold text-primary">Vehículos</h1>
                  <Button
                    onClick={() => setVehicleView("form")}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Vehículo
                  </Button>
                </div>

                <SearchBar onSearch={setSearchQuery} placeholder="Buscar por matrícula, dueño, marca o modelo..." />

                <VehicleList onSelectVehicle={handleSelectVehicle} searchQuery={searchQuery} />
              </>
            )}

            {vehicleView === "form" && (
              <>
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold text-primary">Nuevo Vehículo</h1>
                </div>
                <VehicleForm onSuccess={() => setVehicleView("list")} onCancel={() => setVehicleView("list")} />
              </>
            )}

            {vehicleView === "detail" && selectedVehicle && (
              <>
                {serviceView === "list" ? (
                  <VehicleDetail
                    vehicleId={selectedVehicle.id}
                    onBack={() => {
                      setVehicleView("list")
                      setSelectedVehicle(null)
                    }}
                    onAddService={handleAddService}
                  />
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <h1 className="text-3xl font-bold text-primary">Nuevo Servicio</h1>
                    </div>
                    <ServiceForm
                      vehicle={selectedVehicle}
                      onSuccess={handleServiceSuccess}
                      onCancel={() => setServiceView("list")}
                    />
                  </>
                )}
              </>
            )}
          </div>
        )}

        {currentView === "services" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h1 className="text-3xl font-bold text-primary">Todos los Servicios</h1>
              <Button
                onClick={() => setServiceView("form")}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Servicio
              </Button>
            </div>

            {serviceView === "list" ? (
              <ServicesList />
            ) : (
              <ServiceForm onSuccess={() => setServiceView("list")} onCancel={() => setServiceView("list")} />
            )}
          </div>
        )}

        {currentView === "admin" && <AdminDashboard />}
      </main>
    </div>
  )
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
