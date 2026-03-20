import { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { 
  Calendar as CalendarIcon,
  Clock,
  Users,
  Plus,
  Settings,
  Share2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  Phone,
  Mail,
  MapPin,
  Copy,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  List as ListIcon,
  Grid,
  Edit,
  Trash2
} from 'lucide-react';
import { useViewTheme } from '../context/ViewThemeContext';

interface Appointment {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  date: string;
  time: string;
  duration: number;
  service: string;
  technician: string;
  status: 'pendiente' | 'confirmada' | 'completada' | 'cancelada';
  address?: string;
  notes?: string;
}

const mockAppointments: Appointment[] = [
  {
    id: '1',
    clientName: 'Carlos Mendoza',
    clientEmail: 'carlos@example.com',
    clientPhone: '+52 55 1234 5678',
    date: '2026-02-18',
    time: '10:00',
    duration: 60,
    service: 'Instalación de Fibra Óptica',
    technician: 'Pedro Sánchez',
    status: 'confirmada',
    address: 'Av. Insurgentes 123, CDMX',
    notes: 'Cliente solicita instalación en segundo piso'
  },
  {
    id: '2',
    clientName: 'María González',
    clientEmail: 'maria@example.com',
    clientPhone: '+52 55 9876 5432',
    date: '2026-02-18',
    time: '14:00',
    duration: 45,
    service: 'Soporte Técnico',
    technician: 'Luis Torres',
    status: 'pendiente',
    address: 'Calle Principal 456, Col. Centro',
    notes: 'Problema de velocidad lenta'
  },
  {
    id: '3',
    clientName: 'Roberto Díaz',
    clientEmail: 'roberto@example.com',
    clientPhone: '+52 55 5555 1234',
    date: '2026-02-19',
    time: '09:00',
    duration: 30,
    service: 'Cambio de Router',
    technician: 'Carlos Ramírez',
    status: 'confirmada',
    address: 'Paseo de la Reforma 789'
  },
  {
    id: '4',
    clientName: 'Ana López',
    clientEmail: 'ana@example.com',
    clientPhone: '+52 55 7777 8888',
    date: '2026-02-19',
    time: '11:30',
    duration: 60,
    service: 'Mantenimiento Preventivo',
    technician: 'Pedro Sánchez',
    status: 'confirmada',
    address: 'Col. Roma Norte, Calle 123'
  },
  {
    id: '5',
    clientName: 'Jorge Martínez',
    clientEmail: 'jorge@example.com',
    clientPhone: '+52 55 9999 0000',
    date: '2026-02-17',
    time: '15:00',
    duration: 45,
    service: 'Instalación de Fibra Óptica',
    technician: 'Luis Torres',
    status: 'completada',
    address: 'Av. Universidad 321'
  }
];

const statusColors = {
  pendiente: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  confirmada: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  completada: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  cancelada: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
};

const statusIcons = {
  pendiente: AlertCircle,
  confirmada: CheckCircle2,
  completada: CheckCheck,
  cancelada: XCircle
};

export default function SupportCalendar() {
  const { viewTheme } = useViewTheme();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const bookingLink = `${window.location.origin}/book-appointment/abc123xyz`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(bookingLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Función para obtener el inicio y fin de la semana
  const getWeekRange = (date: Date) => {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay()); // Domingo
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(start);
    end.setDate(start.getDate() + 6); // Sábado
    end.setHours(23, 59, 59, 999);
    
    return { start, end };
  };

  // Función para obtener el inicio y fin del mes
  const getMonthRange = (date: Date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);
    
    return { start, end };
  };

  // Función para obtener el rango del día
  const getDayRange = (date: Date) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    
    return { start, end };
  };

  // Filtrar citas basado en la vista seleccionada
  const getFilteredAppointments = () => {
    let range;
    
    switch (view) {
      case 'day':
        range = getDayRange(selectedDate);
        break;
      case 'week':
        range = getWeekRange(selectedDate);
        break;
      case 'month':
        range = getMonthRange(selectedDate);
        break;
      default:
        range = getWeekRange(selectedDate);
    }

    return mockAppointments.filter(apt => {
      const aptDate = new Date(apt.date);
      aptDate.setHours(0, 0, 0, 0);
      return aptDate >= range.start && aptDate <= range.end;
    }).sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA.getTime() - dateB.getTime();
    });
  };

  // Filtrar citas por fecha seleccionada
  const todayAppointments = mockAppointments.filter(apt => {
    const aptDate = new Date(apt.date);
    const today = new Date();
    return aptDate.toDateString() === today.toDateString();
  });

  const upcomingAppointments = getFilteredAppointments();

  // Función para obtener el título del rango actual
  const getRangeTitle = () => {
    switch (view) {
      case 'day':
        return selectedDate.toLocaleDateString('es-ES', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        });
      case 'week':
        const { start, end } = getWeekRange(selectedDate);
        return `${start.getDate()} - ${end.getDate()} de ${start.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`;
      case 'month':
        return selectedDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
      default:
        return '';
    }
  };

  // Funciones de navegación
  const goToPrevious = () => {
    const newDate = new Date(selectedDate);
    switch (view) {
      case 'day':
        newDate.setDate(selectedDate.getDate() - 1);
        break;
      case 'week':
        newDate.setDate(selectedDate.getDate() - 7);
        break;
      case 'month':
        newDate.setMonth(selectedDate.getMonth() - 1);
        break;
    }
    setSelectedDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(selectedDate);
    switch (view) {
      case 'day':
        newDate.setDate(selectedDate.getDate() + 1);
        break;
      case 'week':
        newDate.setDate(selectedDate.getDate() + 7);
        break;
      case 'month':
        newDate.setMonth(selectedDate.getMonth() + 1);
        break;
    }
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const stats = {
    total: mockAppointments.length,
    today: todayAppointments.length,
    pending: mockAppointments.filter(a => a.status === 'pendiente').length,
    confirmed: mockAppointments.filter(a => a.status === 'confirmada').length
  };

  return (
    <div className={`themed-view-shell themed-view-shell--${viewTheme} px-4 lg:px-6 pb-4 lg:pb-6 space-y-6`}>
      <div className="themed-view-shell__orb themed-view-shell__orb--one" />
      <div className="themed-view-shell__orb themed-view-shell__orb--two" />
      {/* Header */}
      <div className="pt-4 lg:pt-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calendario de Soportes</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Gestiona citas y reservas de servicio técnico
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowShareModal(true)}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Compartir Link
          </Button>
          <Link to="/support-calendar/settings">
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Configurar Horarios
            </Button>
          </Link>
          <Link to="/support-calendar/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Cita
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="themed-view-panel bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Citas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className="themed-view-panel bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Hoy</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.today}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        <div className="themed-view-panel bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pendientes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
        <div className="themed-view-panel bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Confirmadas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.confirmed}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="themed-view-panel lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Próximas Citas
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setView('day')}
                className={`px-3 py-1 text-sm rounded-md ${
                  view === 'day'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Día
              </button>
              <button
                onClick={() => setView('week')}
                className={`px-3 py-1 text-sm rounded-md ${
                  view === 'week'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Semana
              </button>
              <button
                onClick={() => setView('month')}
                className={`px-3 py-1 text-sm rounded-md ${
                  view === 'month'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Mes
              </button>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToPrevious}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
              <Button variant="outline" size="sm" onClick={goToNext}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Hoy
              </Button>
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
              {getRangeTitle()}
            </div>
          </div>

          {/* Appointments List */}
          <div className="space-y-3">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.slice(0, 8).map((appointment) => {
                const StatusIcon = statusIcons[appointment.status];
                return (
                  <div
                    key={appointment.id}
                    className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex flex-col items-center justify-center">
                        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                          {new Date(appointment.date).toLocaleDateString('es-ES', { month: 'short' }).toUpperCase()}
                        </span>
                        <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                          {new Date(appointment.date).getDate()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {appointment.service}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <User className="w-3 h-3 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {appointment.clientName}
                            </span>
                          </div>
                        </div>
                        <span className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${statusColors[appointment.status]}`}>
                          <StatusIcon className="w-3 h-3" />
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {appointment.time} ({appointment.duration} min)
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {appointment.technician}
                        </div>
                        {appointment.address && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {appointment.address}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-4">
                No hay citas programadas para este rango
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Citas de Hoy */}
          <div className="themed-view-panel bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Citas de Hoy
            </h3>
            {todayAppointments.length > 0 ? (
              <div className="space-y-3">
                {todayAppointments.map((apt) => (
                  <div key={apt.id} className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex-shrink-0">
                      <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {apt.time} - {apt.clientName}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {apt.service}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-4">
                No hay citas programadas para hoy
              </p>
            )}
          </div>

          {/* Técnicos Disponibles */}
          <div className="themed-view-panel bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Técnicos Disponibles
            </h3>
            <div className="space-y-3">
              {['Pedro Sánchez', 'Luis Torres', 'Carlos Ramírez'].map((tech) => (
                <div key={tech} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {tech}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      Disponible
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="themed-view-panel bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <CalendarIcon className="w-8 h-8" />
              <div>
                <p className="text-sm opacity-90">Esta Semana</p>
                <p className="text-2xl font-bold">12 Citas</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="opacity-90">Completadas</span>
                <span className="font-semibold">8</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-90">Pendientes</span>
                <span className="font-semibold">4</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Compartir Link de Reservas
              </h2>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Comparte este enlace con tus clientes para que puedan reservar citas de soporte directamente.
            </p>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={bookingLink}
                  readOnly
                  className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white outline-none"
                />
                <Button
                  size="sm"
                  onClick={handleCopyLink}
                  className="flex-shrink-0"
                >
                  {copied ? (
                    <>
                      <CheckCheck className="w-4 h-4 mr-1" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-sm text-blue-700 dark:text-blue-400">
                <strong>Nota:</strong> Los clientes podrán ver tu disponibilidad y reservar automáticamente según tu configuración de horarios.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
