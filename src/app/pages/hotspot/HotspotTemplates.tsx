import { FileText, LayoutTemplate } from 'lucide-react';
import { useViewTheme } from '../../context/ViewThemeContext';
import {
  mikrosystemPageStyle,
  wisphubPageStyle,
} from './hotspotData';

export default function HotspotTemplates() {
  const { viewTheme } = useViewTheme();
  const isWispHub = viewTheme === 'wisphub';

  return (
    <div style={isWispHub ? wisphubPageStyle : mikrosystemPageStyle}>
      {isWispHub ? (
        <header className="border-b border-[#d7dde5] px-3 py-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#45bf63]">
                Hotspot
              </p>
              <h1 className="mt-2 text-[30px] font-semibold text-[#15263b]">
                Plantillas Hotspot
              </h1>
            </div>
            <div className="text-right text-[13px] text-[#6d8093]">
              <span>Inicio</span>
              <span className="mx-2 text-[#b6c1cb]">/</span>
              <span className="font-semibold text-[#45bf63]">Plantillas</span>
            </div>
          </div>
        </header>
      ) : null}

      <section
        className={`${
          isWispHub
            ? 'mx-3 mb-5 border border-[#d7dde5] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.04)]'
            : 'border border-[#d5dde7] bg-white'
        }`}
      >
        {!isWispHub && (
          <div className="bg-[#1f2429] px-6 py-4">
            <h1 className="text-[18px] font-bold uppercase tracking-[0.03em] text-white">
              Plantillas Hotspot
            </h1>
          </div>
        )}

        <div className={isWispHub ? 'px-6 py-8' : 'px-6 py-6'}>
          <div className="mb-6 flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full ${
                isWispHub ? 'bg-[#ecf8ef] text-[#45bf63]' : 'bg-[#e9f1f8] text-[#3f93e7]'
              }`}
            >
              <LayoutTemplate className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-[22px] font-semibold text-[#20324a]">
                Plantillas Hotspot
              </h2>
              <p className="text-[14px] text-[#6d8093]">
                Módulo pendiente por restaurar en esta interfaz.
              </p>
            </div>
          </div>

          <div
            className={`rounded-[10px] border px-6 py-10 text-center ${
              isWispHub
                ? 'border-[#f0d9ad] bg-[#fff7e7]'
                : 'border-[#f3b04e] bg-[#ffe9c2]'
            }`}
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#b1751f] shadow-sm">
              <FileText className="h-5 w-5" />
            </div>
            <p className="text-[18px] text-[#9a6115]">
              Esta vista aún no fue restaurada.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
