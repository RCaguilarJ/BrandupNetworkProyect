import { useState, useMemo, useEffect, useRef } from 'react';
import { Button } from '../components/ui/button';
import { 
  MapPin,
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Mail,
  Wifi,
  List,
  Map as MapIcon,
  ChevronRight,
  Settings
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useViewTheme } from '../context/ViewThemeContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/map.css';

// Fix para los iconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Crear iconos personalizados
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        border: 3px solid white;
        transform: rotate(-45deg);
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        <div style="
          transform: rotate(45deg);
          margin-top: 4px;
          margin-left: 7px;
        ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

interface ClientLocation {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  lat: number;
  lng: number;
  status: 'activo' | 'inactivo' | 'suspendido';
  plan: string;
  speed: string;
}

const mockClientLocations: ClientLocation[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    email: 'juan@example.com',
    phone: '+52 55 1234 5678',
    address: 'Av. Insurgentes Sur 1234, CDMX',
    lat: 19.4326,
    lng: -99.1332,
    status: 'activo',
    plan: 'Fibra 100 Mbps',
    speed: '100 Mbps'
  },
  {
    id: '2',
    name: 'María González',
    email: 'maria@example.com',
    phone: '+52 55 9876 5432',
    address: 'Polanco, Miguel Hidalgo, CDMX',
    lat: 19.4363,
    lng: -99.1910,
    status: 'activo',
    plan: 'Fibra 200 Mbps',
    speed: '200 Mbps'
  },
  {
    id: '3',
    name: 'Carlos Rodríguez',
    email: 'carlos@example.com',
    phone: '+52 55 5555 1234',
    address: 'Coyoacán, CDMX',
    lat: 19.3467,
    lng: -99.1618,
    status: 'activo',
    plan: 'Fibra 300 Mbps',
    speed: '300 Mbps'
  },
  {
    id: '4',
    name: 'Ana Martínez',
    email: 'ana@example.com',
    phone: '+52 55 7777 8888',
    address: 'Roma Norte, CDMX',
    lat: 19.4185,
    lng: -99.1635,
    status: 'suspendido',
    plan: 'Fibra 50 Mbps',
    speed: '50 Mbps'
  },
  {
    id: '5',
    name: 'Luis Hernández',
    email: 'luis@example.com',
    phone: '+52 55 9999 0000',
    address: 'Santa Fe, Álvaro Obregón, CDMX',
    lat: 19.3590,
    lng: -99.2610,
    status: 'activo',
    plan: 'Fibra 500 Mbps',
    speed: '500 Mbps'
  },
  {
    id: '6',
    name: 'Patricia López',
    email: 'patricia@example.com',
    phone: '+52 55 4444 3333',
    address: 'Condesa, Cuauhtémoc, CDMX',
    lat: 19.4104,
    lng: -99.1714,
    status: 'activo',
    plan: 'Fibra 100 Mbps',
    speed: '100 Mbps'
  },
  {
    id: '7',
    name: 'Roberto Díaz',
    email: 'roberto@example.com',
    phone: '+52 55 6666 7777',
    address: 'Narvarte, Benito Juárez, CDMX',
    lat: 19.3897,
    lng: -99.1560,
    status: 'inactivo',
    plan: 'Fibra 100 Mbps',
    speed: '100 Mbps'
  },
  {
    id: '8',
    name: 'Laura Sánchez',
    email: 'laura@example.com',
    phone: '+52 55 2222 1111',
    address: 'Del Valle, Benito Juárez, CDMX',
    lat: 19.3744,
    lng: -99.1635,
    status: 'activo',
    plan: 'Fibra 200 Mbps',
    speed: '200 Mbps'
  },
  {
    id: '9',
    name: 'Jorge Torres',
    email: 'jorge@example.com',
    phone: '+52 55 8888 9999',
    address: 'Tlalpan Centro, CDMX',
    lat: 19.2896,
    lng: -99.1677,
    status: 'activo',
    plan: 'Fibra 100 Mbps',
    speed: '100 Mbps'
  },
  {
    id: '10',
    name: 'Sofía Ramírez',
    email: 'sofia@example.com',
    phone: '+52 55 3333 4444',
    address: 'San Ángel, Álvaro Obregón, CDMX',
    lat: 19.3467,
    lng: -99.1897,
    status: 'activo',
    plan: 'Fibra 300 Mbps',
    speed: '300 Mbps'
  },
  {
    id: '11',
    name: 'Miguel Flores',
    email: 'miguel@example.com',
    phone: '+52 55 7777 6666',
    address: 'Lindavista, Gustavo A. Madero, CDMX',
    lat: 19.4889,
    lng: -99.1269,
    status: 'activo',
    plan: 'Fibra 100 Mbps',
    speed: '100 Mbps'
  },
  {
    id: '12',
    name: 'Carmen Ruiz',
    email: 'carmen@example.com',
    phone: '+52 55 5555 6666',
    address: 'Azcapotzalco Centro, CDMX',
    lat: 19.4906,
    lng: -99.1864,
    status: 'suspendido',
    plan: 'Fibra 50 Mbps',
    speed: '50 Mbps'
  }
];

const statusConfig = {
  activo: {
    color: '#10b981',
    label: 'Activo',
    icon: CheckCircle2
  },
  inactivo: {
    color: '#ef4444',
    label: 'Inactivo',
    icon: XCircle
  },
  suspendido: {
    color: '#f59e0b',
    label: 'Suspendido',
    icon: Clock
  }
};

export default function ClientsMap() {
  const { viewTheme } = useViewTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientLocation | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Filtrar clientes
  const filteredClients = useMemo(() => {
    return mockClientLocations.filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           client.address.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  // Calcular centro del mapa
  const mapCenter: [number, number] = [19.4326, -99.1332]; // CDMX

  const stats = {
    total: mockClientLocations.length,
    activos: mockClientLocations.filter(c => c.status === 'activo').length,
    inactivos: mockClientLocations.filter(c => c.status === 'inactivo').length,
    suspendidos: mockClientLocations.filter(c => c.status === 'suspendido').length
  };

  // Inicializar mapa
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Crear mapa
    const map = L.map(mapContainerRef.current).setView(mapCenter, 12);
    mapRef.current = map;

    // Agregar capa de tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Actualizar marcadores cuando cambian los clientes filtrados
  useEffect(() => {
    if (!mapRef.current) return;

    // Limpiar marcadores existentes
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Agregar nuevos marcadores
    filteredClients.forEach(client => {
      const marker = L.marker([client.lat, client.lng], {
        icon: createCustomIcon(statusConfig[client.status].color)
      });

      const popupContent = `
        <div class="popup-container">
          <h3 class="popup-title">${client.name}</h3>
          <div class="popup-info">
            <div class="popup-info-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>${client.address}</span>
            </div>
            <div class="popup-info-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <span>${client.phone}</span>
            </div>
            <div class="popup-info-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
              </svg>
              <span>${client.email}</span>
            </div>
            <div class="popup-info-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
                <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
                <line x1="12" y1="20" x2="12.01" y2="20"></line>
              </svg>
              <span>${client.plan}</span>
            </div>
            <div class="popup-footer">
              <span class="popup-status-badge" style="background: ${statusConfig[client.status].color}20; color: ${statusConfig[client.status].color};">
                ${statusConfig[client.status].label}
              </span>
              <button class="popup-button">Ver Detalles</button>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.addTo(mapRef.current!);
      markersRef.current.push(marker);
    });
  }, [filteredClients]);

  return (
    <div className={`themed-view-shell themed-view-shell--${viewTheme} px-4 lg:px-6 pb-4 lg:pb-6 space-y-6`}>
      <div className="themed-view-shell__orb themed-view-shell__orb--one" />
      <div className="themed-view-shell__orb themed-view-shell__orb--two" />
      {/* Header */}
      <div className="pt-4 lg:pt-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mapa de Clientes</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Visualiza la ubicación geográfica de tus clientes
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="themed-view-panel bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Clientes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className="themed-view-panel bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Activos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.activos}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        <div className="themed-view-panel bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Suspendidos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.suspendidos}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
        <div className="themed-view-panel bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Inactivos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.inactivos}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Search */}
          <div className="themed-view-panel bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar cliente..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>

            {/* Filters */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <span className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filtros
              </span>
            </button>

            {showFilters && (
              <div className="mt-3 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="all"
                    checked={statusFilter === 'all'}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Todos</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="activo"
                    checked={statusFilter === 'activo'}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Activos</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="suspendido"
                    checked={statusFilter === 'suspendido'}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Suspendidos</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="inactivo"
                    checked={statusFilter === 'inactivo'}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Inactivos</span>
                </label>
              </div>
            )}
          </div>

          {/* Client List */}
          <div className="themed-view-panel bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Clientes ({filteredClients.length})
            </h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filteredClients.map((client) => {
                const StatusIcon = statusConfig[client.status].icon;
                return (
                  <button
                    key={client.id}
                    onClick={() => {
                      setSelectedClient(client);
                      if (mapRef.current) {
                        mapRef.current.setView([client.lat, client.lng], 15);
                      }
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedClient?.id === client.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm text-gray-900 dark:text-white">
                        {client.name}
                      </p>
                      <StatusIcon 
                        className="w-4 h-4" 
                        style={{ color: statusConfig[client.status].color }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {client.address}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {client.plan}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="lg:col-span-3">
          <div className="themed-view-panel bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="h-[700px] relative">
              <div ref={mapContainerRef} className="w-full h-full" />

              {/* Legend */}
              <div className="absolute bottom-4 right-4 themed-view-panel bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 z-[1000]">
                <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">Leyenda</h4>
                <div className="space-y-1">
                  {Object.entries(statusConfig).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <Icon className="w-3 h-3" style={{ color: config.color }} />
                        <span className="text-xs text-gray-700 dark:text-gray-300">{config.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
