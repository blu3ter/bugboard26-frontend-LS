import React, { useState } from 'react';
import { TagBadge } from './TagBadge';
import './TagSelector.css';

export interface TagSelectorProps {
  selectedTags: string[];
  onChange: (newTags: string[]) => void;
  availableSuggestions?: string[];
  readOnly?: boolean;
}

const DEFAULT_SUGGESTIONS = ['backend', 'frontend', 'security', 'ui/ux', 'fast', 'urgent'];

/**
 * Componente Molecolare TagSelector (Req. 10)
 * Consente l'aggiunta interattiva di nuovi tag o la selezione da suggerimenti,
 * e la rimozione di tag esistenti.
 */
export const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTags,
  onChange,
  availableSuggestions = DEFAULT_SUGGESTIONS,
  readOnly = false,
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleAddTag = (rawTag: string) => {
    const cleanTag = rawTag.toLowerCase().replace(/^#/, '').trim();
    if (!cleanTag) return;
    if (!selectedTags.includes(cleanTag)) {
      onChange([...selectedTags, cleanTag]);
    }
    setInputValue('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const cleanTag = tagToRemove.toLowerCase().replace(/^#/, '').trim();
    onChange(selectedTags.filter((t) => t.toLowerCase().replace(/^#/, '') !== cleanTag));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag(inputValue);
    }
  };

  // Suggerimenti non ancora selezionati
  const unselectedSuggestions = availableSuggestions.filter(
    (s) => !selectedTags.some((t) => t.toLowerCase().replace(/^#/, '') === s.toLowerCase())
  );

  return (
    <div className="tag-selector-container">
      {/* Lista tag correntemente selezionati */}
      <div className="tag-selector-active-list">
        {selectedTags.length === 0 && readOnly && (
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Nessuna etichetta</span>
        )}
        {selectedTags.map((tag) => (
          <TagBadge
            key={tag}
            name={tag}
            onRemove={readOnly ? undefined : handleRemoveTag}
            size="md"
          />
        ))}
      </div>

      {!readOnly && (
        <>
          {/* Input per digitare nuovo tag */}
          <div className="tag-selector-add-wrapper">
            <input
              type="text"
              className="tag-selector-input"
              placeholder="Aggiungi etichetta..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              type="button"
              className="tag-selector-btn-add"
              onClick={() => handleAddTag(inputValue)}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
              <span>Aggiungi</span>
            </button>
          </div>

          {/* Suggerimenti rapidi cliccabili */}
          {unselectedSuggestions.length > 0 && (
            <div className="tag-selector-suggestions">
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Suggeriti:</span>
              {unselectedSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className="tag-suggestion-chip"
                  onClick={() => handleAddTag(suggestion)}
                >
                  +{suggestion}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

