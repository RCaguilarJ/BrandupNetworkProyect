import { useState } from 'react';
import { Button } from '../../components/ui/button';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { sanitizeLettersValue, sanitizeNumericValue } from '../../lib/input-sanitizers';

interface TimeSlot {
  time: string;
  available: boolean;
}

const services = [
  { id: '1', name: 'Instalación de Fibra Óptica', duration: 60 },
  { id: '2', name: 'Soporte Técnico', duration: 45 },
  { id: '3', name: 'Cambio de Router', duration: 30 },
  { id: '4', name: 'Mantenimiento Preventivo', duration: 60 },
  { id: '5', name: 'Revisión de Señal', duration: 30 }
];

const generateTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const hours = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', 
                 '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'];
  
  hours.forEach(time => {
    slots.push({
      time,
      available: Math.random() > 0.3 // Simular disponibilidad aleatoria
    });
  });
  
  return slots;
};

export default function BookAppointment() {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const timeSlots = generateTimeSlots();

  // Generar días del mes
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Días vacíos al inicio
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Días del mes
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const isDateDisabled = (date: Date) => {
    return date < today || date.getDay() === 0 || date.getDay() === 6; // Deshabilitar pasado y fines de semana
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            ¡Reserva Confirmada!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Hemos recibido tu solicitud de cita. Te enviaremos un correo de confirmación con todos los detalles.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Detalles de tu cita:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <User className="w-4 h-4" />
                <span>{formData.name}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <CalendarIcon className="w-4 h-4" />
                <span>{selectedDate?.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>{selectedTime}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <span className="font-medium">
                  {services.find(s => s.id === selectedService)?.name}
                </span>
              </div>
            </div>
          </div>
          <Button onClick={() => window.location.reload()} className="w-full">
            Hacer otra reserva
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl mb-4">
            <CalendarIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Reserva tu Cita de Soporte
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Selecciona el servicio, fecha y horario que mejor te convenga
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>
              1
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>
              2
            </div>
            <div className={`w-16 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>
              3
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8">
          {/* Step 1: Select Service */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Selecciona el tipo de servicio
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => setSelectedService(service.id)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedService === service.id
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-400'
                    }`}
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {service.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>{service.duration} minutos</span>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex justify-end mt-6">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!selectedService}
                >
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Select Date & Time */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Selecciona fecha y hora
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Calendar */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <button onClick={previousMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                      <div key={day} className="text-center text-xs font-medium text-gray-600 dark:text-gray-400 py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {days.map((day, index) => (
                      <button
                        key={index}
                        onClick={() => day && !isDateDisabled(day) && handleDateSelect(day)}
                        disabled={!day || isDateDisabled(day)}
                        className={`aspect-square flex items-center justify-center rounded-lg text-sm transition-all ${
                          !day
                            ? 'invisible'
                            : isDateDisabled(day)
                            ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                            : selectedDate?.toDateString() === day.toDateString()
                            ? 'bg-blue-600 text-white font-semibold'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                        }`}
                      >
                        {day?.getDate()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Slots */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Horarios disponibles
                  </h3>
                  {selectedDate ? (
                    <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot.time}
                          onClick={() => slot.available && setSelectedTime(slot.time)}
                          disabled={!slot.available}
                          className={`p-2 rounded-lg text-sm transition-all ${
                            !slot.available
                              ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                              : selectedTime === slot.time
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-200 dark:border-gray-700 hover:border-blue-400 text-gray-900 dark:text-white'
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-8">
                      Selecciona una fecha para ver los horarios disponibles
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Atrás
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!selectedDate || !selectedTime}
                >
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Contact Information */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Información de contacto
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre completo *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: sanitizeLettersValue(e.target.value) })
                      }
                      inputMode="text"
                      pattern="[A-Za-zÀ-ÿ\\s'-]+"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Juan Pérez"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="juan@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Teléfono *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: sanitizeNumericValue(e.target.value) })
                      }
                      inputMode="numeric"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="+52 55 1234 5678"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dirección *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Calle Principal #123, Col. Centro"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notas adicionales (opcional)
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Información adicional sobre tu solicitud..."
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" type="button" onClick={() => setStep(2)}>
                    Atrás
                  </Button>
                  <Button type="submit">
                    Confirmar Reserva
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
          <p>¿Necesitas ayuda? Contáctanos al +52 55 1234 5678</p>
        </div>
      </div>
    </div>
  );
}
