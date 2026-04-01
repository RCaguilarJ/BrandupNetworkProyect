import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ActionButton, type DataColumn } from '../network/networkManagementShared';
import { MessagingTableScreen } from './messagingShared';
import { useViewTheme } from '../../context/ViewThemeContext';

type EmptyRow = Record<string, never>;

const columns: DataColumn<EmptyRow>[] = [
  { key: 'id', header: 'ID', width: '70px', render: () => '' },
  { key: 'cliente', header: 'CLIENTE', width: '260px', render: () => '' },
  { key: 'fecha', header: 'FECHA', width: '210px', render: () => '' },
  { key: 'movil', header: 'N° MOVIL', width: '170px', render: () => '' },
  { key: 'mensaje', header: 'MENSAJE', render: () => '' },
];

export default function MessagingReceived() {
  const { viewTheme } = useViewTheme();
  const isWispHub = viewTheme === 'wisphub';
  const [pageSize, setPageSize] = useState(15);
  const [startDate, setStartDate] = useState('01/04/2026');
  const [endDate, setEndDate] = useState('30/04/2026');
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <MessagingTableScreen
      title="Mensajes recibidos"
      breadcrumb="Mensajes recibidos"
      panelTitle="SMS RECIBIDOS"
      actionSlot={
        <ActionButton
          isWispHub={isWispHub}
          icon={<Plus className="h-4 w-4" />}
          label="Nuevo"
          primary
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
