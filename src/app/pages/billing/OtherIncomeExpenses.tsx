import { useState, useMemo } from 'react';
import { Button } from '../../components/ui/button';
import { 
  Plus, 
  Download, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Edit, 
  DollarSign,
  List,
  ChevronLeft,
  ChevronRight,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useViewTheme } from '../../context/ViewThemeContext';
import { formatCurrency, formatDate } from '../../lib/utils';
import { CompactTable, CompactTableColumn, CompactTableToolbar, CompactTableFooter } from '../../components/CompactTable';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  date: string;
  reference?: string;
  provider?: string;
  operator?: string;
  router?: string;
}

const MOCK_TRANSACTIONS: Transaction[] = [
  // Vacío para mostrar "Ningún registro disponible" en Mikrosystem
];

export default function OtherIncomeExpenses() {
  const { user } = useAuth();
  const { viewTheme } = useViewTheme();
  const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expense'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(15);
  const [sortField, setSortField] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState('01/03/2026');
  const [endDate, setEndDate] = useState('31/03/2026');

  // Cálculos de estadísticas usando useMemo
  const { totalIncome, totalExpenses, netBalance, todayIncome, todayExpenses } = useMemo(() => {
    const today = new Date().toDateString();
    
    const income = MOCK_TRANSACTIONS
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = MOCK_TRANSACTIONS
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const incomeToday = MOCK_TRANSACTIONS
      .filter(t => t.type === 'income' && new Date(t.date).toDateString() === today)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expensesToday = MOCK_TRANSACTIONS
      .filter(t => t.type === 'expense' && new Date(t.date).toDateString() === today)
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      totalIncome: income,
      totalExpenses: expenses,
      netBalance: income - expenses,
      todayIncome: incomeToday,
      todayExpenses: expensesToday
    };
  }, []);

  const filteredTransactions = MOCK_TRANSACTIONS.filter(transaction => {
    const matchesTab = activeTab === 'all' || transaction.type === activeTab;
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (transaction.reference || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getTypeBadge = (type: string) => {
    const badges = {
      income: { text: 'Ingreso', class: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: TrendingUp },
      expense: { text: 'Egreso', class: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: TrendingDown },
    };
    const badge = badges[type as keyof typeof badges];
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded ${badge.class}`}>
        <Icon className="w-3 h-3" />
        {badge.text}
      </span>
    );
  };

  // Si es tema Mikrosystem, mostrar diseño de la imagen
  if (viewTheme === 'mikrosystem') {
    return (
      <div className="h-full bg-gray-50 dark:bg-gray-900">
        {/* Header azul brillante */}
        <div className="bg-blue-600 dark:bg-blue-700 px-6 py-4">
          <h1 className="text-xl font-bold text-white">Ingresos & Egresos</h1>
        </div>

        <div className="p-6 space-y-4">
          {/* 4 Tarjetas de métricas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total Ingresos Hoy */}
            <div className="bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-lg p-6 text-white shadow-lg">
              <div className="text-sm opacity-90 mb-2">TOTAL INGRESOS HOY</div>
              <div className="text-3xl font-bold">$ {todayIncome.toFixed(2)}</div>
            </div>

            {/* Total Ingresos */}
            <div className="bg-gradient-to-br from-teal-400 to-teal-500 rounded-lg p-6 text-white shadow-lg">
              <div className="text-sm opacity-90 mb-2">TOTAL INGRESOS</div>
              <div className="text-3xl font-bold">$ {totalIncome.toFixed(2)}</div>
            </div>

            {/* Total Egresos Hoy */}
            <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg p-6 text-white shadow-lg">
              <div className="text-sm opacity-90 mb-2">TOTAL EGRESOS HOY</div>
              <div className="text-3xl font-bold">$ {todayExpenses.toFixed(2)}</div>
            </div>

            {/* Total Egresos */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
              <div className="text-sm opacity-90 mb-2">TOTAL EGRESOS</div>
              <div className="text-3xl font-bold">$ {totalExpenses.toFixed(2)}</div>
            </div>
          </div>

          {/* Barra de herramientas */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Selector de registros */}
              <div className="flex items-center gap-2">
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="h-8 px-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-xs focus:ring-1 focus:ring-blue-500"
                >
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              {/* Botón Vista */}
              <button className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600">
                <List className="w-4 h-4" />
              </button>

              {/* Botón + Nuevo */}
              <Button size="sm" className="h-8 text-xs px-3 bg-blue-600 hover:bg-blue-700">
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Nuevo
              </Button>

              {/* Filtro */}
              <button className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 text-xs">
                <Filter className="w-3.5 h-3.5 inline mr-1" />
                
              </button>

              {/* Rango de fechas */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-8 w-24 px-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-xs focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-gray-500">al</span>
                <input
                  type="text"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-8 w-24 px-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-xs focus:ring-1 focus:ring-blue-500"
                />
                <button className="w-8 h-8 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">
                  <Calendar className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Búsqueda */}
              <div className="ml-auto">
                <input
                  type="text"
                  placeholder="Buscar"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-8 w-48 px-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-xs focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Tabla */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="text-left px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                      ID ▲
                    </th>
                    <th className="text-left px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                      REFERENCIA
                    </th>
                    <th className="text-left px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                      FECHA
                    </th>
                    <th className="text-right px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                      MONTO
                    </th>
                    <th className="text-left px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                      TIPO
                    </th>
                    <th className="text-left px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                      PROVEEDOR
                    </th>
                    <th className="text-left px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                      OPERADOR
                    </th>
                    <th className="text-left px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                      ROUTER
                    </th>
                    <th className="text-left px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-300">
                      DESCRIPCIÓN
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={9} className="px-3 py-12 text-center text-gray-500 dark:text-gray-400">
                      Ningún registro disponible
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
              <div>Mostrando 0 registros</div>
              <div className="flex items-center gap-2">
                <button
                  className="w-8 h-8 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                  disabled
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  className="w-8 h-8 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                  disabled
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si es tema WispHub, mostrar diseño original con CompactTable
  const columns: CompactTableColumn<Transaction>[] = [
    {
      key: 'reference',
      header: 'Referencia',
      sortable: true,
      width: '120px',
      render: (transaction) => (
        <span className="font-mono font-medium text-gray-900 dark:text-white">
          {transaction.reference || '-'}
        </span>
      ),
    },
    {
      key: 'description',
      header: 'Descripción',
      sortable: true,
      render: (transaction) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white leading-tight">
            {transaction.description}
          </div>
          <div className="text-gray-500 dark:text-gray-400 leading-tight mt-0.5">
            {transaction.category}
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Tipo',
      sortable: true,
      align: 'center',
      render: (transaction) => getTypeBadge(transaction.type),
    },
    {
      key: 'amount',
      header: 'Monto',
      sortable: true,
      align: 'right',
      render: (transaction) => (
        <span className={`font-medium ${
          transaction.type === 'income' 
            ? 'text-green-600 dark:text-green-400' 
            : 'text-red-600 dark:text-red-400'
        }`}>
          {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Fecha',
      sortable: true,
      render: (transaction) => (
        <span className="text-gray-600 dark:text-gray-400">{formatDate(transaction.date)}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'center',
      render: () => (
        <div className="flex items-center justify-center gap-1">
          <button 
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="Ver detalle"
          >
            <Eye className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
          </button>
          <button 
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="Editar"
          >
            <Edit className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      ),
    },
  ];

  const totalPages = Math.ceil(filteredTransactions.length / pageSize);

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900">
      {/* Barra de herramientas */}
      <CompactTableToolbar
        title="Otros Ingresos & Egresos"
        stats={[
          { 
            label: 'Ingresos', 
            value: formatCurrency(totalIncome),
            icon: <TrendingUp className="w-4 h-4" />,
            color: 'text-green-600 dark:text-green-400' 
          },
          { 
            label: 'Egresos', 
            value: formatCurrency(totalExpenses),
            icon: <TrendingDown className="w-4 h-4" />,
            color: 'text-red-600 dark:text-red-400' 
          },
          { 
            label: 'Balance Neto', 
            value: formatCurrency(netBalance),
            icon: <DollarSign className="w-4 h-4" />,
            color: netBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          },
          { 
            label: 'Transacciones', 
            value: MOCK_TRANSACTIONS.length
          },
        ]}
        actions={
          <>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs px-3"
            >
              <Filter className="w-3.5 h-3.5 mr-1.5" />
              Filtros
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs px-3"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Exportar
            </Button>
            <Button 
              size="sm" 
              className="h-8 text-xs px-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Nueva Transacción
            </Button>
          </>
        }
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar transacciones..."
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
      />

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-0">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-2 px-1 border-b-2 text-xs font-medium transition-colors ${
              activeTab === 'all'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Todas ({MOCK_TRANSACTIONS.length})
          </button>
          <button
            onClick={() => setActiveTab('income')}
            className={`pb-2 px-1 border-b-2 text-xs font-medium transition-colors ${
              activeTab === 'income'
                ? 'border-green-600 text-green-600 dark:border-green-400 dark:text-green-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Ingresos ({MOCK_TRANSACTIONS.filter(t => t.type === 'income').length})
          </button>
          <button
            onClick={() => setActiveTab('expense')}
            className={`pb-2 px-1 border-b-2 text-xs font-medium transition-colors ${
              activeTab === 'expense'
                ? 'border-red-600 text-red-600 dark:border-red-400 dark:text-red-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Egresos ({MOCK_TRANSACTIONS.filter(t => t.type === 'expense').length})
          </button>
        </nav>
      </div>

      {/* Tabla compacta */}
      <div className="bg-white dark:bg-gray-800 border-x border-b border-gray-200 dark:border-gray-700 m-0">
        <CompactTable
          columns={columns}
          data={filteredTransactions}
          keyExtractor={(transaction) => transaction.id}
          onSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
          pageSize={pageSize}
          emptyMessage="No hay transacciones registradas"
        />

        {/* Footer con paginación */}
        <CompactTableFooter
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalRecords={filteredTransactions.length}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
