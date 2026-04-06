import type { ChangeEvent } from 'react';
import { useId, useRef, useState } from 'react';
import {
  ChevronDown,
  Download,
  FileSpreadsheet,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import { useViewTheme } from '../../context/ViewThemeContext';
import './RegisterBulkPayments.css';

const searchOptions = [
  'CEDULA,DNI,RUC,CUIT,NIT,SAT,RUT,RTN,ETC.',
  'CODIGO DE CLIENTE',
  'NUMERO DE FACTURA',
  'CORREO ELECTRONICO',
] as const;

function StepMarker({
  step,
  accentClassName,
}: {
  step: number;
  accentClassName: string;
}) {
  return (
    <div className="relative flex w-[62px] flex-col items-center">
      <div
        className={`flex h-[48px] w-[48px] items-center justify-center rounded-full border-[3px] bg-white text-[18px] font-bold ${accentClassName}`}
      >
        {step}
      </div>
      {step < 4 ? (
        <div
          className={`mt-1 min-h-[110px] w-px border-l-2 border-dashed ${accentClassName.replace(
            'text-',
            'border-',
          )}`}
        />
      ) : null}
    </div>
  );
}

function StepTitle({
  title,
  accentClassName,
}: {
  title: string;
  accentClassName: string;
}) {
  return (
    <h2 className={`text-[18px] font-semibold ${accentClassName}`}>
      {title}
    </h2>
  );
}

export default function RegisterBulkPayments() {
  const { viewTheme } = useViewTheme();
  const isWispHub = viewTheme === 'wisphub';
  const inputRef = useRef<HTMLInputElement | null>(null);
  const fileInputId = useId();
  const searchTypeId = useId();
  const [searchType, setSearchType] = useState<string>(searchOptions[0]);
  const [selectedFileName, setSelectedFileName] = useState('');

  function handleTemplateDownload() {
    toast.success('Descarga de plantilla preparada.');
  }

  function handleUploadClick() {
    inputRef.current?.click();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      toast.error('El archivo debe estar en formato .xlsx');
      return;
    }

    setSelectedFileName(file.name);
    toast.success('Plantilla cargada correctamente.');
  }

  function handleValidateFile() {
    toast.success('Validacion preparada para integracion con backend.');
  }

  if (isWispHub) {
    return (
      <div className="register-bulk-payments register-bulk-payments--wisphub">
        <header className="register-bulk-payments__header register-bulk-payments__header--wisphub">
          <h1 className="text-[30px] font-semibold leading-none text-[#15263b]">
            Pagos masivos
          </h1>
        </header>

        <section className="register-bulk-payments__card register-bulk-payments__card--wisphub mx-auto max-w-[980px]">
          <div className="border-b border-[#dfe6ee] px-5 py-4">
            <h2 className="text-[18px] font-bold text-[#3d556d]">
              Registrar pagos Masivos
            </h2>
          </div>

          <div className="px-6 py-7">
            <p className="mb-6 text-[16px] text-[#11a7bd]">
              Desde aqui podemos registrar pagos de forma masiva utilizando un
              archivo de excel
            </p>

            <input
              id={fileInputId}
              ref={inputRef}
              type="file"
              accept=".xlsx"
              aria-label="Seleccionar archivo Excel para pagos masivos"
              className="register-bulk-payments__sr-only"
              onChange={handleFileChange}
            />

            <div className="space-y-1">
              <div className="flex gap-4">
                <StepMarker step={1} accentClassName="border-[#45bf63] text-[#45bf63]" />
                <div className="flex-1 pb-7">
                  <StepTitle title="Descargar Plantilla" accentClassName="text-[#45bf63]" />
                  <button
                    type="button"
                    onClick={handleTemplateDownload}
                    className="register-bulk-payments__button register-bulk-payments__button--wisphub-secondary mt-3 inline-flex items-center gap-2 rounded-[4px]"
                  >
                    <Download className="h-4 w-4" />
                    Descargar Plantilla Excel
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <StepMarker step={2} accentClassName="border-[#45bf63] text-[#45bf63]" />
                <div className="flex-1 pb-7">
                  <StepTitle title="Rellenar Plantilla" accentClassName="text-[#45bf63]" />
                  <button
                    type="button"
                    onClick={handleUploadClick}
                    aria-controls={fileInputId}
                    className="register-bulk-payments__button register-bulk-payments__button--wisphub-secondary mt-3 inline-flex items-center gap-2 rounded-[4px]"
                  >
                    <Upload className="h-4 w-4" />
                    Seleccionar plantilla y Subir
                  </button>
                  <p className="mt-4 text-[14px] text-[#24364b]">
                    No altere el orden de las columnas de la plantilla. El nombre del archivo debe terminar en .xlsx
                  </p>
                  {selectedFileName ? (
                    <p className="mt-2 text-[13px] font-semibold text-[#45bf63]">
                      Archivo cargado: {selectedFileName}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex gap-4">
                <StepMarker step={3} accentClassName="border-[#45bf63] text-[#45bf63]" />
                <div className="flex-1 pb-7">
                  <StepTitle title="Buscar Cliente" accentClassName="text-[#45bf63]" />
                  <label
                    htmlFor={searchTypeId}
                    className="mt-3 block text-[15px] text-[#24364b]"
                  >
                    Buscar por :
                  </label>
                  <div className="relative mt-3">
                    <select
                      id={searchTypeId}
                      value={searchType}
                      onChange={(event) => setSearchType(event.target.value)}
                      className="register-bulk-payments__select register-bulk-payments__select--wisphub w-full appearance-none rounded-[4px] pr-11"
                    >
                      {searchOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4e637c]" />
                  </div>
                  <p className="mt-3 text-[14px] text-[#24364b]">
                    El dato a buscar está definido en la primera columna de la plantilla, aquí debe escoger el tipo de búsqueda correcto..
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <StepMarker step={4} accentClassName="border-[#45bf63] text-[#45bf63]" />
                <div className="flex-1">
                  <StepTitle title="Validar archivo" accentClassName="text-[#45bf63]" />
                  <button
                    type="button"
                    onClick={handleValidateFile}
                    className="register-bulk-payments__button register-bulk-payments__button--wisphub-primary mt-3 inline-flex items-center gap-2 rounded-[4px]"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Iniciar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="register-bulk-payments register-bulk-payments--mikrosystem">
      <h1 className="mb-7 text-[26px] font-normal leading-none text-[#1f2933]">
        Pagos masivos
      </h1>

      <section className="register-bulk-payments__card register-bulk-payments__card--mikrosystem mx-auto">
        <div className="register-bulk-payments__header register-bulk-payments__header--mikrosystem">
          Registrar pagos Masivos
        </div>

        <div className="px-8 py-8">
          <p className="mb-7 text-[18px] text-[#11a7bd]">
            Desde Aquí podemos registrar pagos de forma masiva utilizando un
            archivo de excel
          </p>

          <input
            id={fileInputId}
            ref={inputRef}
            type="file"
            accept=".xlsx"
            aria-label="Seleccionar archivo Excel para pagos masivos"
            className="register-bulk-payments__sr-only"
            onChange={handleFileChange}
          />

          <div className="space-y-1">
            <div className="flex gap-4">
              <StepMarker step={1} accentClassName="border-[#4aa8ea] text-[#4aa8ea]" />
              <div className="flex-1 pb-7">
                <StepTitle title="Descargar Plantilla" accentClassName="text-[#4aa8ea]" />
                <button
                  type="button"
                  onClick={handleTemplateDownload}
                  className="mt-3 inline-flex h-[50px] items-center gap-2 rounded-[6px] border border-[#d7e0ea] bg-white px-5 text-[14px] font-semibold text-[#24364b]"
                >
                  <Download className="h-5 w-5" />
                  Descargar Plantilla Excel
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <StepMarker step={2} accentClassName="border-[#4aa8ea] text-[#4aa8ea]" />
              <div className="flex-1 pb-7">
                <StepTitle title="Rellenar Plantilla" accentClassName="text-[#4aa8ea]" />
                <button
                  type="button"
                  onClick={handleUploadClick}
                  aria-controls={fileInputId}
                  className="mt-3 inline-flex h-[50px] items-center gap-2 rounded-[6px] border border-[#d7e0ea] bg-white px-5 text-[14px] font-semibold text-[#24364b]"
                >
                  <Upload className="h-5 w-5" />
                  Seleccionar plantilla y Subir
                </button>
                <p className="mt-4 text-[15px] text-[#24364b]">
                  No altere el orden de las columnas de la plantilla. El nombre del archivo debe terminar en .xlsx
                </p>
                {selectedFileName ? (
                  <p className="mt-2 text-[14px] font-semibold text-[#4aa8ea]">
                    Archivo cargado: {selectedFileName}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex gap-4">
              <StepMarker step={3} accentClassName="border-[#4aa8ea] text-[#4aa8ea]" />
              <div className="flex-1 pb-7">
                <StepTitle title="Buscar Cliente" accentClassName="text-[#4aa8ea]" />
                <label
                  htmlFor={searchTypeId}
                  className="mt-3 block text-[15px] text-[#24364b]"
                >
                  Buscar por :
                </label>
                <div className="relative mt-3">
                  <select
                    id={searchTypeId}
                    value={searchType}
                    onChange={(event) => setSearchType(event.target.value)}
                    className="h-[50px] w-full appearance-none rounded-[6px] border border-[#d7e0ea] bg-white px-4 pr-12 text-[14px] font-semibold text-[#24364b] outline-none"
                  >
                    {searchOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#4e637c]" />
                </div>
                <p className="mt-3 text-[15px] text-[#24364b]">
                  El dato a buscar está definido en la primera columna de la plantilla, aquí debe escoger el tipo de búsqueda correcto..
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <StepMarker step={4} accentClassName="border-[#4aa8ea] text-[#4aa8ea]" />
              <div className="flex-1">
                <StepTitle title="Validar archivo" accentClassName="text-[#4aa8ea]" />
                <button
                  type="button"
                  onClick={handleValidateFile}
                  className="mt-3 inline-flex h-[46px] items-center gap-2 rounded-[6px] border border-[#d7e0ea] bg-white px-5 text-[14px] font-semibold text-[#24364b]"
                >
                  <FileSpreadsheet className="h-5 w-5" />
                  Iniciar
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
