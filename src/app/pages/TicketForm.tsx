import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { MOCK_TICKETS, MOCK_CLIENTS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { TicketFormModal } from '../components/forms/TicketFormModal';
import { ServiceProcessingDialog } from './services/serviceShared';
import { useTicketCreationFlow } from './services/serviceShared';
import { toast } from 'sonner';

export default function TicketForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const isEditing = Boolean(id);
  const selectedTicket = isEditing && id ? MOCK_TICKETS.find((ticket) => ticket.id === id) : null;
  const ticketFlow = useTicketCreationFlow();

  const availableClients = user?.role === 'super_admin'
    ? MOCK_CLIENTS
    : MOCK_CLIENTS.filter(c => c.companyId === user?.companyId);

  const handleSubmit = (data: any) => {
    toast.success(isEditing ? 'Ticket actualizado exitosamente' : 'Ticket creado exitosamente');
    navigate('/tickets');
  };

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900 p-6">
      <div className="mb-6 flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/tickets')}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditing ? 'Editar Ticket' : 'Nuevo Ticket de Soporte'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isEditing ? 'Modifica los datos del ticket' : 'Registra un nuevo ticket de soporte técnico'}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Haz clic en el botón de abajo para {isEditing ? 'editar' : 'crear'} un ticket.
        </p>
        <button
          type="button"
          onClick={ticketFlow.openSequence}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-blue-600 px-6 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
        >
          {isEditing ? 'Editar Ticket' : 'Crear Nuevo Ticket'}
        </button>
      </div>

      <ServiceProcessingDialog open={ticketFlow.processingOpen} />

      <TicketFormModal
        open={ticketFlow.formOpen}
        onClose={ticketFlow.closeAll}
        onSubmit={handleSubmit}
        clients={availableClients}
        initialData={selectedTicket}
      />
    </div>
  );
}
