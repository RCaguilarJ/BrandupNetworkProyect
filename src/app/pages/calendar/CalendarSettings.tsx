import { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '../../components/ui/button';
import { 
  ArrowLeft,
  Clock,
  Plus,
  Trash2,
  Save,
  Users,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

interface TimeSlot {
  start: string;
  end: string;
}

interface DaySchedule {
  enabled: boolean;
  slots: TimeSlot[];
}

interface WeekSchedule {
  [key: string]: DaySchedule;
}

const daysOfWeek = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' }
];

const initialSchedule: WeekSchedule = {
  monday: {
    enabled: true,
    slots: [
      { start: '09:00', end: '13:00' },
      { start: '14:00', end: '18:00' }
    ]
  },
  tuesday: {
    enabled: true,
    slots: [
      { start: '09:00', end: '13:00' },
      { start: '14:00', end: '18:00' }
    ]
  },
  wednesday: {
    enabled: true,
    slots: [
      { start: '09:00', end: '13:00' },
      { start: '14:00', end: '18:00' }
    ]
  },
  thursday: {
    enabled: true,
    slots: [
      { start: '09:00', end: '13:00' },
      { start: '14:00', end: '18:00' }
    ]
  },
  friday: {
    enabled: true,
    slots: [
      { start: '09:00', end: '13:00' },
      { start: '14:00', end: '17:00' }
    ]
  },
  saturday: {
    enabled: false,
    slots: []
  },
  sunday: {
    enabled: false,
    slots: []
  }
};

interface ServiceType {
  id: string;
  name: string;
  duration: number;
  color: string;
  enabled: boolean;
}

const initialServices: ServiceType[] = [
  { id: '1', name: 'Instalación de Fibra Óptica', duration: 60, color: 'blue', enabled: true },
  { id: '2', name: 'Soporte Técnico', duration: 45, color: 'green', enabled: true },
  { id: '3', name: 'Cambio de Router', duration: 30, color: 'purple', enabled: true },
  { id: '4', name: 'Mantenimiento Preventivo', duration: 60, color: 'orange', enabled: true },
  { id: '5', name: 'Revisión de Señal', duration: 30, color: 'yellow', enabled: true }
];

export default function CalendarSettings() {
  const [schedule, setSchedule] = useState<WeekSchedule>(initialSchedule);
  const [services, setServices] = useState<ServiceType[]>(initialServices);
  const [slotDuration, setSlotDuration] = useState(30);
  const [maxAdvanceDays, setMaxAdvanceDays] = useState(30);
  const [bufferTime, setBufferTime] = useState(15);
  const [saved, setSaved] = useState(false);

  const toggleDay = (day: string) => {
    setSchedule({
      ...schedule,
      [day]: {
        ...schedule[day],
        enabled: !schedule[day].enabled
      }
    });
  };

  const addTimeSlot = (day: string) => {
    const lastSlot = schedule[day].slots[schedule[day].slots.length - 1];
    const newStart = lastSlot ? lastSlot.end : '09:00';
    
    setSchedule({
      ...schedule,
      [day]: {
        ...schedule[day],
        slots: [
          ...schedule[day].slots,
          { start: newStart, end: '18:00' }
        ]
      }
    });
  };

  const removeTimeSlot = (day: string, index: number) => {
    setSchedule({
      ...schedule,
      [day]: {
        ...schedule[day],
        slots: schedule[day].slots.filter((_, i) => i !== index)
      }
    });
  };

  const updateTimeSlot = (day: string, index: number, field: 'start' | 'end', value: string) => {
    const newSlots = [...schedule[day].slots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    
    setSchedule({
      ...schedule,
      [day]: {
        ...schedule[day],
        slots: newSlots
      }
    });
  };

  const toggleService = (id: string) => {
    setServices(services.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const applyToAll = () => {
    const mondaySchedule = schedule.monday;
    const newSchedule: WeekSchedule = {};
    
    daysOfWeek.forEach(day => {
      if (day.key !== 'saturday' && day.key !== 'sunday') {
        newSchedule[day.key] = {
          enabled: mondaySchedule.enabled,
          slots: [...mondaySchedule.slots]
        };
      } else {
        newSchedule[day.key] = schedule[day.key];
      }
    });
    
    setSchedule(newSchedule);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/support-calendar">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Configuración de Horarios
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Define tu disponibilidad y tipos de servicio
            </p>
          </div>
        </div>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          {saved ? 'Guardado ✓' : 'Guardar Cambios'}
        </Button>
      </div>

      {saved && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            <p className="text-sm text-green-700 dark:text-green-400">
              Configuración guardada exitosamente. Los cambios se reflejarán en el calendario de reservas.
            </p>
          </div>
        </div>
      )}

      {/* General Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Configuración General
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Duración de intervalos (minutos)
            </label>
            <select
              value={slotDuration}
              onChange={(e) => setSlotDuration(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value={15}>15 minutos</option>
              <option value={30}>30 minutos</option>
              <option value={45}>45 minutos</option>
              <option value={60}>60 minutos</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Días de anticipación máxima
            </label>
            <input
              type="number"
              value={maxAdvanceDays}
              onChange={(e) => setMaxAdvanceDays(Number(e.target.value))}
              min="1"
              max="90"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tiempo de buffer entre citas (min)
            </label>
            <input
              type="number"
              value={bufferTime}
              onChange={(e) => setBufferTime(Number(e.target.value))}
              min="0"
              max="60"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Weekly Schedule */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Horarios Semanales
          </h2>
          <Button variant="outline" size="sm" onClick={applyToAll}>
            Aplicar Lunes a todos
          </Button>
        </div>

        <div className="space-y-4">
          {daysOfWeek.map((day) => (
            <div
              key={day.key}
              className={`border border-gray-200 dark:border-gray-700 rounded-lg p-4 ${
                schedule[day.key].enabled ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleDay(day.key)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      schedule[day.key].enabled
                        ? 'bg-blue-600'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        schedule[day.key].enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {day.label}
                  </span>
                </div>
                {schedule[day.key].enabled && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addTimeSlot(day.key)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Añadir horario
                  </Button>
                )}
              </div>

              {schedule[day.key].enabled && (
                <div className="space-y-2">
                  {schedule[day.key].slots.map((slot, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <input
                        type="time"
                        value={slot.start}
                        onChange={(e) => updateTimeSlot(day.key, index, 'start', e.target.value)}
                        className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      />
                      <span className="text-gray-400">a</span>
                      <input
                        type="time"
                        value={slot.end}
                        onChange={(e) => updateTimeSlot(day.key, index, 'end', e.target.value)}
                        className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      />
                      {schedule[day.key].slots.length > 1 && (
                        <button
                          onClick={() => removeTimeSlot(day.key, index)}
                          className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Service Types */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Tipos de Servicio
          </h2>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Servicio
          </Button>
        </div>

        <div className="space-y-3">
          {services.map((service) => (
            <div
              key={service.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleService(service.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    service.enabled
                      ? 'bg-blue-600'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      service.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <div className={`w-3 h-3 rounded-full bg-${service.color}-500`}></div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {service.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Duración: {service.duration} minutos
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  Editar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-1">
              Importante sobre la configuración
            </h3>
            <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
              <li>• Los cambios se aplican inmediatamente al calendario público</li>
              <li>• Los clientes solo verán horarios disponibles según tu configuración</li>
              <li>• El tiempo de buffer ayuda a evitar citas consecutivas sin descanso</li>
              <li>• Puedes deshabilitar días específicos en caso de feriados</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
