import { useMemo, useState } from 'react';
import { Button } from '../../components/ui/button';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit,
  Eye,
  Filter,
  List,
  Plus,
  Save,
  TrendingDown,
  TrendingUp,
  DollarSign,
} from 'lucide-react';
import { useViewTheme } from '../../context/ViewThemeContext';
import { formatCurrency, formatDate } from '../../lib/utils';
import {
  CompactTable,
  CompactTableColumn,
  CompactTableFooter,
  CompactTableToolbar,
} from '../../components/CompactTable';

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

const MOCK_TRANSACTIONS: Transaction[] = [];

function MxAmount({ value }: { value: number }) {
  return <>{`MX$ ${value.toFixed(2)}`}</>;
}

export default function OtherIncomeExpenses() {
  const { viewTheme } = useViewTheme();
  const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expense'>(
    'all',
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(15);
  const [sortField, setSortField] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState('01/03/2026');
  const [endDate, setEndDate] = useState('31/03/2026');

  const { totalIncome, totalExpenses, netBalance, todayIncome, todayExpenses } =
    useMemo(() => {
      const today = new Date().toDateString();

      const income = MOCK_TRANSACTIONS.filter(
        (transaction) => transaction.type === 'income',
      ).reduce((sum, transaction) => sum + transaction.amount, 0);

      const expenses = MOCK_TRANSACTIONS.filter(
        (transaction) => transaction.type === 'expense',
      ).reduce((sum, transaction) => sum + transaction.amount, 0);

      const incomeToday = MOCK_TRANSACTIONS.filter(
        (transaction) =>
          transaction.type === 'income' &&
          new Date(transaction.date).toDateString() === today,
      ).reduce((sum, transaction) => sum + transaction.amount, 0);

      const expensesToday = MOCK_TRANSACTIONS.filter(
        (transaction) =>
          transaction.type === 'expense' &&
          new Date(transaction.date).toDateString() === today,
      ).reduce((sum, transaction) => sum + transaction.amount, 0);

      return {
        totalIncome: income,
        totalExpenses: expenses,
        netBalance: income - expenses,
        todayIncome: incomeToday,
        todayExpenses: expensesToday,
      };
    }, []);

  const filteredTransactions = MOCK_TRANSACTIONS.filter((transaction) => {
    const matchesTab = activeTab === 'all' || transaction.type === activeTab;
    const query = searchTerm.toLowerCase();
    const matchesSearch =
      transaction.description.toLowerCase().includes(query) ||
      transaction.category.toLowerCase().includes(query) ||
      (transaction.reference || '').toLowerCase().includes(query);

    return matchesTab && matchesSearch;
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
      return;
    }

    setSortField(field);
    setSortDirection('asc');
  };

  const getTypeBadge = (type: string) => {
    const badges = {
      income: {
        text: 'Ingreso',
        class:
          'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        icon: TrendingUp,
      },
      expense: {
        text: 'Egreso',
        class:
          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        icon: TrendingDown,
      },
    };

    const badge = badges[type as keyof typeof badges];
    const Icon = badge.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium ${badge.class}`}
      >
        <Icon className="h-3 w-3" />
        {badge.text}
      </span>
    );
  };

  if (viewTheme === 'mikrosystem') {
    return (
      <div className="min-h-full bg-[#d9e7f3] p-3 sm:p-4">
        <div className="overflow-hidden rounded-[4px] border border-[#d5dde7] bg-white">
          <div className="bg-[#202833] px-6 py-4">
            <h1 className="text-[18px] font-bold text-white">
              Ingresos &amp; Egresos
            </h1>
          </div>

          <div className="space-y-6 px-6 py-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
              <div className="relative overflow-hidden rounded-[6px] bg-gradient-to-r from-[#18c7cc] to-[#1aa8a8] px-6 py-7 text-white">
                <div className="absolute -right-5 -top-5 text-[126px] leading-none text-white/12">
                  ◔
                </div>
                <div className="relative">
                  <div className="text-center text-[16px] uppercase text-white/80">
                    Total ingresos hoy
                  </div>
                  <div className="mt-4 text-center text-[38px] font-light leading-none">
                    <MxAmount value={todayIncome} />
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[6px] bg-gradient-to-r from-[#18c7cc] to-[#37b6ba] px-6 py-7 text-white">
                <div className="absolute -right-4 -top-4 text-[120px] leading-none text-white/12">
                  ◔
                </div>
                <div className="relative">
                  <div className="text-center text-[16px] uppercase text-white/80">
                    Total ingresos
                  </div>
                  <div className="mt-4 text-center text-[38px] font-light leading-none">
                    <MxAmount value={totalIncome} />
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[6px] bg-gradient-to-r from-[#65a8ea] to-[#3e91df] px-6 py-7 text-white">
                <div className="absolute -right-3 -top-6 text-[124px] leading-none text-white/12">
                  ↷
                </div>
                <div className="relative">
                  <div className="text-center text-[16px] uppercase text-white/80">
                    Total egresos hoy
                  </div>
                  <div className="mt-4 text-center text-[38px] font-light leading-none">
                    <MxAmount value={todayExpenses} />
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[6px] bg-gradient-to-r from-[#65a8ea] to-[#2783da] px-6 py-7 text-white">
                <div className="absolute -right-3 -top-6 text-[124px] leading-none text-white/12">
                  ↷
                </div>
                <div className="relative">
                  <div className="text-center text-[16px] uppercase text-white/80">
                    Total egresos
                  </div>
                  <div className="mt-4 text-center text-[38px] font-light leading-none">
                    <MxAmount value={totalExpenses} />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex overflow-hidden rounded-[6px] border border-[#d5dde7] bg-white">
                  <select
                    value={pageSize}
                    onChange={(event) => setPageSize(Number(event.target.value))}
                    className="h-[48px] min-w-[56px] appearance-none border-r border-[#d5dde7] bg-white px-4 text-[18px] font-medium text-[#223448] outline-none"
                  >
                    <option value={15}>15</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <button
                    type="button"
                    className="inline-flex h-[48px] w-[56px] items-center justify-center border-r border-[#d5dde7] bg-white text-[#334a62]"
                    title="Vista de lista"
                  >
                    <List className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-[48px] w-[56px] items-center justify-center bg-white text-[#334a62]"
                    title="Guardar"
                  >
                    <Save className="h-5 w-5" />
                  </button>
                </div>

                <Button
                  size="sm"
                  className="h-[48px] rounded-[6px] border border-[#d5dde7] bg-white px-5 text-[16px] font-semibold text-[#223448] shadow-none hover:bg-[#f7fafc]"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Nuevo
                </Button>

                <button
                  type="button"
                  className="inline-flex h-[48px] w-[56px] items-center justify-center rounded-[6px] border border-[#d5dde7] bg-white text-[#334a62]"
                  title="Filtros"
                >
                  <Filter className="h-5 w-5" />
                </button>

                <div className="flex overflow-hidden rounded-[6px] border border-[#d5dde7] bg-white">
                  <input
                    type="text"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                    className="h-[48px] w-[140px] px-4 text-[16px] text-[#223448] outline-none"
                  />
                  <span className="inline-flex h-[48px] items-center border-x border-[#d5dde7] bg-[#eef2f6] px-4 text-[16px] text-[#4a6077]">
                    al
                  </span>
                  <input
                    type="text"
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                    className="h-[48px] w-[140px] px-4 text-[16px] text-[#223448] outline-none"
                  />
                </div>
              </div>

              <div className="w-full xl:max-w-[390px]">
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="h-[48px] w-full rounded-[6px] border border-[#d5dde7] bg-white px-4 text-[16px] text-[#223448] outline-none placeholder:text-[#b6c0cb]"
                />
              </div>
            </div>

            <div className="overflow-hidden border border-[#d5dde7] bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] text-[14px]">
                  <thead className="border-b border-[#d5dde7] bg-white">
                    <tr className="text-left text-[#223448]">
                      <th className="border-r border-[#dbe3ec] px-4 py-4 font-semibold">
                        <div className="flex items-center gap-1">
                          ID
                          <span className="text-[#4991e6]">▲</span>
                        </div>
                      </th>
                      {[
                        'REFERENCIA',
                        'FECHA',
                        'MONTO',
                        'TIPO',
                        'PROVEEDOR',
                        'OPERADOR',
                        'ROUTER',
                        'DESCRIPCION',
                      ].map((header, index, headers) => (
                        <th
                          key={header}
                          className={`px-4 py-4 font-semibold ${
                            index !== headers.length - 1
                              ? 'border-r border-[#dbe3ec]'
                              : ''
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            {header}
                            <ChevronDown className="h-4 w-4 rotate-180 text-[#c1cad4]" />
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td
                        colSpan={9}
                        className="border-b border-[#dbe3ec] px-4 py-7 text-center text-[15px] text-[#3d556d]"
                      >
                        Ningun registro disponible
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-4 px-6 py-10 xl:flex-row xl:items-center xl:justify-between">
                <div className="text-[14px] font-semibold text-[#69809a]">
                  Mostrando 0 registros
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    className="inline-flex h-[48px] w-[48px] items-center justify-center rounded-[6px] border border-[#d5dde7] bg-white text-[#9aa8b8]"
                    disabled
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-[48px] w-[48px] items-center justify-center rounded-[6px] border border-[#d5dde7] bg-white text-[#9aa8b8]"
                    disabled
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
      header: 'Descripcion',
      sortable: true,
      render: (transaction) => (
        <div>
          <div className="leading-tight font-medium text-gray-900 dark:text-white">
            {transaction.description}
          </div>
          <div className="mt-0.5 leading-tight text-gray-500 dark:text-gray-400">
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
        <span
          className={`font-medium ${
            transaction.type === 'income'
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {transaction.type === 'income' ? '+' : '-'}{' '}
          {formatCurrency(transaction.amount)}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Fecha',
      sortable: true,
      render: (transaction) => (
        <span className="text-gray-600 dark:text-gray-400">
          {formatDate(transaction.date)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'center',
      render: () => (
        <div className="flex items-center justify-center gap-1">
          <button
            className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Ver detalle"
          >
            <Eye className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Editar"
          >
            <Edit className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      ),
    },
  ];

  const totalPages = Math.ceil(filteredTransactions.length / pageSize);

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900">
      <CompactTableToolbar
        title="Otros Ingresos & Egresos"
        stats={[
          {
            label: 'Ingresos',
            value: formatCurrency(totalIncome),
            icon: <TrendingUp className="h-4 w-4" />,
            color: 'text-green-600 dark:text-green-400',
          },
          {
            label: 'Egresos',
            value: formatCurrency(totalExpenses),
            icon: <TrendingDown className="h-4 w-4" />,
            color: 'text-red-600 dark:text-red-400',
          },
          {
            label: 'Balance Neto',
            value: formatCurrency(netBalance),
            icon: <DollarSign className="h-4 w-4" />,
            color:
              netBalance >= 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400',
          },
          {
            label: 'Transacciones',
            value: MOCK_TRANSACTIONS.length,
          },
        ]}
        actions={
          <>
            <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
              <Filter className="mr-1.5 h-3.5 w-3.5" />
              Filtros
            </Button>
            <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Exportar
            </Button>
            <Button
              size="sm"
              className="h-8 bg-blue-600 px-3 text-xs hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Nueva Transaccion
            </Button>
          </>
        }
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar transacciones..."
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
      />

      <div className="border-b border-gray-200 bg-white px-4 py-0 dark:border-gray-700 dark:bg-gray-800">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`border-b-2 px-1 pb-2 text-xs font-medium transition-colors ${
              activeTab === 'all'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Todas ({MOCK_TRANSACTIONS.length})
          </button>
          <button
            onClick={() => setActiveTab('income')}
            className={`border-b-2 px-1 pb-2 text-xs font-medium transition-colors ${
              activeTab === 'income'
                ? 'border-green-600 text-green-600 dark:border-green-400 dark:text-green-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Ingresos ({MOCK_TRANSACTIONS.filter((t) => t.type === 'income').length})
          </button>
          <button
            onClick={() => setActiveTab('expense')}
            className={`border-b-2 px-1 pb-2 text-xs font-medium transition-colors ${
              activeTab === 'expense'
                ? 'border-red-600 text-red-600 dark:border-red-400 dark:text-red-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Egresos ({MOCK_TRANSACTIONS.filter((t) => t.type === 'expense').length})
          </button>
        </nav>
      </div>

      <div className="m-0 border-x border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
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
