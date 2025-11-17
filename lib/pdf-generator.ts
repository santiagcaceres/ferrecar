import type { Servicio, Vehicle, Cliente } from "./storage"
import { TIPOS_ACEITE } from "./storage"
import { formatCurrency } from "./date-utils"

export async function generateInvoicePDF({
  service,
  vehicle,
  cliente,
}: { service: Servicio; vehicle: Vehicle; cliente: Cliente }): Promise<void> {
  const { jsPDF } = await import("jspdf")
  const doc = new jsPDF()

  // Colores de la marca
  const azulAncap = [21, 82, 127]
  const amarilloAncap = [253, 185, 19]

  // Header con logo y título
  doc.setFillColor(...azulAncap)
  doc.rect(0, 0, 210, 40, "F")

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(28)
  doc.setFont("helvetica", "bold")
  doc.text("FerreCar Service", 105, 20, { align: "center" })

  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  doc.text("Comprobante de Servicio", 105, 30, { align: "center" })

  // Información del cliente
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("DATOS DEL CLIENTE", 20, 55)

  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  doc.text(`Nombre: ${cliente.nombre}`, 20, 65)
  doc.text(`Teléfono: ${cliente.telefono}`, 20, 72)
  doc.text(`Email: ${cliente.email}`, 20, 79)

  // Información del vehículo
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.text("DATOS DEL VEHÍCULO", 20, 95)

  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  doc.text(`Matrícula: ${vehicle.matricula}`, 20, 105)
  doc.text(`Marca: ${vehicle.marca}`, 20, 112)
  doc.text(`Modelo: ${vehicle.modelo}`, 20, 119)
  doc.text(`Año: ${vehicle.año}`, 20, 126)

  // Información del servicio
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.text("DETALLE DEL SERVICIO", 20, 142)

  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  doc.text(`Fecha: ${new Date(service.fecha).toLocaleDateString("es-UY")}`, 20, 152)
  doc.text(`Kilometraje: ${service.kilometraje.toLocaleString()} km`, 20, 159)
  doc.text(`Mecánico: ${service.mecanico}`, 20, 166)

  // Servicios realizados
  doc.setFont("helvetica", "bold")
  doc.text("Servicios Realizados:", 20, 176)
  doc.setFont("helvetica", "normal")

  let yPos = 183
  service.servicios.forEach((serv) => {
    doc.text(`• ${serv}`, 25, yPos)
    yPos += 7
  })

  // Tipo de aceite si aplica
  if (service.tipoAceite) {
    const aceiteInfo = TIPOS_ACEITE[service.tipoAceite]
    doc.setFont("helvetica", "bold")
    doc.text(`Tipo de Aceite: ${aceiteInfo.label}`, 25, yPos)
    yPos += 7
  }

  // Próximo cambio de aceite
  if (service.proximoCambioKm) {
    yPos += 5
    doc.setFillColor(...amarilloAncap)
    doc.rect(18, yPos - 5, 174, 15, "F")
    doc.setTextColor(...azulAncap)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text(`⚠ Próximo cambio de aceite: ${service.proximoCambioKm.toLocaleString()} km`, 105, yPos + 4, {
      align: "center",
    })
    yPos += 20
  } else {
    yPos += 10
  }

  // Observaciones
  if (service.observaciones) {
    doc.setTextColor(0, 0, 0)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.text("Observaciones:", 20, yPos)
    doc.setFont("helvetica", "normal")
    const splitObservaciones = doc.splitTextToSize(service.observaciones, 170)
    doc.text(splitObservaciones, 20, yPos + 7)
    yPos += 7 + splitObservaciones.length * 7
  }

  // Total a pagar
  yPos += 10
  doc.setFillColor(...azulAncap)
  doc.rect(0, yPos, 210, 20, "F")

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text(`TOTAL: ${formatCurrency(service.costo)}`, 105, yPos + 12, { align: "center" })

  // Footer
  doc.setTextColor(100, 100, 100)
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text("Gracias por confiar en FerreCar Service", 105, 280, { align: "center" })
  doc.text("WhatsApp: 092 524 829 - contacto@ferrecar.com.uy", 105, 286, { align: "center" })

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  
  if (isMobile) {
    // En móviles, abrir en nueva pestaña ya que la descarga automática falla en muchos navegadores
    const pdfBlob = doc.output('blob')
    const pdfUrl = URL.createObjectURL(pdfBlob)
    window.open(pdfUrl, '_blank')
    
    // Limpiar el URL después de un tiempo para liberar memoria
    setTimeout(() => URL.revokeObjectURL(pdfUrl), 60000)
  } else {
    // En desktop, descargar directamente
    doc.save(`Factura-${vehicle.matricula}-${service.fecha}.pdf`)
  }
}
