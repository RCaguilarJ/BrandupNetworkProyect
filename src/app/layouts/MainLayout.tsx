import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router";
import {
  ArrowUpDown,
  Bell,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  Headset,
  Home,
  KeyRound,
  List,
  LogOut,
  MapPin,
  Menu,
  Network,
  Package,
  Search,
  Send,
  Settings,
  Ticket,
  TrendingUp,
  User,
  Users,
  Wallet,
  Wifi,
  X,
} from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { ViewThemeSelector } from "../components/ViewThemeSelector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { useAuth } from "../context/AuthContext";
import { useConfiguredLoginBackground } from "../lib/login-background";
import { toast } from "sonner";
import logo from "../../assets/logo_admin.png";

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
    path: "/dashboard",
    icon: <Home className="h-5 w-5" />,
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
    name: "Clientes",
    path: "/clients",
    icon: <Users className="h-5 w-5" />,
    roles: ["super_admin", "isp_admin", "cobranza", "soporte"],
    subItems: [
      {
        name: "Lista de Clientes",
        path: "/clients",
        icon: <List className="h-4 w-4" />,
        roles: ["super_admin", "isp_admin", "cobranza", "soporte"],
      },
      {
        name: "Mapa de Clientes",
        path: "/clients/map",
        icon: <MapPin className="h-4 w-4" />,
        roles: ["super_admin", "isp_admin", "cobranza", "soporte"],
      },
    ],
  },
  {
    name: "Planes y Servicios",
    path: "/plans",
    icon: <Package className="h-5 w-5" />,
    roles: ["super_admin", "isp_admin"],
  },
  {
    name: "Facturacion",
    path: "/billing",
    icon: <CreditCard className="h-5 w-5" />,
    roles: ["super_admin", "isp_admin", "cobranza"],
    subItems: [
      {
        name: "Lista de Facturas",
        path: "/billing/invoices",
        icon: <FileText className="h-4 w-4" />,
        roles: ["super_admin", "isp_admin", "cobranza"],
      },
      {
        name: "Facturacion electronica",
        path: "/billing/electronic-billing",
        icon: <FileText className="h-4 w-4" />,
        roles: ["super_admin", "isp_admin", "cobranza"],
      },
      {
        name: "Facturas Pendientes",
        path: "/billing/pending-invoices",
        icon: <Clock className="h-4 w-4" />,
        roles: ["super_admin", "isp_admin", "cobranza"],
      },
      {
        name: "Registrar Pago",
        path: "/billing/register-payment",
        icon: <CreditCard className="h-4 w-4" />,
        roles: ["super_admin", "isp_admin", "cobranza"],
      },
      {
        name: "Registrar pagos masivos",
        path: "/billing/register-bulk-payments",
        icon: <CreditCard className="h-4 w-4" />,
        roles: ["super_admin", "isp_admin", "cobranza"],
      },
      {
        name: "Transacciones",
        path: "/billing/transactions",
        icon: <ArrowUpDown className="h-4 w-4" />,
        roles: ["super_admin", "isp_admin", "cobranza"],
      },
      {
        name: "Cobranzas Realizadas",
        path: "/billing/completed-payments",
        icon: <CheckCircle className="h-4 w-4" />,
        roles: ["super_admin", "isp_admin", "cobranza"],
      },
      {
        name: "Estadisticas",
        path: "/billing/stats",
        icon: <TrendingUp className="h-4 w-4" />,
        roles: ["super_admin", "isp_admin", "cobranza"],
      },
      {
        name: "Otros Ingresos y Egresos",
        path: "/billing/other-income-expenses",
        icon: <ArrowUpDown className="h-4 w-4" />,
        roles: ["super_admin", "isp_admin", "cobranza"],
      },
    ],
  },
  {
    name: "Metodos de Pago",
    path: "/payment-methods",
    icon: <Wallet className="h-5 w-5" />,
    roles: ["super_admin", "isp_admin"],
  },
  {
    name: "Tareas",
    path: "/tasks",
    icon: <List className="h-5 w-5" />,
    roles: ["super_admin", "isp_admin", "soporte", "tecnico"],
  },
  {
    name: "Tickets",
    path: "/tickets",
    icon: <Ticket className="h-5 w-5" />,
    roles: ["super_admin", "isp_admin", "soporte", "cliente"],
    subItems: [
      {
        name: "Todos los Tickets",
        path: "/tickets",
        icon: <List className="h-4 w-4" />,
        roles: ["super_admin", "isp_admin", "soporte", "cliente"],
      },
      {
        name: "Tickets de Hoy",
        path: "/tickets/today",
        icon: <Clock className="h-4 w-4" />,
        roles: ["super_admin", "isp_admin", "soporte"],
      },
      {
        name: "Tickets en Proceso",
        path: "/tickets/in-progress",
        icon: <Clock className="h-4 w-4" />,
        roles: ["super_admin", "isp_admin", "soporte"],
      },
      {
        name: "Tickets Finalizados",
        path: "/tickets/completed",
        icon: <CheckCircle className="h-4 w-4" />,
        roles: ["super_admin", "isp_admin", "soporte"],
      },
    ],
  },
  {
    name: "Monitoreo de Red",
    path: "/monitoring",
    icon: <Network className="h-5 w-5" />,
    roles: ["super_admin", "isp_admin", "tecnico"],
  },
  {
    name: "Hotspot / Vouchers",
    path: "/hotspot",
    icon: <Wifi className="h-5 w-5" />,
    roles: ["super_admin", "isp_admin"],
  },
  {
    name: "Configuracion",
    path: "/settings",
    icon: <Settings className="h-5 w-5" />,
    roles: ["super_admin", "isp_admin"],
  },
];

function matchesPath(currentPath: string, itemPath: string) {
  if (itemPath === "/") {
    return currentPath === "/";
  }

  return (
    currentPath === itemPath ||
    currentPath.startsWith(`${itemPath}/`)
  );
}

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarBackgroundUrl = useConfiguredLoginBackground(
    user?.companyId,
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(
    [],
  );

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const userInitials = (user?.name || "Usuario")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

  const roleLabel =
    {
      super_admin: "ADMIN",
      isp_admin: "ADMIN",
      cobranza: "COBRANZA",
      soporte: "SOPORTE",
      tecnico: "TECNICO",
      cliente: "CLIENTE",
    }[user?.role ?? ""] ?? "USUARIO";

  const roleDescription =
    {
      super_admin: "Administrador",
      isp_admin: "Administrador",
      cobranza: "Cobranza",
      soporte: "Soporte",
      tecnico: "Tecnico",
      cliente: "Cliente",
    }[user?.role ?? ""] ?? "Usuario";

  const sidebarHeroStyle = sidebarBackgroundUrl
    ? {
        backgroundImage: `linear-gradient(rgba(19, 24, 29, 0.35), rgba(19, 24, 29, 0.78)), url(${sidebarBackgroundUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : undefined;

  const filteredNavigation = navigationItems.filter(
    (item) => user && item.roles.includes(user.role),
  );

  const toggleExpand = (path: string) => {
    setExpandedItems((prev) =>
      prev.includes(path)
        ? prev.filter((itemPath) => itemPath !== path)
        : [...prev, path],
    );
  };

  const renderNavItem = (
    item: NavItem,
    isMobile: boolean = false,
  ) => {
    const isActive =
      matchesPath(location.pathname, item.path) ||
      item.subItems?.some((subItem) =>
        matchesPath(location.pathname, subItem.path),
      );
    const isExpanded = expandedItems.includes(item.path);
    const hasSubItems =
      Boolean(item.subItems) && item.subItems.length > 0;

    if (hasSubItems) {
      return (
        <div key={item.path}>
          <button
            onClick={() => toggleExpand(item.path)}
            className={`group mb-1.5 flex w-full items-center justify-between gap-3 rounded-lg px-4 py-3 text-left text-sm transition-colors ${
              isActive
                ? "bg-[#22292f] text-white shadow-[inset_3px_0_0_#4f8fff]"
                : "text-slate-200 hover:bg-white/5 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`${
                  isActive
                    ? "text-[#4f8fff]"
                    : "text-slate-400 group-hover:text-slate-200"
                }`}
              >
                {item.icon}
              </span>
              <span>{item.name}</span>
            </div>

            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-slate-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-slate-500" />
            )}
          </button>

          {isExpanded && item.subItems && (
            <div className="mb-2 ml-5 space-y-1 border-l border-white/10 pl-3">
              {item.subItems.map((subItem) => {
                const subItemActive = matchesPath(
                  location.pathname,
                  subItem.path,
                );

                return (
                  <Link
                    key={subItem.path}
                    to={subItem.path}
                    onClick={
                      isMobile
                        ? () => setSidebarOpen(false)
                        : undefined
                    }
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                      subItemActive
                        ? "bg-white/8 text-white"
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                    }`}
                  >
                    <span className="text-slate-400">
                      {subItem.icon}
                    </span>
                    <span>{subItem.name}</span>
                  </Link>
                );
              })}
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
        className={`group mb-1.5 flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors ${
          isActive
            ? "bg-[#22292f] text-white shadow-[inset_3px_0_0_#4f8fff]"
            : "text-slate-200 hover:bg-white/5 hover:text-white"
        }`}
      >
        <span
          className={`${
            isActive
              ? "text-[#4f8fff]"
              : "text-slate-400 group-hover:text-slate-200"
          }`}
        >
          {item.icon}
        </span>
        <span>{item.name}</span>
      </Link>
    );
  };

  const renderSidebarContent = (isMobile: boolean = false) => (
    <div className="flex h-full flex-col bg-[#2d3338] text-slate-100">
      <div
        className="relative overflow-hidden border-b border-white/10"
        style={sidebarHeroStyle}
      >
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute right-3 top-3 z-10 rounded-full bg-black/25 p-2 text-white transition hover:bg-black/40"
            title="Cerrar menu"
            aria-label="Cerrar menu de navegacion"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        <div className="relative px-5 py-5">
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11 bg-[#8e4dd8] ring-2 ring-white/10">
              <AvatarFallback className="bg-[#8e4dd8] text-sm font-semibold text-white">
                {userInitials}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-white">
                {user?.name ?? "Usuario"}
              </p>
              <p className="text-sm text-slate-200/90">
                {roleDescription}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-white/8 px-5 py-3 text-xs uppercase tracking-[0.22em] text-slate-400">
        Menu
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3">
        {filteredNavigation.map((item) =>
          renderNavItem(item, isMobile),
        )}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#eef2f6] dark:bg-gray-900">
      <aside className="sidebar fixed inset-y-0 left-0 hidden w-64 border-r border-[#1f2529] pt-28 lg:block">
        {renderSidebarContent()}
      </aside>

      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="sidebar fixed inset-y-0 left-0 z-50 w-64 border-r border-[#1f2529] pt-28 lg:hidden">
            {renderSidebarContent(true)}
          </aside>
        </>
      )}

      <header className="fixed left-0 right-0 top-0 z-40 w-full border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur dark:border-gray-700 dark:bg-gray-900/95">
        <div className="flex h-28 items-center justify-between gap-5 px-4 md:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2.5 lg:hidden"
              title="Abrir menu"
              aria-label="Abrir menu de navegacion"
            >
              <Menu className="h-7 w-7" />
            </button>

            <img
              src={logo}
              alt="BRANDUP Network"
              className="h-24 w-auto object-contain md:h-28"
            />
          </div>

          <div className="flex flex-1 items-center justify-end gap-3 md:gap-4">
            <div className="relative hidden w-full max-w-xs md:block lg:max-w-sm">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="Buscar Cliente..."
                className="h-11 w-full rounded-full border border-gray-200 bg-gray-50 pl-12 pr-4 text-sm text-gray-700 outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-2 focus:ring-cyan-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:focus:border-cyan-500 dark:focus:bg-gray-900 dark:focus:ring-cyan-900/40"
              />
            </div>

            <div className="hidden items-center gap-2 sm:flex md:gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="h-11 w-11 rounded-full p-0 text-gray-600 hover:bg-gray-100 hover:text-cyan-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-cyan-400"
                title="Mensajes"
                aria-label="Mensajes"
              >
                <Send className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-11 w-11 rounded-full p-0 text-gray-600 hover:bg-gray-100 hover:text-cyan-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-cyan-400"
                title="Facturacion"
                aria-label="Facturacion"
              >
                <DollarSign className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="relative h-11 w-11 rounded-full p-0 text-gray-600 hover:bg-gray-100 hover:text-cyan-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-cyan-400"
                title="Notificaciones"
                aria-label="Notificaciones"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-11 w-11 rounded-full p-0 text-gray-600 hover:bg-gray-100 hover:text-cyan-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-cyan-400"
                title="Soporte"
                aria-label="Soporte"
              >
                <Headset className="h-5 w-5" />
              </Button>
              <ViewThemeSelector />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-3 rounded-full border border-transparent px-2 py-1.5 transition hover:border-gray-200 hover:bg-gray-50 dark:hover:border-gray-700 dark:hover:bg-gray-800"
                  aria-label="Abrir menu de usuario"
                >
                  <Avatar className="h-11 w-11 border border-cyan-100 bg-cyan-500 text-white">
                    <AvatarFallback className="bg-cyan-500 text-sm font-semibold tracking-wide text-white">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium text-gray-700 md:inline dark:text-gray-200">
                    {roleLabel}
                  </span>
                  <ChevronDown className="hidden h-5 w-5 text-gray-500 md:inline" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="mt-2 w-48 rounded-xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-700 dark:bg-gray-800"
              >
                <DropdownMenuItem
                  className="cursor-pointer rounded-lg px-3 py-2 text-[15px] text-gray-700 dark:text-gray-200"
                  onSelect={() => navigate("/settings")}
                >
                  <User className="h-4 w-4 text-gray-500" />
                  Mi cuenta
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer rounded-lg px-3 py-2 text-[15px] text-gray-700 dark:text-gray-200"
                  onSelect={() =>
                    toast.info(
                      "La vista para cambiar contrasena aun no esta definida.",
                    )
                  }
                >
                  <KeyRound className="h-4 w-4 text-gray-500" />
                  Cambiar contrasena
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer rounded-lg px-3 py-2 text-[15px] font-semibold text-gray-700 dark:text-gray-100"
                  onSelect={handleLogout}
                >
                  <LogOut className="h-4 w-4 text-gray-600" />
                  Cerrar sesion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex min-h-screen flex-col gap-0 pt-28 lg:pl-64">
        <main className="m-0 flex-1 p-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
