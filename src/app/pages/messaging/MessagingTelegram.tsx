import { useMemo, useState } from 'react';
import {
  Image as ImageIcon,
  Mic,
  Paperclip,
  Search,
  Send,
  SmilePlus,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { useViewTheme } from '../../context/ViewThemeContext';
import { MessagingPageShell } from './messagingShared';

type TelegramMessage = {
  id: string;
  author: 'agent' | 'client';
  body: string;
  time: string;
};

type TelegramContact = {
  id: string;
  name: string;
  phone: string;
  preview: string;
  time: string;
  unread: number;
  status: string;
  initials: string;
  messages: TelegramMessage[];
};

const contactsSeed: TelegramContact[] = [
  {
    id: 'tl-1001',
    name: 'Carlos Aguilar',
    phone: '@caguilar',
    preview: 'Necesito revisar la activacion del servicio de internet.',
    time: '10:42 am',
    unread: 2,
    status: 'Activo',
    initials: 'CA',
    messages: [
      {
        id: 'm-1',
        author: 'client',
        body: 'Buenos dias, me apoyan con la activacion del servicio?',
        time: '10:34 am',
      },
      {
        id: 'm-2',
        author: 'agent',
        body: 'Claro, ya estoy revisando el router y la provision del cliente.',
        time: '10:37 am',
      },
      {
        id: 'm-3',
        author: 'client',
        body: 'Perfecto. Tambien necesito confirmar la fecha de pago.',
        time: '10:42 am',
      },
    ],
  },
  {
    id: 'tl-1002',
    name: 'Maria Perez',
    phone: '@mariapz',
    preview: 'Quedo pendiente el comprobante de pago del mes.',
    time: '09:15 am',
    unread: 0,
    status: 'Ultima vez hoy a las 09:20 am',
    initials: 'MP',
    messages: [
      {
        id: 'm-4',
        author: 'client',
        body: 'Ya envie el comprobante por transferencia.',
        time: '09:11 am',
      },
      {
        id: 'm-5',
        author: 'agent',
        body: 'Recibido. Lo registramos en el sistema en unos minutos.',
        time: '09:15 am',
      },
    ],
  },
  {
    id: 'tl-1003',
    name: 'Soporte Torre Norte',
    phone: '@soporte_tn',
    preview: 'Se agenda visita tecnica para manana a primera hora.',
    time: 'Ayer',
    unread: 1,
    status: 'Escribiendo...',
    initials: 'ST',
    messages: [
      {
        id: 'm-6',
        author: 'agent',
        body: 'La cuadrilla puede presentarse manana antes de las 9am.',
        time: 'Ayer 06:18 pm',
      },
      {
        id: 'm-7',
        author: 'client',
        body: 'Excelente, aqui los esperamos.',
        time: 'Ayer 06:22 pm',
      },
    ],
  },
];

function buildAvatarClasses(index: number) {
  const variants = [
    'bg-[#ff5f8f] text-white',
    'bg-[#5c76ff] text-white',
    'bg-[#14b8a6] text-white',
    'bg-[#f59c1a] text-white',
  ];

  return variants[index % variants.length];
}

export default function MessagingTelegram() {
  const { viewTheme } = useViewTheme();
  const isWispHub = viewTheme === 'wisphub';
  const [searchTerm, setSearchTerm] = useState('');
  const [draft, setDraft] = useState('');
  const [contacts, setContacts] = useState(contactsSeed);
  const [activeId, setActiveId] = useState(contactsSeed[0]?.id ?? '');

  const filteredContacts = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) {
      return contacts;
    }

    return contacts.filter((contact) =>
      [contact.name, contact.phone, contact.preview]
        .join(' ')
        .toLowerCase()
        .includes(normalized),
    );
  }, [contacts, searchTerm]);

  const activeContact =
    filteredContacts.find((contact) => contact.id === activeId) ??
    contacts.find((contact) => contact.id === activeId) ??
    filteredContacts[0] ??
    null;

  const handleSelectContact = (contactId: string) => {
    setActiveId(contactId);
    setContacts((prev) =>
      prev.map((contact) =>
        contact.id === contactId ? { ...contact, unread: 0 } : contact,
      ),
    );
  };

  const handleSend = () => {
    const body = draft.trim();
    if (!body || !activeContact) {
      return;
    }

    const nextMessage: TelegramMessage = {
      id: `draft-${Date.now()}`,
      author: 'agent',
      body,
      time: 'Ahora',
    };

    setContacts((prev) =>
      prev.map((contact) =>
        contact.id === activeContact.id
          ? {
              ...contact,
              preview: body,
              time: 'Ahora',
              messages: [...contact.messages, nextMessage],
            }
          : contact,
      ),
    );
    setDraft('');
  };

  return (
    <MessagingPageShell
      title="Telegram"
      breadcrumb="Telegram"
      panelTitle="MENSAJES TELEGRAM"
    >
      <div className="px-4 py-4 md:px-5">
        <section
          className={`overflow-hidden border bg-white ${
            isWispHub
              ? 'rounded-[10px] border-[#d7dde5] shadow-[0_12px_26px_rgba(15,23,42,0.06)]'
              : 'border-[#d5dde7]'
          }`}
        >
          <div className="grid min-h-[720px] lg:grid-cols-[360px_minmax(0,1fr)]">
            <aside className="border-r border-[#d7dde5] bg-white">
              <div className="border-b border-[#d7dde5] px-4 py-4">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8fa0b1]" />
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="h-[40px] w-full rounded-[4px] border border-[#d7dde5] bg-white pl-10 pr-4 text-[13px] text-[#32465b] outline-none placeholder:text-[#b5c0ca]"
                    placeholder="Buscar..."
                    aria-label="Buscar conversaciones de Telegram"
                  />
                </div>
                <button
                  type="button"
                  className="mt-3 inline-flex h-[34px] items-center rounded-[4px] border border-[#0eb3e3] px-4 text-[12px] font-semibold text-[#0eb3e3]"
                >
                  Los mas recientes
                </button>
              </div>

              <ul id="contacts" className="max-h-[640px] overflow-y-auto">
                {filteredContacts.map((contact, index) => {
                  const active = contact.id === activeContact?.id;

                  return (
                    <li key={contact.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectContact(contact.id)}
                        className={`flex w-full items-start gap-3 border-b border-[#eef2f6] px-4 py-4 text-left transition ${
                          active
                            ? 'bg-[#f1f7fd]'
                            : 'bg-white hover:bg-[#f7fafc]'
                        }`}
                      >
                        <Avatar className="h-11 w-11">
                          <AvatarFallback
                            className={`text-[13px] font-semibold ${buildAvatarClasses(index)}`}
                          >
                            {contact.initials}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-[13px] font-semibold text-[#233447]">
                                {contact.name}
                              </p>
                              <p className="mt-0.5 text-[11px] text-[#8ea1b4]">
                                {contact.phone}
                              </p>
                            </div>
                            <span className="shrink-0 text-[11px] text-[#8ea1b4]">
                              {contact.time}
                            </span>
                          </div>

                          <div className="mt-2 flex items-center gap-2">
                            <p className="preview line-clamp-2 flex-1 text-[12px] leading-5 text-[#5d7083]">
                              {contact.preview}
                            </p>
                            {contact.unread > 0 ? (
                              <span className="unreadmjs inline-flex min-w-[20px] items-center justify-center rounded-full bg-[#ff5b57] px-1.5 py-0.5 text-[11px] font-semibold text-white">
                                {contact.unread}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </aside>

            <div className="content2 flex min-w-0 flex-col bg-[#f8fbfd]">
              {activeContact ? (
                <>
                  <header className="inst flex items-center justify-between gap-4 border-b border-[#d7dde5] bg-white px-5 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar className="h-11 w-11">
                        <AvatarFallback className="bg-[#0eb3e3] text-[13px] font-semibold text-white">
                          {activeContact.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-semibold text-[#24364b]">
                          {activeContact.name}
                        </p>
                        <small
                          className={`block text-[12px] ${
                            activeContact.status === 'Escribiendo...'
                              ? 'loadingtl text-[#f59c1a]'
                              : 'text-[#8da1b3]'
                          }`}
                        >
                          {activeContact.status}
                        </small>
                      </div>
                    </div>

                    <div className="text-right text-[11px] text-[#8da1b3]">
                      <p>{activeContact.phone}</p>
                      <p>Canal Telegram</p>
                    </div>
                  </header>

                  <div className="messages flex-1 overflow-y-auto px-5 py-5">
                    <ul className="space-y-4">
                      {activeContact.messages.map((message) => {
                        const mine = message.author === 'agent';

                        return (
                          <li
                            key={message.id}
                            className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[78%] rounded-[8px] px-4 py-3 text-[13px] leading-6 shadow-sm ${
                                mine
                                  ? 'bg-[#dff3ff] text-[#244259]'
                                  : 'bg-white text-[#2f4256]'
                              }`}
                            >
                              <p>{message.body}</p>
                              <div
                                className={`mt-2 text-[11px] ${
                                  mine ? 'text-[#67849d]' : 'text-[#8da1b3]'
                                }`}
                              >
                                {message.time}
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  <footer className="border-t border-[#d7dde5] bg-white px-5 py-4">
                    <div className="flex items-end gap-3">
                      <div className="flex gap-2 pb-2 text-[#8fa0b1]">
                        <button
                          type="button"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d7dde5] bg-white transition hover:text-[#0eb3e3]"
                          aria-label="Adjuntar archivo"
                        >
                          <Paperclip className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d7dde5] bg-white transition hover:text-[#0eb3e3]"
                          aria-label="Agregar imagen"
                        >
                          <ImageIcon className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d7dde5] bg-white transition hover:text-[#0eb3e3]"
                          aria-label="Grabar audio"
                        >
                          <Mic className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex-1">
                        <textarea
                          value={draft}
                          onChange={(event) => setDraft(event.target.value)}
                          rows={3}
                          className="min-h-[96px] w-full resize-none rounded-[6px] border border-[#d7dde5] px-4 py-3 text-[13px] text-[#2d4156] outline-none placeholder:text-[#b5c0ca]"
                          placeholder="Escribe un mensaje para el cliente..."
                        />
                      </div>

                      <div className="flex flex-col gap-2 pb-1">
                        <button
                          type="button"
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d7dde5] bg-white text-[#8fa0b1] transition hover:text-[#0eb3e3]"
                          aria-label="Insertar emoji"
                        >
                          <SmilePlus className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={handleSend}
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-[4px] bg-[#0eb3e3] px-5 text-[12px] font-semibold uppercase tracking-[0.04em] text-white transition hover:bg-[#079ac3]"
                        >
                          <Send className="h-4 w-4" />
                          Enviar
                        </button>
                      </div>
                    </div>
                  </footer>
                </>
              ) : (
                <div className="flex flex-1 items-center justify-center px-8 py-16">
                  <div className="max-w-[420px] text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#e8f7fc] text-[#0eb3e3]">
                      <Send className="h-9 w-9" />
                    </div>
                    <h2 className="mt-6 text-[24px] font-semibold text-[#26384d]">
                      Sin conversaciones
                    </h2>
                    <p className="mt-3 text-[14px] leading-6 text-[#5f7386]">
                      No hay coincidencias con la busqueda actual o aun no se ha
                      seleccionado ningun contacto de Telegram.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </MessagingPageShell>
  );
}
