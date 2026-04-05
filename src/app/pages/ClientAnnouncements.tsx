import { useState, type ChangeEvent } from 'react';
import { Expand, ImagePlus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useViewTheme } from '../context/ViewThemeContext';
import {
  mikrosystemPageStyle,
  wisphubPageStyle,
} from './network/networkManagementData';

type BannerRecord = {
  id: string;
  imageName: string;
  url: string;
  order: number;
  activeTime: number;
  openInModal: boolean;
};

type BannerFormState = {
  image: File | null;
  imageName: string;
  url: string;
  order: string;
  activeTime: string;
  openInModal: boolean;
};

const initialFormState: BannerFormState = {
  image: null,
  imageName: '',
  url: '',
  order: '0',
  activeTime: '1500',
  openInModal: false,
};

export default function ClientAnnouncements() {
  const { viewTheme } = useViewTheme();
  const isWispHub = viewTheme === 'wisphub';

  const [form, setForm] = useState<BannerFormState>(initialFormState);
  const [banners, setBanners] = useState<BannerRecord[]>([]);
  const [fileInputKey, setFileInputKey] = useState(0);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    setForm((current) => ({
      ...current,
      image: file,
      imageName: file?.name ?? '',
    }));
  };

  const resetForm = () => {
    setForm(initialFormState);
    setFileInputKey((current) => current + 1);
  };

  const handleSubmit = () => {
    if (!form.image) {
      toast.error('Selecciona una imagen para el banner');
      return;
    }

    if (!form.url.trim()) {
      toast.error('Ingresa la URL del banner');
      return;
    }

    setBanners((current) => [
      {
        id: `banner-${Date.now()}`,
        imageName: form.imageName,
        url: form.url.trim(),
        order: Number.parseInt(form.order, 10) || 0,
        activeTime: Number.parseInt(form.activeTime, 10) || 1500,
        openInModal: form.openInModal,
      },
      ...current,
    ]);

    resetForm();
    toast.success('Banner agregado correctamente');
  };

  const cardClass = isWispHub
    ? 'border border-[#d7dde5] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.04)]'
    : 'border border-[#d5dde7] bg-white shadow-[0_1px_0_rgba(15,23,42,0.04)]';
  const inputClass = isWispHub
    ? 'h-[46px] rounded-[6px] border border-[#d7dde5] bg-white px-4 text-[15px] text-[#24364b] outline-none placeholder:text-[#b7c3cf]'
    : 'h-[52px] rounded-[6px] border border-[#ccd8e4] bg-white px-4 text-[15px] text-[#24364b] outline-none placeholder:text-[#c5d0db]';
  const smallInputClass = `${inputClass} w-full`;
  const actionIconClass = isWispHub
    ? 'border border-[#d7dde5] bg-white text-[#3b4d62]'
    : 'bg-white text-[#2f3d4b]';
  const primaryButtonClass = isWispHub
    ? 'inline-flex h-[46px] items-center justify-center rounded-[6px] bg-[#45bf63] px-6 text-[15px] font-semibold text-white'
    : 'inline-flex h-[48px] items-center justify-center rounded-[6px] bg-[#3399f6] px-6 text-[15px] font-semibold text-white';
  const emptyStateClass = isWispHub
    ? 'rounded-[8px] border border-[#bfe0ca] bg-[#effaf2] px-6 py-4 text-center text-[15px] text-[#3f6d4e]'
    : 'rounded-[8px] border border-[#69bae9] bg-[#d8eef8] px-6 py-4 text-center text-[15px] text-[#2b6c96]';

  return (
    <div style={isWispHub ? wisphubPageStyle : mikrosystemPageStyle}>
      <section className={cardClass}>
        <header className="flex items-center justify-between gap-4 bg-[#1f2429] px-6 py-4">
          <h1 className="text-[18px] font-bold text-white">Anuncios</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={`flex h-8 w-8 items-center justify-center rounded-full ${actionIconClass}`}
              aria-label="Expandir panel"
              title="Expandir"
            >
              <Expand className="h-4 w-4" />
            </button>
            <button
              type="button"
              className={`flex h-8 w-8 items-center justify-center rounded-full ${actionIconClass}`}
              aria-label="Restablecer formulario"
              title="Restablecer formulario"
              onClick={resetForm}
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="grid gap-7 px-6 py-6 xl:grid-cols-[464px_minmax(0,1fr)]">
          <div>
            <div className="mb-7 rounded-[4px] border border-[#d7dde5] bg-[#f4f4f4] px-6 py-4 text-[18px] text-[#36526f]">
              Nuevo banner
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-[15px] text-[#27364a]">Imagen</label>
                <div className="rounded-[6px] border border-[#ccd8e4] bg-white px-4 py-3">
                  <input
                    key={fileInputKey}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-[15px] text-[#24364b] file:mr-4 file:rounded-[4px] file:border file:border-[#b8c6d4] file:bg-white file:px-4 file:py-2 file:text-[15px] file:text-[#24364b]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[15px] text-[#27364a]">URL</label>
                <input
                  type="url"
                  value={form.url}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, url: event.target.value }))
                  }
                  className={`${inputClass} w-full`}
                  placeholder="https://ejemplo.com/oferta"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-[134px_minmax(0,1fr)]">
                <div>
                  <label className="mb-2 block text-[15px] text-[#27364a]">Orden</label>
                  <input
                    type="number"
                    min={0}
                    value={form.order}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, order: event.target.value }))
                    }
                    className={smallInputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[15px] text-[#27364a]">
                    Tiempo activo
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.activeTime}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        activeTime: event.target.value,
                      }))
                    }
                    className={smallInputClass}
                  />
                  <p className="mt-2 text-[13px] text-[#4a5b70]">Milisegundos</p>
                </div>
              </div>

              <label className="flex items-center gap-3 text-[15px] text-[#27364a]">
                <input
                  type="checkbox"
                  checked={form.openInModal}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      openInModal: event.target.checked,
                    }))
                  }
                  className="h-5 w-5 rounded border border-[#b8c6d4]"
                />
                Abrir enlace en modal
              </label>

              <div className="border-t border-[#d7dde5] pt-4">
                <div className="flex justify-end">
                  <button type="button" onClick={handleSubmit} className={primaryButtonClass}>
                    Agregar banner
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {banners.length === 0 ? (
              <div className={emptyStateClass}>No hay banners registrados todavía.</div>
            ) : (
              banners.map((banner) => (
                <article
                  key={banner.id}
                  className="rounded-[8px] border border-[#d7dde5] bg-white px-5 py-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#ebf3fb] text-[#3399f6]">
                        <ImagePlus className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#25364a]">
                          {banner.imageName || 'Banner sin nombre'}
                        </p>
                        <p className="mt-1 text-[14px] text-[#5e6f84]">{banner.url}</p>
                      </div>
                    </div>

                    <span className="rounded-full bg-[#eef4fb] px-3 py-1 text-[12px] font-semibold text-[#43627f]">
                      Orden {banner.order}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3 text-[13px] text-[#4f6277]">
                    <span className="rounded-full bg-[#f4f7fa] px-3 py-1">
                      Activo: {banner.activeTime} ms
                    </span>
                    <span className="rounded-full bg-[#f4f7fa] px-3 py-1">
                      {banner.openInModal ? 'Abre en modal' : 'Abre en nueva vista'}
                    </span>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
