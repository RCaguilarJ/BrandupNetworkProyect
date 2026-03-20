import {
  Link,
  Outlet,
  useNavigate,
  useLocation,
} from "react-router";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  Building2,
  Users,
  Package,
  CreditCard,
  Ticket,
  Wrench,
  Network,
  Wifi,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  Home,
  ShieldCheck,
  Zap,
  FileText,
  Sun,
  Moon,
  Clock,
  CheckCircle,
  TrendingUp,
  ArrowUpDown,
  Calendar,
  Wallet,
  MapPin,
  List,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { ViewThemeSelector } from "../components/ViewThemeSelector";
import logo from "../../assets/1fe9c15b53c884f010789ae03712f9a257bcab54.png";

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  roles: string[];
  subItems?: NavItem[];
}

const navigationItems: NavItem[] = [
  {
    name: "Dashboard",
    path: "/",
    icon: <Home className="w-5 h-5" />,
    roles: [
      "super_admin",
      "isp_admin",
      "cobranza",
      "soporte",
      "tecnico",
      "cliente",
    ],
  },
  {
    name: "Empresas",
    path: "/companies",
    icon: <Building2 className="w-5 h-5" />,
    roles: ["super_admin"],
  },
  {
    name: "Clientes",
    path: "/clients",
    icon: <Users className="w-5 h-5" />,
    roles: ["super_admin", "isp_admin", "cobranza", "soporte"],
    subItems: [
      {
        name: "Lista de Clientes",
        path: "/clients",
        icon: <List className="w-4 h-4" />,
        roles: [
          "super_admin",
          "isp_admin",
          "cobranza",
          "soporte",
        ],
      },
      {
        name: "Mapa de Clientes",
        path: "/clients/map",
        icon: <MapPin className="w-4 h-4" />,
        roles: [
          "super_admin",
          "isp_admin",
          "cobranza",
          "soporte",
        ],
      },
    ],
  },
  {
    name: "Planes y Servicios",
    path: "/plans",
    icon: <Package className="w-5 h-5" />,
    roles: ["super_admin", "isp_admin"],
  },
  {
    name: "Facturación",
    path: "/billing",
    icon: <CreditCard className="w-5 h-5" />,
    roles: ["super_admin", "isp_admin", "cobranza"],
    subItems: [
      {
        name: "Lista de Facturas",
        path: "/billing/invoices",
        icon: <FileText className="w-4 h-4" />,
        roles: ["super_admin", "isp_admin", "cobranza"],
      },
      {
        name: "Facturas Pendientes",
        path: "/billing/pending-invoices",
        icon: <Clock className="w-4 h-4" />,
        roles: ["super_admin", "isp_admin", "cobranza"],
      },
      {
        name: "Registrar Pago",
        path: "/billing/register-payment",
        icon: <CreditCard className="w-4 h-4" />,
        roles: ["super_admin", "isp_admin", "cobranza"],
      },
      {
        name: "Cobranzas Realizadas",
        path: "/billing/completed-payments",
        icon: <CheckCircle className="w-4 h-4" />,
        roles: ["super_admin", "isp_admin", "cobranza"],
      },
      {
        name: "Estadísticas",
        path: "/billing/stats",
        icon: <TrendingUp className="w-4 h-4" />,
        roles: ["super_admin", "isp_admin", "cobranza"],
      },
      {
        name: "Otros Ingresos & Egresos",
        path: "/billing/other-income-expenses",
        icon: <ArrowUpDown className="w-4 h-4" />,
        roles: ["super_admin", "isp_admin", "cobranza"],
      },
      {
        name: "Promesas",
        path: "/billing/promises",
        icon: <Calendar className="w-4 h-4" />,
        roles: ["super_admin", "isp_admin", "cobranza"],
      },
    ],
  },
  {
    name: "Métodos de Pago",
    path: "/payment-methods",
    icon: <Wallet className="w-5 h-5" />,
    roles: ["super_admin", "isp_admin"],
  },
  {
    name: "Tickets",
    path: "/tickets",
    icon: <Ticket className="w-5 h-5" />,
    roles: ["super_admin", "isp_admin", "soporte", "cliente"],
    subItems: [
      {
        name: "Todos los Tickets",
        path: "/tickets",
        icon: <List className="w-4 h-4" />,
        roles: [
          "super_admin",
          "isp_admin",
          "soporte",
          "cliente",
        ],
      },
      {
        name: "Tickets de Hoy",
        path: "/tickets/today",
        icon: <Clock className="w-4 h-4" />,
        roles: ["super_admin", "isp_admin", "soporte"],
      },
      {
        name: "Tickets Vencidos",
        path: "/tickets/overdue",
        icon: <Clock className="w-4 h-4" />,
        roles: ["super_admin", "isp_admin", "soporte"],
      },
      {
        name: "Tickets Finalizados",
        path: "/tickets/completed",
        icon: <CheckCircle className="w-4 h-4" />,
        roles: ["super_admin", "isp_admin", "soporte"],
      },
    ],
  },
  {
    name: "Calendario de Soporte",
    path: "/support-calendar",
    icon: <Calendar className="w-5 h-5" />,
    roles: ["super_admin", "isp_admin", "soporte", "tecnico"],
  },
  {
    name: "Órdenes de Servicio",
    path: "/service-orders",
    icon: <Wrench className="w-5 h-5" />,
    roles: ["super_admin", "isp_admin", "tecnico"],
  },
  {
    name: "Monitoreo de Red",
    path: "/monitoring",
    icon: <Network className="w-5 h-5" />,
    roles: ["super_admin", "isp_admin", "tecnico"],
  },
  {
    name: "Hotspot / Vouchers",
    path: "/hotspot",
    icon: <Wifi className="w-5 h-5" />,
    roles: ["super_admin", "isp_admin"],
  },
  {
    name: "RADIUS",
    path: "/radius",
    icon: <ShieldCheck className="w-5 h-5" />,
    roles: ["super_admin", "isp_admin"],
  },
  {
    name: "Cortes/Reactivaciones",
    path: "/suspensions",
    icon: <Zap className="w-5 h-5" />,
    roles: ["super_admin", "isp_admin", "cobranza"],
  },
  {
    name: "Reportes",
    path: "/reports",
    icon: <BarChart3 className="w-5 h-5" />,
    roles: ["super_admin", "isp_admin", "cobranza"],
  },
  {
    name: "Auditoría",
    path: "/audit",
    icon: <FileText className="w-5 h-5" />,
    roles: ["super_admin", "isp_admin"],
  },
  {
    name: "Configuración",
    path: "/settings",
    icon: <Settings className="w-5 h-5" />,
    roles: ["super_admin", "isp_admin"],
  },
];

export default function MainLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(
    [],
  );

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const filteredNavigation = navigationItems.filter(
    (item) => user && item.roles.includes(user.role),
  );

  const toggleExpand = (path: string) => {
    setExpandedItems((prev) =>
      prev.includes(path)
        ? prev.filter((p) => p !== path)
        : [...prev, path],
    );
  };

  const renderNavItem = (
    item: NavItem,
    isMobile: boolean = false,
  ) => {
    const isActive =
      location.pathname === item.path ||
      item.subItems?.some(
        (sub) => location.pathname === sub.path,
      );
    const isExpanded = expandedItems.includes(item.path);
    const hasSubItems =
      item.subItems && item.subItems.length > 0;

    if (hasSubItems) {
      return (
        <div key={item.path}>
          <button
            onClick={() => toggleExpand(item.path)}
            className={`flex items-center justify-between w-full gap-3 px-3 py-2 rounded-lg mb-1 transition-colors ${
              isActive
                ? "active bg-gray-100 dark:bg-gray-700"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span className="text-sm">{item.name}</span>
            </div>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          {isExpanded && (
            <div className="ml-4 mb-1">
              {item.subItems.map((subItem) => (
                <Link
                  key={subItem.path}
                  to={subItem.path}
                  onClick={
                    isMobile
                      ? () => setSidebarOpen(false)
                      : undefined
                  }
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-0.5 transition-colors ${
                    location.pathname === subItem.path
                      ? "active bg-gray-100 dark:bg-gray-700"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {subItem.icon}
                  <span className="text-sm">
                    {subItem.name}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={
          isMobile ? () => setSidebarOpen(false) : undefined
        }
        className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors ${
          isActive
            ? "active bg-gray-100 dark:bg-gray-700"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
      >
        {item.icon}
        <span className="text-sm">{item.name}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar Desktop - Sin logo */}
      <aside className="sidebar fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden lg:block pt-16">
        <div className="flex flex-col h-full">
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            {filteredNavigation.map((item) =>
              renderNavItem(item),
            )}
          </nav>
          <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                  {user?.role.replace("_", " ")}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2 justify-start text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </aside>

      {/* Sidebar Mobile */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="sidebar fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 lg:hidden pt-16">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-end px-6 py-4 absolute top-0 right-0">
                <button onClick={() => setSidebarOpen(false)}>
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              <nav className="flex-1 px-3 py-4 overflow-y-auto">
                {filteredNavigation.map((item) =>
                  renderNavItem(item, true),
                )}
              </nav>
              <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <img
                    src={user?.avatar}
                    alt={user?.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                      {user?.role.replace("_", " ")}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2 justify-start text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* Header - Fixed en la parte superior con logo */}
      <header className="fixed top-0 left-0 right-0 z-40 w-full border-b">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Logo en el header */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2"
            >
              <Menu className="w-6 h-6" />
            </button>
            <img
              src={logo}
              alt="BRANDUP Network"
              className="h-10 w-auto object-contain"
            />
          </div>
          
          {/* Botones de la derecha */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="relative"
              onClick={toggleTheme}
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>
            <ViewThemeSelector />
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <div className="lg:pl-64 pt-16 flex flex-col min-h-screen gap-0">
        {/* Contenido - Sin padding ni margin */}
        <main className="flex-1 p-0 m-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
