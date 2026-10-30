import React from 'react';
import './TagBadge.css';

export interface TagBadgeProps {
  name: string;
  color?: string;
  onRemove?: (name: string) => void;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Risolve la classe di colore in base al nome del tag o restituisce default
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
    default:
      return 'color-default';
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

  // Stile personalizzato inline se è stato passato un colore esadecimale specifico
  const customStyle: React.CSSProperties = color
    ? {
        backgroundColor: `${color}20`,
        borderColor: `${color}50`,
        color: color,
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
