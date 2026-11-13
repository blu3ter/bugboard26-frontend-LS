import React from 'react';
import './TagBadge.css';

export interface TagBadgeProps {
  name: string;
  color?: string;
  onRemove?: (name: string) => void;
  size?: 'sm' | 'md';
  className?: string;
}

const VIBRANT_TAG_COLORS = [
  'color-backend',
  'color-frontend',
  'color-security',
  'color-fast',
  'color-uiux',
  'color-amber',
  'color-emerald',
  'color-indigo',
  'color-fuchsia',
  'color-orange',
];

/**
 * Risolve la classe di colore in base al nome del tag o assegna un colore vivace deterministico
 */
const resolveTagColorClass = (tagName: string): string => {
  const normalized = tagName.toLowerCase().replace(/^#/, '').trim();
  switch (normalized) {
    case 'backend':
      return 'color-backend';
    case 'frontend':
      return 'color-frontend';
    case 'security':
      return 'color-security';
    case 'fast':
      return 'color-fast';
    case 'database':
    case 'db':
      return 'color-database';
    case 'urgent':
    case 'urgente':
      return 'color-urgent';
    case 'ui/ux':
    case 'ui':
    case 'ux':
      return 'color-uiux';
    default: {
      let hash = 0;
      for (let i = 0; i < normalized.length; i++) {
        hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
      }
      const index = Math.abs(hash) % VIBRANT_TAG_COLORS.length;
      return VIBRANT_TAG_COLORS[index];
    }
  }
};

/**
 * Componente Atomico TagBadge (Req. 10)
 * Visualizza un'etichetta personalizzabile con stile uniforme.
 * Supporta dimensione 'sm' (ideale per dashboard cards) e 'md' (ideale per modali),
 * con eventuale pulsante di rimozione interattivo.
 */
export const TagBadge: React.FC<TagBadgeProps> = ({
  name,
  color,
  onRemove,
  size = 'md',
  className = '',
}) => {
  const formattedName = name.startsWith('#') ? name : `#${name}`;
  const colorClass = resolveTagColorClass(name);

  // Stile personalizzato inline se è stato passato un colore esadecimale specifico (pieno Bauhaus)
  const customStyle: React.CSSProperties = color
    ? {
        backgroundColor: color,
        borderColor: 'rgba(255, 255, 255, 0.14)',
        color: '#ffffff',
      }
    : {};

  return (
    <span
      className={`tag-badge size-${size} ${colorClass} ${className}`.trim()}
      style={customStyle}
    >
      <span>{formattedName}</span>
      {onRemove && (
        <button
          type="button"
          className="tag-badge-remove-btn"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(name);
          }}
          aria-label={`Rimuovi etichetta ${name}`}
        >
          <svg className="tag-badge-remove-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </span>
  );
};

