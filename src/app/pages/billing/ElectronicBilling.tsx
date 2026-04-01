import type { CSSProperties, ReactNode } from 'react';
import { BadgeCheck, Globe2, PlugZap } from 'lucide-react';
import { useViewTheme } from '../../context/ViewThemeContext';

type Country = {
  name: string;
  flag: ReactNode;
};

const countries: Country[] = [
  { name: 'Peru', flag: <PeruFlag /> },
  { name: 'Argentina', flag: <ArgentinaFlag /> },
  { name: 'Mexico', flag: <MexicoFlag /> },
  { name: 'Chile', flag: <ChileFlag /> },
  { name: 'Colombia', flag: <ColombiaFlag /> },
  { name: 'Ecuador', flag: <EcuadorFlag /> },
  { name: 'Guatemala', flag: <GuatemalaFlag /> },
  { name: 'Paraguay', flag: <ParaguayFlag /> },
  { name: 'Republica Dominicana', flag: <DominicanRepublicFlag /> },
  { name: 'Panama', flag: <PanamaFlag /> },
];

const supportPoints = [
  'Contar con una API rest.',
  'Documentacion detallada del API.',
  'Soportar entorno de pruebas.',
];

const WISPHUB_FONT =
  '"Trebuchet MS", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif';

const wisphubStyles = {
  page: {
    minHeight: '100%',
    background:
      'radial-gradient(circle at top right, rgba(69, 191, 99, 0.08), transparent 28%), #ffffff',
    borderTop: '4px solid #45bf63',
    color: '#17273d',
    fontFamily: WISPHUB_FONT,
    paddingBottom: '36px',
  } satisfies CSSProperties,
  header: {
    borderBottom: '1px solid #d7dde5',
    padding: '24px 12px 18px',
    marginBottom: '20px',
  } satisfies CSSProperties,
  mainCard: {
    margin: '0 12px 20px',
    border: '1px solid #d7dde5',
    backgroundColor: '#ffffff',
    boxShadow: '0 16px 32px rgba(23, 39, 61, 0.05)',
  } satisfies CSSProperties,
  supportCard: {
    margin: '0 12px',
    border: '1px solid #d7dde5',
    backgroundColor: '#f8fbf9',
  } satisfies CSSProperties,
} as const;

const mikrosystemStyles = {
  page: {
    minHeight: '100%',
    backgroundColor: '#d3dce7',
    padding: '18px 22px 26px',
    color: '#223448',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  } satisfies CSSProperties,
  card: {
    width: '100%',
    maxWidth: '720px',
    border: '1px solid #d5dde7',
    backgroundColor: '#ffffff',
    boxShadow: '0 1px 0 rgba(15, 23, 42, 0.04)',
  } satisfies CSSProperties,
  header: {
    backgroundColor: '#202833',
    color: '#ffffff',
    padding: '18px 20px',
    fontSize: '18px',
    fontWeight: 700,
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
  } satisfies CSSProperties,
} as const;

function FlagCircle({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative h-[78px] w-[78px] overflow-hidden rounded-full shadow-[inset_0_0_0_1px_rgba(15,23,42,0.08)] ${className}`}
    >
      {children}
    </div>
  );
}

function CountryTile({
  country,
  variant,
}: {
  country: Country;
  variant: 'wisphub' | 'mikrosystem';
}) {
  if (variant === 'wisphub') {
    return (
      <div className="rounded-[16px] border border-[#d9e6dc] bg-[#fbfefc] px-4 py-5 text-center shadow-[0_8px_22px_rgba(69,191,99,0.08)]">
        <div className="mb-4 flex justify-center">{country.flag}</div>
        <h2 className="text-[17px] font-bold uppercase tracking-[0.03em] text-[#15263b]">
          {country.name}
        </h2>
        <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#45bf63]">
          Facturacion disponible
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      {country.flag}
      <h2 className="text-[17px] font-bold uppercase text-[#24364b]">
        {country.name}
      </h2>
    </div>
  );
}

function RequirementChip({ text }: { text: string }) {
  return (
    <li className="rounded-full border border-[#d7dde5] bg-white px-4 py-2 text-[13px] text-[#30455f] shadow-[0_8px_18px_rgba(15,23,42,0.04)]">
      {text}
    </li>
  );
}

function PeruFlag() {
  return (
    <FlagCircle>
      <div className="absolute inset-y-0 left-0 w-1/3 bg-[#d7062d]" />
      <div className="absolute inset-y-0 left-1/3 w-1/3 bg-[#f8f8f8]" />
      <div className="absolute inset-y-0 right-0 w-1/3 bg-[#d7062d]" />
    </FlagCircle>
  );
}

function ArgentinaFlag() {
  return (
    <FlagCircle>
      <div className="absolute inset-x-0 top-0 h-1/3 bg-[#5aa6ff]" />
      <div className="absolute inset-x-0 top-1/3 h-1/3 bg-[#f8f8f8]" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-[#5aa6ff]" />
      <div className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ffd14a]" />
      <div className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-transparent border-t-[#ffd14a] border-b-[#ffd14a]" />
    </FlagCircle>
  );
}

function MexicoFlag() {
  return (
    <FlagCircle>
      <div className="absolute inset-y-0 left-0 w-1/3 bg-[#68b242]" />
      <div className="absolute inset-y-0 left-1/3 w-1/3 bg-[#fbfbfb]" />
      <div className="absolute inset-y-0 right-0 w-1/3 bg-[#db2432]" />
      <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f09d2f]" />
      <div className="absolute left-1/2 top-[43px] h-2 w-6 -translate-x-1/2 rounded-full bg-[#e4b53b]" />
    </FlagCircle>
  );
}

function ChileFlag() {
  return (
    <FlagCircle>
      <div className="absolute inset-x-0 top-0 h-1/2 bg-[#f6f7fb]" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[#db1331]" />
      <div className="absolute left-0 top-0 h-1/2 w-[42%] bg-[#0d62c8]" />
      <div
        className="absolute left-[14px] top-[12px] text-[21px] leading-none text-white"
        dangerouslySetInnerHTML={{ __html: '&#9733;' }}
      />
    </FlagCircle>
  );
}

function ColombiaFlag() {
  return (
    <FlagCircle>
      <div className="absolute inset-x-0 top-0 h-1/2 bg-[#ffd441]" />
      <div className="absolute inset-x-0 top-1/2 h-1/4 bg-[#255fc5]" />
      <div className="absolute inset-x-0 bottom-0 h-1/4 bg-[#d91934]" />
    </FlagCircle>
  );
}

function EcuadorFlag() {
  return (
    <FlagCircle>
      <div className="absolute inset-x-0 top-0 h-1/2 bg-[#ffd441]" />
      <div className="absolute inset-x-0 top-1/2 h-1/4 bg-[#255fc5]" />
      <div className="absolute inset-x-0 bottom-0 h-1/4 bg-[#d91934]" />
      <div className="absolute left-1/2 top-1/2 h-7 w-5 -translate-x-1/2 -translate-y-1/2 rounded-b-[10px] rounded-t-[14px] bg-[#10151f]" />
      <div className="absolute left-1/2 top-[19px] h-4 w-9 -translate-x-1/2 rounded-full bg-[#ffd441]" />
    </FlagCircle>
  );
}

function GuatemalaFlag() {
  return (
    <FlagCircle>
      <div className="absolute inset-y-0 left-0 w-1/3 bg-[#59a8ff]" />
      <div className="absolute inset-y-0 left-1/3 w-1/3 bg-[#f9fafc]" />
      <div className="absolute inset-y-0 right-0 w-1/3 bg-[#59a8ff]" />
      <div className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[4px] border-[#8ab34e]" />
      <div className="absolute left-1/2 top-1/2 h-7 w-[2px] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[#7f8f53]" />
      <div className="absolute left-1/2 top-1/2 h-7 w-[2px] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-[#7f8f53]" />
    </FlagCircle>
  );
}

function ParaguayFlag() {
  return (
    <FlagCircle>
      <div className="absolute inset-x-0 top-0 h-1/3 bg-[#db1430]" />
      <div className="absolute inset-x-0 top-1/3 h-1/3 bg-[#f9fafc]" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-[#265fc7]" />
      <div className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[4px] border-[#9cc54c]" />
      <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f4c847]" />
    </FlagCircle>
  );
}

function DominicanRepublicFlag() {
  return (
    <FlagCircle>
      <div className="absolute left-0 top-0 h-1/2 w-1/2 bg-[#175fc3]" />
      <div className="absolute right-0 top-0 h-1/2 w-1/2 bg-[#db2138]" />
      <div className="absolute left-0 bottom-0 h-1/2 w-1/2 bg-[#f7f8fb]" />
      <div className="absolute right-0 bottom-0 h-1/2 w-1/2 bg-[#175fc3]" />
      <div className="absolute left-1/2 top-0 h-full w-[16px] -translate-x-1/2 bg-white" />
      <div className="absolute left-0 top-1/2 h-[16px] w-full -translate-y-1/2 bg-white" />
      <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3ca650]" />
      <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d61d32]" />
    </FlagCircle>
  );
}

function PanamaFlag() {
  return (
    <FlagCircle>
      <div className="absolute left-0 top-0 h-1/2 w-1/2 bg-[#f8fafb]" />
      <div className="absolute right-0 top-0 h-1/2 w-1/2 bg-[#e11c36]" />
      <div className="absolute left-0 bottom-0 h-1/2 w-1/2 bg-[#0d63c8]" />
      <div className="absolute right-0 bottom-0 h-1/2 w-1/2 bg-[#f8fafb]" />
      <div
        className="absolute left-[13px] top-[10px] text-[20px] leading-none text-[#0d63c8]"
        dangerouslySetInnerHTML={{ __html: '&#9733;' }}
      />
      <div
        className="absolute right-[13px] bottom-[10px] text-[20px] leading-none text-[#e11c36]"
        dangerouslySetInnerHTML={{ __html: '&#9733;' }}
      />
    </FlagCircle>
  );
}

export default function ElectronicBilling() {
  const { viewTheme } = useViewTheme();
  const isWispHub = viewTheme === 'wisphub';

  if (isWispHub) {
    return (
      <div style={wisphubStyles.page}>
        <header style={wisphubStyles.header}>
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#45bf63]">
            Facturacion
          </p>
          <h1 className="mt-2 text-[30px] font-semibold leading-none text-[#15263b]">
            Facturacion electronica
          </h1>
          <p className="mt-4 max-w-3xl text-[14px] leading-6 text-[#4e637c]">
            Disponibilidad regional para integraciones de facturacion
            electronica. Cada pais habilitado puede conectarse con
            proveedores externos que expongan servicios compatibles con la
            plataforma.
          </p>
        </header>

        <section style={wisphubStyles.mainCard}>
          <div className="border-b border-[#e3e9ef] px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e8f7ec] text-[#45bf63]">
                <Globe2 className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-[20px] font-semibold text-[#15263b]">
                  Paises con soporte activo
                </h2>
                <p className="mt-1 text-[13px] leading-5 text-[#5e738a]">
                  Facturacion electronica esta disponible para los siguientes
                  paises:
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 px-5 py-6 sm:grid-cols-2 xl:grid-cols-5">
            {countries.map((country) => (
              <CountryTile
                key={country.name}
                country={country}
                variant="wisphub"
              />
            ))}
          </div>
        </section>

        <section style={wisphubStyles.supportCard}>
          <div className="grid gap-6 px-5 py-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <div>
              <h2 className="text-[26px] font-semibold leading-tight text-[#15263b]">
                Como solicitar soporte para mi pais?
              </h2>
              <p className="mt-4 text-[15px] leading-7 text-[#415871]">
                Para poder integrar facturacion electronica para su pais
                podemos utilizar servicios APIs de terceros.
              </p>
              <p className="mt-4 text-[15px] leading-7 text-[#415871]">
                La empresa proveedora del servicio de facturacion debe cumplir
                con lo siguiente:
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-[18px] border border-[#dce6de] bg-white p-5">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eaf7ee] text-[#45bf63]">
                    <PlugZap className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-[#15263b]">
                      Requisitos tecnicos
                    </p>
                    <p className="text-[12px] text-[#66798f]">
                      Validacion previa de proveedor
                    </p>
                  </div>
                </div>
                <ul className="space-y-3">
                  {supportPoints.map((point) => (
                    <RequirementChip key={point} text={point} />
                  ))}
                </ul>
              </div>

              <div className="rounded-[18px] border border-[#dce6de] bg-[#f4fbf6] p-5">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#45bf63] shadow-[0_8px_18px_rgba(69,191,99,0.1)]">
                    <BadgeCheck className="h-5 w-5" />
                  </div>
                  <p className="text-[14px] leading-6 text-[#415871]">
                    Una vez validado el proveedor, la integracion puede
                    conectarse con la plataforma respetando los mismos criterios
                    operativos del tema activo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div style={mikrosystemStyles.page}>
      <div className="flex justify-center">
        <section style={mikrosystemStyles.card}>
          <header style={mikrosystemStyles.header}>
            FACTURACION ELECTRONICA
          </header>

          <div className="space-y-8 px-4 py-7 sm:px-6 md:px-7">
            <div>
              <p className="text-[15px] leading-7 text-[#31465d]">
                Facturacion electronica esta disponible para los siguientes
                Paises:
              </p>

              <div className="mt-8 grid grid-cols-2 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
                {countries.map((country) => (
                  <CountryTile
                    key={country.name}
                    country={country}
                    variant="mikrosystem"
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4 border-t border-[#e3e7ed] pt-6">
              <h2 className="text-[22px] font-normal text-[#1d3045]">
                Como solicitar soporte para mi pais?
              </h2>

              <p className="text-[15px] leading-8 text-[#31465d]">
                Para poder integrar facturacion electronica para su pais
                podemos utilizar servicios APIs de terceros.
              </p>

              <p className="text-[15px] leading-8 text-[#31465d]">
                La empresa proveedora del servicio de facturacion debe cumplir
                con lo siguiente:
              </p>

              <ul className="list-disc space-y-2 pl-7 text-[15px] leading-8 text-[#31465d]">
                {supportPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
