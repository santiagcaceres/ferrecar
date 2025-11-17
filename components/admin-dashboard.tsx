"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabaseStorage } from "@/lib/supabase-storage"
import { getToday, getStartOfWeek, getStartOfMonth, formatCurrency } from "@/lib/date-utils"
import { DollarSign, Wrench, Car, TrendingUp, Calendar } from 'lucide-react'
import { ServicesList } from "./services-list"

type PeriodType = "day" | "week" | "month" | "custom"

export function AdminDashboard() {
  const [period, setPeriod] = useState<PeriodType>("day")
  const [stats, setStats] = useState({
    totalServices: 0,
    totalRevenue: 0,
    totalVehicles: 0,
    averageServiceCost: 0,
  })
  const [dateRange, setDateRange] = useState({ start: "", end: "" })
  const [customStartDate, setCustomStartDate] = useState("")
  const [customEndDate, setCustomEndDate] = useState("")
  const [specificDate, setSpecificDate] = useState("")

  useEffect(() => {
    calculateStats()
  }, [period])

  const calculateStats = async () => {
    const today = getToday()
    let startDate = today
    let endDate = today

    switch (period) {
      case "day":
        startDate = today
        endDate = today
        break
      case "week":
        startDate = getStartOfWeek()
        endDate = today
        break
      case "month":
        startDate = getStartOfMonth()
        endDate = today
        break
      case "custom":
        if (customStartDate && customEndDate) {
          startDate = customStartDate
          endDate = customEndDate
        }
        break
    }

    setDateRange({ start: startDate, end: endDate })

    try {
      const services = await supabaseStorage.getServicesByDateRange(startDate, endDate)
      const totalRevenue = services.reduce((sum, service) => sum + service.costo, 0)
      const uniqueVehicles = new Set(services.map((s) => s.vehicleId)).size

      setStats({
        totalServices: services.length,
        totalRevenue,
        totalVehicles: uniqueVehicles,
        averageServiceCost: services.length > 0 ? totalRevenue / services.length : 0,
      })
    } catch (error) {
      console.error("Error calculando estadísticas:", error)
    }
  }

  const searchBySpecificDate = () => {
    if (specificDate) {
      setCustomStartDate(specificDate)
      setCustomEndDate(specificDate)
      setPeriod("custom")
      setTimeout(calculateStats, 0)
    }
  }

  const applyCustomRange = () => {
    if (customStartDate && customEndDate) {
      setPeriod("custom")
      calculateStats()
    }
  }

  const getPeriodLabel = () => {
    switch (period) {
      case "day":
        return "Hoy"
      case "week":
        return "Esta Semana"
      case "month":
        return "Este Mes"
      case "custom":
        return "Período Personalizado"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-primary">Panel de Administración</h1>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={period === "day" ? "default" : "outline"}
            onClick={() => setPeriod("day")}
            className={period === "day" ? "bg-primary text-primary-foreground" : "border-primary/30 text-foreground"}
          >
            Día
          </Button>
          <Button
            variant={period === "week" ? "default" : "outline"}
            onClick={() => setPeriod("week")}
            className={period === "week" ? "bg-primary text-primary-foreground" : "border-primary/30 text-foreground"}
          >
            Semana
          </Button>
          <Button
            variant={period === "month" ? "default" : "outline"}
            onClick={() => setPeriod("month")}
            className={period === "month" ? "bg-primary text-primary-foreground" : "border-primary/30 text-foreground"}
          >
            Mes
          </Button>
        </div>
      </div>

      <Card className="bg-white border-primary/20">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filtros de Fecha
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="specific-date" className="text-foreground">
                Buscar por día específico
              </Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="specific-date"
                  type="date"
                  value={specificDate}
                  onChange={(e) => setSpecificDate(e.target.value)}
                  className="border-primary/30"
                  max={getToday()}
                />
                <Button onClick={searchBySpecificDate} className="bg-primary text-primary-foreground whitespace-nowrap">
                  Buscar
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t border-primary/20 pt-4">
            <Label className="text-foreground">Rango de fechas personalizado</Label>
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <div className="flex-1">
                <Label htmlFor="start-date" className="text-sm text-foreground/70">
                  Fecha inicio
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="border-primary/30 mt-1"
                  max={customEndDate || getToday()}
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="end-date" className="text-sm text-foreground/70">
                  Fecha fin
                </Label>
                <Input
                  id="end-date"
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="border-primary/30 mt-1"
                  min={customStartDate}
                  max={getToday()}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={applyCustomRange} className="bg-primary text-primary-foreground whitespace-nowrap">
                  Aplicar Rango
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Servicios Realizados</CardTitle>
            <Wrench className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalServices}</div>
            <p className="text-xs text-muted-foreground mt-1">{getPeriodLabel()}</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">{getPeriodLabel()}</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Vehículos Atendidos</CardTitle>
            <Car className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalVehicles}</div>
            <p className="text-xs text-muted-foreground mt-1">{getPeriodLabel()}</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Promedio por Servicio</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatCurrency(stats.averageServiceCost)}</div>
            <p className="text-xs text-muted-foreground mt-1">{getPeriodLabel()}</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-primary mb-4">Servicios del Período</h2>
        <ServicesList startDate={dateRange.start} endDate={dateRange.end} />
      </div>
    </div>
  )
}
