import type { Language } from './preferences'

const es = {
  planner: 'Planificación automática', stats: 'Estadísticas', transfer: 'Transferir datos', close: 'Cerrar', cancel: 'Cancelar',
  plannerIntro: 'Elige tu horario disponible. Tempora repartirá las sesiones antes de la fecha límite, evitando los eventos existentes. Revisa la propuesta antes de guardarla.',
  count: 'Sesiones', duration: 'Minutos por sesión', from: 'Empezar a planificar desde', startHour: 'Hora inicial', endHour: 'Hora final', weekdays: 'Solo de lunes a viernes',
  generate: 'Generar propuesta', apply: 'Añadir sesiones al calendario', noSlots: 'No hay huecos con este horario antes de la fecha límite. Cambia el horario, la duración o la fecha del evento.',
  partial: 'Se han encontrado menos huecos de los solicitados. Puedes guardar esta propuesta parcial o cambiar las opciones.', stale: 'El calendario ha cambiado o estos huecos ya han pasado. Genera una propuesta nueva.',
  preview: 'Propuesta de sesiones', missingParent: 'Este evento ya no está disponible.',
  statsIntro: 'El tiempo programado proviene del calendario. El tiempo de concentración registra únicamente fases Pomodoro completadas desde esta versión; no se reconstruyen sesiones anteriores.',
  period: 'Periodo', days: 'días', planned: 'Minutos programados', focused: 'Minutos de Pomodoro completados', cycles: 'Pomodoros completados', completed: 'Eventos marcados como completados', activeDays: 'Días con Pomodoro', streak: 'Racha de días en el periodo',
  subjects: 'Tiempo programado por asignatura o área', daily: 'Concentración por día', empty: 'Todavía no hay datos en este periodo.', minutes: 'min',
  markDone: 'Marcar como completado', markUndone: 'Marcar como pendiente', done: 'Completado',
  transferIntro: 'Exporta un archivo de Tempora y ábrelo desde el otro dispositivo para importarlo. Es una transferencia manual: no hay nube ni sincronización automática. El archivo contiene tus eventos, preferencias e historial de concentración; guárdalo en un lugar privado.',
  export: 'Exportar archivo', chooseFile: 'Seleccionar archivo de Tempora', import: 'Importar y combinar', preferLocal: 'Conservar mi versión de los eventos en conflicto', preferFile: 'Usar la versión del archivo para los eventos en conflicto', preferences: 'Aplicar también las preferencias del archivo',
  importIntro: 'Los eventos nuevos se añaden y los idénticos no se duplican. Se conserva lo que solo existe en este dispositivo. Las eliminaciones y las marcas quitadas en el otro dispositivo no se propagan.',
  added: 'Eventos nuevos', conflicts: 'Eventos con cambios', identical: 'Eventos idénticos', imported: 'Datos combinados correctamente. Los cambios están disponibles en este dispositivo.', exported: 'Archivo preparado para descargar.',
  invalid: 'El archivo no es una copia válida de Tempora. No se ha modificado ningún dato.', size: 'El archivo supera el límite de 10 MB.', version: 'La versión del archivo no es compatible con esta aplicación.', relations: 'La combinación dejaría sesiones sin su evento o después de su fecha límite. Revisa las fechas o cambia la opción de conflictos.',
}
const en: typeof es = {
  planner: 'Automatic planning', stats: 'Statistics', transfer: 'Transfer data', close: 'Close', cancel: 'Cancel',
  plannerIntro: 'Choose your available hours. Tempora will spread sessions before the deadline, avoiding existing events. Review the proposal before saving it.',
  count: 'Sessions', duration: 'Minutes per session', from: 'Start planning from', startHour: 'Start time', endHour: 'End time', weekdays: 'Monday to Friday only',
  generate: 'Generate proposal', apply: 'Add sessions to calendar', noSlots: 'No slots fit this schedule before the deadline. Change the hours, duration or event date.',
  partial: 'Fewer slots were found than requested. You can save this partial proposal or change the options.', stale: 'The calendar has changed or these slots have passed. Generate a new proposal.',
  preview: 'Proposed sessions', missingParent: 'This event is no longer available.',
  statsIntro: 'Scheduled time comes from the calendar. Focus time records only Pomodoro phases completed since this version; previous sessions are not reconstructed.',
  period: 'Period', days: 'days', planned: 'Scheduled minutes', focused: 'Completed Pomodoro minutes', cycles: 'Completed Pomodoros', completed: 'Events marked complete', activeDays: 'Days with Pomodoros', streak: 'Day streak in this period',
  subjects: 'Scheduled time by subject or area', daily: 'Focus by day', empty: 'There is no data in this period yet.', minutes: 'min',
  markDone: 'Mark complete', markUndone: 'Mark pending', done: 'Completed',
  transferIntro: 'Export a Tempora file and open it on the other device to import it. This is a manual transfer: there is no cloud or automatic sync. The file contains your events, preferences and focus history; keep it private.',
  export: 'Export file', chooseFile: 'Select a Tempora file', import: 'Import and merge', preferLocal: 'Keep my version of conflicting events', preferFile: 'Use the file version of conflicting events', preferences: 'Also apply the preferences from the file',
  importIntro: 'New events are added and identical ones are not duplicated. Data found only on this device is retained. Deletions and removed completion marks from the other device are not propagated.',
  added: 'New events', conflicts: 'Changed events', identical: 'Identical events', imported: 'Data merged successfully. The changes are available on this device.', exported: 'File prepared for download.',
  invalid: 'This is not a valid Tempora backup. No data has been changed.', size: 'The file exceeds the 10 MB limit.', version: 'This file version is not compatible with the application.', relations: 'The merge would leave sessions without a parent event or after its deadline. Review the dates or change the conflict option.',
}
export const advancedText = (language: Language) => language === 'en' ? en : es
export const formatMetric = (language: Language, value: number) => new Intl.NumberFormat(language).format(value)
