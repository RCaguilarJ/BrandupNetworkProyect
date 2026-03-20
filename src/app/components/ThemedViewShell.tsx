import { ReactNode } from 'react';
import { useViewTheme } from '../context/ViewThemeContext';
import { cn } from '../lib/utils';

type ThemedViewTone =
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'neutral';

export interface ThemedViewStat {
  label: string;
  value: string | number;
  helper?: string;
  icon?: ReactNode;
  tone?: ThemedViewTone;
}

interface ThemedViewShellProps {
  title: string;
  description: string;
  eyebrow?: string;
  stats?: ThemedViewStat[];
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

interface ThemedViewPanelProps {
  children: ReactNode;
  className?: string;
}

export function ThemedViewShell({
  title,
  description,
  eyebrow,
  stats,
  actions,
  children,
  className,
  contentClassName,
}: ThemedViewShellProps) {
  const { viewTheme } = useViewTheme();

  return (
    <div
      className={cn(
        'themed-view-shell',
        `themed-view-shell--${viewTheme}`,
        className,
      )}
    >
      <div className="themed-view-shell__orb themed-view-shell__orb--one" />
      <div className="themed-view-shell__orb themed-view-shell__orb--two" />

      <section className="themed-view-hero">
        <div className="themed-view-hero__content">
          {eyebrow ? (
            <span className="themed-view-hero__eyebrow">
              {eyebrow}
            </span>
          ) : null}
          <div className="space-y-2">
            <h1 className="themed-view-hero__title">{title}</h1>
            <p className="themed-view-hero__description">
              {description}
            </p>
          </div>
        </div>

        {actions ? (
          <div className="themed-view-hero__actions">{actions}</div>
        ) : null}
      </section>

      {stats?.length ? (
        <div className="themed-view-stats">
          {stats.map((stat) => (
            <article
              key={`${stat.label}-${stat.value}`}
              className={cn(
                'themed-view-stat',
                stat.tone
                  ? `themed-view-stat--${stat.tone}`
                  : undefined,
              )}
            >
              {stat.icon ? (
                <div className="themed-view-stat__icon">
                  {stat.icon}
                </div>
              ) : null}

              <div className="space-y-1">
                <p className="themed-view-stat__label">
                  {stat.label}
                </p>
                <p className="themed-view-stat__value">
                  {stat.value}
                </p>
                {stat.helper ? (
                  <p className="themed-view-stat__helper">
                    {stat.helper}
                  </p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : null}

      <div
        className={cn(
          'themed-view-content',
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function ThemedViewPanel({
  children,
  className,
}: ThemedViewPanelProps) {
  return (
    <section
      className={cn('themed-view-panel', className)}
    >
      {children}
    </section>
  );
}
