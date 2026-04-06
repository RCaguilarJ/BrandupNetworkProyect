import { Link } from 'react-router';

export default function SettingsBreadcrumb({
  currentLabel,
}: {
  currentLabel: string;
}) {
  const isSettingsRoot = currentLabel === 'Ajustes';

  return (
    <div className="flex items-center gap-3 pt-[3px] text-[12px] text-[#1f2933]">
      <Link to="/dashboard" className="transition hover:text-[#0d8bff]">
        Inicio
      </Link>
      <span>/</span>
      {isSettingsRoot ? (
        <span className="text-[#0d8bff]">Ajustes</span>
      ) : (
        <>
          <Link to="/settings" className="transition hover:text-[#0d8bff]">
            Ajustes
          </Link>
          <span>/</span>
          <span className="text-[#0d8bff]">{currentLabel}</span>
        </>
      )}
    </div>
  );
}
