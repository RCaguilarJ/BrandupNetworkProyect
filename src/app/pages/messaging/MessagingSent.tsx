import { useState } from 'react';
import { Settings2 } from 'lucide-react';
import { ActionButton, type DataColumn } from '../network/networkManagementShared';
import { MessagingTableScreen } from './messagingShared';
import { useViewTheme } from '../../context/ViewThemeContext';

type EmptyRow = Record<string, never>;

const columns: DataColumn<EmptyRow>[] = [
  { key: 'select', header: '', width: '52px', hideSortIcon: true, align: 'center', render: () => '' },
  { key: 'id', header: 'ID', width: '70px', render: () => '' },
  { key: 'cliente', header: 'CLIENTE', width: '260px', render: () => '' },
  { key: 'fecha', header: 'FECHA', width: '210px', render: () => '' },
  { key: 'destino', header: 'N° DESTINO', width: '250px', render: () => '' },
  { key: 'estado', header: 'ESTADO', width: '220px', render: () => '' },
  { key: 'gateway', header: 'GATEWAY', width: '220px', render: () => '' },
  { key: 'mensaje', header: 'MENSAJE', width: '260px', render: () => '' },
];

export default function MessagingSent() {
  const { viewTheme } = useViewTheme();
  const isWispHub = viewTheme === 'wisphub';
  const [pageSize, setPageSize] = useState(15);
  const [startDate, setStartDate] = useState('01/04/2026');
  const [endDate, setEndDate] = useState('30/04/2026');
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <MessagingTableScreen
      title="Mensajes enviados"
      breadcrumb="Mensajes enviados"
      panelTitle="SMS ENVIADOS"
      actionSlot={
        <ActionButton
          isWispHub={isWispHub}
          icon={<Settings2 className="h-4 w-4" />}
          label="Acciones"
        />
      }
      pageSize={pageSize}
      onPageSizeChange={setPageSize}
      startDate={startDate}
      endDate={endDate}
      onStartDateChange={setStartDate}
      onEndDateChange={setEndDate}
      searchTerm={searchTerm}
      onSearchTermChange={setSearchTerm}
      columns={columns}
      rows={[]}
      emptyMessage="Ningun registro disponible"
      summary="Mostrando 0 registros"
    />
  );
}
