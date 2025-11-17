import type { Servicio, Vehicle, Cliente } from "./storage"
import { TIPOS_ACEITE } from "./storage"
import { formatCurrency } from "./date-utils"

export function sendWhatsAppNotification(servicio: Servicio, vehicle: Vehicle, cliente: Cliente): void {
  // Construir mensaje
  let mensaje = `Hola ${cliente.nombre}! 👋\n\n`
  mensaje += `✅ *Servicio completado en FerreCar Service*\n\n`
  mensaje += `🚗 *Vehículo:* ${vehicle.marca} ${vehicle.modelo} (${vehicle.matricula})\n`
  mensaje += `📅 *Fecha:* ${new Date(servicio.fecha).toLocaleDateString("es-UY")}\n`
  mensaje += `🔧 *Kilometraje:* ${servicio.kilometraje.toLocaleString()} km\n\n`
  mensaje += `*Servicios realizados:*\n`
  servicio.servicios.forEach((serv) => {
    mensaje += `• ${serv}\n`
  })

  if (servicio.tipoAceite) {
    const aceiteInfo = TIPOS_ACEITE[servicio.tipoAceite]
    mensaje += `\n🛢 *Aceite:* ${aceiteInfo.label}\n`
  }

  if (servicio.proximoCambioKm) {
    mensaje += `\n⚠️ *Próximo cambio de aceite:* ${servicio.proximoCambioKm.toLocaleString()} km\n`
  }

  if (servicio.observaciones) {
    mensaje += `\n📝 *Observaciones:* ${servicio.observaciones}\n`
  }

  mensaje += `\n💰 *Total:* ${formatCurrency(servicio.costo)}\n`
  mensaje += `\n¡Gracias por confiar en nosotros! 🙏`

  // Limpiar el número de teléfono (eliminar espacios, guiones, etc)
  const phoneNumber = cliente.telefono.replace(/\D/g, "")

  // Abrir WhatsApp Web con el mensaje prellenado
  const whatsappUrl = `https://wa.me/598${phoneNumber}?text=${encodeURIComponent(mensaje)}`
  window.open(whatsappUrl, "_blank")
}

export function sendEmailNotification(servicio: Servicio, vehicle: Vehicle, cliente: Cliente): void {
  // Construir asunto y cuerpo del email
  const subject = `Servicio completado - ${vehicle.matricula} - FerreCar Service`

  let body = `Estimado/a ${cliente.nombre},\n\n`
  body += `Le informamos que el servicio de su vehículo ha sido completado exitosamente.\n\n`
  body += `DATOS DEL VEHÍCULO:\n`
  body += `Marca: ${vehicle.marca}\n`
  body += `Modelo: ${vehicle.modelo}\n`
  body += `Matrícula: ${vehicle.matricula}\n`
  body += `Año: ${vehicle.año}\n\n`
  body += `DETALLE DEL SERVICIO:\n`
  body += `Fecha: ${new Date(servicio.fecha).toLocaleDateString("es-UY")}\n`
  body += `Kilometraje: ${servicio.kilometraje.toLocaleString()} km\n`
  body += `Mecánico: ${servicio.mecanico}\n\n`
  body += `SERVICIOS REALIZADOS:\n`
  servicio.servicios.forEach((serv) => {
    body += `• ${serv}\n`
  })

  if (servicio.tipoAceite) {
    const aceiteInfo = TIPOS_ACEITE[servicio.tipoAceite]
    body += `\nTipo de Aceite: ${aceiteInfo.label}\n`
  }

  if (servicio.proximoCambioKm) {
    body += `\n⚠ IMPORTANTE: Próximo cambio de aceite recomendado a los ${servicio.proximoCambioKm.toLocaleString()} km\n`
  }

  if (servicio.observaciones) {
    body += `\nObservaciones: ${servicio.observaciones}\n`
  }

  body += `\nTOTAL: ${formatCurrency(servicio.costo)}\n`
  body += `\nGracias por confiar en FerreCar Service.\n`
  body += `Para cualquier consulta, no dude en contactarnos.\n\n`
  body += `Saludos cordiales,\n`
  body += `Equipo FerreCar Service`

  // Abrir cliente de email con el mensaje prellenado
  const mailtoUrl = `mailto:${cliente.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  window.location.href = mailtoUrl
}
