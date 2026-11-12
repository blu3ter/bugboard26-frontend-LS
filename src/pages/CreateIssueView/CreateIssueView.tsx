import React, { useState, useRef } from 'react';
import type { KeyboardEvent, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateIssueView.css';

type IssueType = 'bug' | 'feature' | 'question' | 'documentation';

interface AttachmentFile {
  name: string;
  size: string;
}

export const CreateIssueView: React.FC = () => {
  const navigate = useNavigate();

  // Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [issueType, setIssueType] = useState<IssueType>('bug');
  const [availableTags, setAvailableTags] = useState<string[]>([
    'backend',
    'frontend',
    'security',
    'ui/ux',
    'fast',
    'urgent',
  ]);
  const [labels, setLabels] = useState<string[]>([]);
  const [isAddingLabel, setIsAddingLabel] = useState(false);
  const [newLabelInput, setNewLabelInput] = useState('');
  const [customTagColors, setCustomTagColors] = useState<Record<string, string>>({});
  const [isUrgent, setIsUrgent] = useState(false);
  const [attachment, setAttachment] = useState<AttachmentFile | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isListActive, setIsListActive] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    navigate('/dashboard/my-issues');
  };

  // Toggle Tag Handler (+ to x rotation)
  const handleToggleTag = (tag: string) => {
    const isUrgentTag = tag.toLowerCase().replace(/^#/, '') === 'urgent';
    if (labels.includes(tag)) {
      setLabels(labels.filter((t) => t !== tag));
      if (isUrgentTag) {
        setIsUrgent(false);
      }
    } else {
      setLabels([...labels, tag]);
      if (isUrgentTag) {
        setIsUrgent(true);
      }
    }
  };

  const handleToggleUrgent = (checked: boolean) => {
    setIsUrgent(checked);
    if (checked) {
      if (!labels.includes('urgent')) {
        setLabels([...labels, 'urgent']);
      }
    } else {
      setLabels(labels.filter((t) => t !== 'urgent' && t !== '#urgent'));
    }
  };

  const RANDOM_TAG_COLORS = [
    'tag-color-backend',
    'tag-color-frontend',
    'tag-color-security',
    'tag-color-fast',
    'tag-color-uiux',
    'tag-color-amber',
    'tag-color-emerald',
    'tag-color-indigo',
    'tag-color-fuchsia',
    'tag-color-orange',
  ];

  const handleSaveCustomLabel = () => {
    let clean = newLabelInput.trim().replace(/^#+/, '');
    if (clean) {
      clean = clean.toLowerCase();
      if (!customTagColors[clean]) {
        const randomColor = RANDOM_TAG_COLORS[Math.floor(Math.random() * RANDOM_TAG_COLORS.length)];
        setCustomTagColors((prev) => ({ ...prev, [clean]: randomColor }));
      }
      if (!availableTags.includes(clean)) {
        setAvailableTags([...availableTags, clean]);
      }
      if (!labels.includes(clean)) {
        setLabels([...labels, clean]);
      }
    }
    setNewLabelInput('');
    setIsAddingLabel(false);
  };

  const handleCustomLabelKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveCustomLabel();
    } else if (e.key === 'Escape') {
      setIsAddingLabel(false);
      setNewLabelInput('');
    }
  };

  // Smart Markdown Formatting Helper
  const applyMarkdown = (prefix: string, suffix: string = prefix) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = description;
    const selectedText = value.substring(start, end);

    if (selectedText.length > 0) {
      // Check if selection is already wrapped with prefix and suffix
      const isWrapped =
        selectedText.startsWith(prefix) &&
        selectedText.endsWith(suffix) &&
        selectedText.length >= prefix.length + suffix.length;

      let nextVal: string;
      let newStart: number;
      let newEnd: number;

      if (isWrapped) {
        // Unwrap
        const unwrapped = selectedText.substring(prefix.length, selectedText.length - suffix.length);
        nextVal = value.substring(0, start) + unwrapped + value.substring(end);
        newStart = start;
        newEnd = start + unwrapped.length;
      } else {
        // Check if surroundings are already prefix/suffix
        const before = start >= prefix.length ? value.substring(start - prefix.length, start) : '';
        const after = end + suffix.length <= value.length ? value.substring(end, end + suffix.length) : '';

        if (before === prefix && after === suffix) {
          nextVal = value.substring(0, start - prefix.length) + selectedText + value.substring(end + suffix.length);
          newStart = start - prefix.length;
          newEnd = newStart + selectedText.length;
        } else {
          // Wrap
          const wrapped = `${prefix}${selectedText}${suffix}`;
          nextVal = value.substring(0, start) + wrapped + value.substring(end);
          newStart = start + prefix.length;
          newEnd = newStart + selectedText.length;
        }
      }

      setDescription(nextVal);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newStart, newEnd);
      }, 0);
    } else {
      // No text selected: insert prefix and suffix and place cursor in between (e.g. **|**)
      const replacement = `${prefix}${suffix}`;
      const nextVal = value.substring(0, start) + replacement + value.substring(end);
      setDescription(nextVal);

      setTimeout(() => {
        textarea.focus();
        const cursorInside = start + prefix.length;
        textarea.setSelectionRange(cursorInside, cursorInside);
      }, 0);
    }
  };

  // Bullet List Toggle
  const handleToggleList = () => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = description;

    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = value.indexOf('\n', end);
    const currentLine = value.substring(lineStart, lineEnd === -1 ? value.length : lineEnd);
    const isCurrentLineBullet = /^(\s*[•\-*]\s+)/.test(currentLine);

    let nextValue: string;
    let newCursorPos: number;

    if (isCurrentLineBullet) {
      const replacedLine = currentLine.replace(/^(\s*)[•\-*]\s+/, '$1');
      nextValue = value.substring(0, lineStart) + replacedLine + (lineEnd === -1 ? '' : value.substring(lineEnd));
      newCursorPos = Math.max(lineStart, start - 2);
      setIsListActive(false);
    } else {
      const bullet = '• ';
      const replacedLine = bullet + currentLine;
      nextValue = value.substring(0, lineStart) + replacedLine + (lineEnd === -1 ? '' : value.substring(lineEnd));
      newCursorPos = start + bullet.length;
      setIsListActive(true);
    }

    setDescription(nextValue);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Auto-continue bullet list on Enter, cancel on empty bullet
  const handleDescriptionKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = description;

    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = value.indexOf('\n', start);
    const currentLine = value.substring(lineStart, lineEnd === -1 ? value.length : lineEnd);
    const bulletMatch = currentLine.match(/^(\s*[•\-*]\s+)(.*)$/);

    if (e.key === 'Enter') {
      if (bulletMatch) {
        e.preventDefault();
        const bulletPrefix = bulletMatch[1];
        const textAfterBullet = bulletMatch[2];

        // Empty bullet line -> exit list mode cleanly
        if (textAfterBullet.trim() === '') {
          const nextValue = value.substring(0, lineStart) + (lineEnd === -1 ? '' : value.substring(lineEnd));
          setDescription(nextValue);
          setIsListActive(false);
          setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(lineStart, lineStart);
          }, 0);
          return;
        }

        // Continue list with new bullet point
        const continuation = `\n${bulletPrefix}`;
        const nextValue = value.substring(0, start) + continuation + value.substring(end);
        setDescription(nextValue);
        setIsListActive(true);
        setTimeout(() => {
          textarea.focus();
          const nextPos = start + continuation.length;
          textarea.setSelectionRange(nextPos, nextPos);
        }, 0);
      }
    } else if (e.key === 'Backspace') {
      // If backspace on an empty bullet line right after the marker -> remove bullet
      if (bulletMatch && bulletMatch[2] === '' && start === lineStart + bulletMatch[1].length) {
        e.preventDefault();
        const nextValue = value.substring(0, lineStart) + (lineEnd === -1 ? '' : value.substring(lineEnd));
        setDescription(nextValue);
        setIsListActive(false);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(lineStart, lineStart);
        }, 0);
      }
    }
  };

  // Sync isListActive state when cursor moves
  const updateActiveFormatting = () => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const value = textarea.value;

    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = value.indexOf('\n', start);
    const currentLine = value.substring(lineStart, lineEnd === -1 ? value.length : lineEnd);
    setIsListActive(/^(\s*[•\-*]\s+)/.test(currentLine));
  };

  // File Upload Handlers
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setAttachment({
        name: file.name,
        size: `${sizeMB} MB`,
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setAttachment({
        name: file.name,
        size: `${sizeMB} MB`,
      });
    }
  };

  // Submit Handler
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Simulate issue creation
    navigate('/dashboard/my-issues');
  };

  // Tag Color Mapper
  const getTagColorClass = (tag: string) => {
    const normalized = tag.toLowerCase().replace(/^#/, '');
    if (customTagColors[normalized]) {
      return customTagColors[normalized];
    }
    switch (normalized) {
      case 'backend':
        return 'tag-color-backend';
      case 'frontend':
        return 'tag-color-frontend';
      case 'security':
        return 'tag-color-security';
      case 'fast':
        return 'tag-color-fast';
      case 'ui/ux':
        return 'tag-color-uiux';
      case 'urgent':
        return 'tag-color-urgent';
      default: {
        let hash = 0;
        for (let i = 0; i < normalized.length; i++) {
          hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % RANDOM_TAG_COLORS.length;
        return RANDOM_TAG_COLORS[index];
      }
    }
  };

  return (
    <div className="create-issue-page-wrapper">
      {/* Background Floating Tags Layer */}
      <div className="issue-bg-layer" aria-hidden="true">
        <div className="bg-floating-tag" style={{ top: '7%', left: '4%', backgroundColor: 'rgba(37, 66, 160, 0.85)' }}>#backend</div>
        <div className="bg-floating-tag" style={{ top: '5%', left: '37%', backgroundColor: 'rgba(204, 26, 40, 0.9)' }}>#dangerous</div>
        <div className="bg-floating-tag" style={{ top: '6%', left: '60%', backgroundColor: 'rgba(51, 65, 85, 0.9)', color: '#e2e8f0' }}>#closed</div>
        <div className="bg-floating-tag" style={{ top: '8%', right: '7%', backgroundColor: 'rgba(220, 38, 38, 0.9)' }}>#hotfix</div>
        <div className="bg-floating-tag" style={{ top: '19%', left: '15%', backgroundColor: 'rgba(234, 88, 12, 0.9)' }}>#open</div>
        <div className="bg-floating-tag" style={{ top: '16%', right: '15%', backgroundColor: 'rgba(2, 132, 199, 0.9)' }}>#frontend</div>
        <div className="bg-floating-tag" style={{ top: '26%', right: '6%', backgroundColor: 'rgba(185, 28, 28, 0.9)' }}>#bug</div>
        <div className="bg-floating-tag" style={{ top: '30%', left: '3%', backgroundColor: 'rgba(225, 29, 72, 0.9)' }}>#urgent</div>
        <div className="bg-floating-tag" style={{ top: '38%', left: '16%', backgroundColor: 'rgba(245, 158, 11, 0.9)', color: '#000', fontWeight: 'bold' }}>#meeting</div>
        <div className="bg-floating-tag" style={{ top: '40%', right: '19%', backgroundColor: 'rgba(124, 58, 237, 0.9)' }}>#question</div>
        <div className="bg-floating-tag" style={{ top: '49%', left: '3%', backgroundColor: 'rgba(13, 148, 136, 0.9)' }}>#fast</div>
        <div className="bg-floating-tag" style={{ top: '49%', right: '6%', backgroundColor: 'rgba(22, 163, 74, 0.9)' }}>#feature</div>
        <div className="bg-floating-tag" style={{ top: '61%', left: '15%', backgroundColor: 'rgba(219, 39, 119, 0.9)' }}>#ui/ux</div>
        <div className="bg-floating-tag" style={{ top: '60%', right: '18%', backgroundColor: 'rgba(14, 165, 233, 0.9)' }}>#in progress</div>
        <div className="bg-floating-tag" style={{ top: '69%', right: '5%', backgroundColor: 'rgba(29, 78, 216, 0.9)' }}>#backend</div>
        <div className="bg-floating-tag" style={{ bottom: '23%', left: '3%', backgroundColor: 'rgba(2, 132, 199, 0.9)' }}>#frontend</div>
        <div className="bg-floating-tag" style={{ bottom: '17%', left: '16%', backgroundColor: 'rgba(21, 128, 61, 0.9)' }}>#feature</div>
        <div className="bg-floating-tag" style={{ bottom: '14%', right: '19%', backgroundColor: 'rgba(13, 148, 136, 0.9)' }}>#fast</div>
        <div className="bg-floating-tag" style={{ bottom: '7%', left: '4%', backgroundColor: 'rgba(2, 132, 199, 0.9)' }}>#devops</div>
        <div className="bg-floating-tag" style={{ bottom: '5%', left: '36%', backgroundColor: 'rgba(217, 119, 6, 0.9)' }}>#chill</div>
        <div className="bg-floating-tag" style={{ bottom: '4%', right: '38%', backgroundColor: 'rgba(185, 28, 28, 0.9)' }}>#bug</div>
      </div>

      {/* Modal Overlay / Backdrop */}
      <div className="create-issue-overlay" onClick={handleClose}>
        {/* Modal Window Container */}
        <div
          className="create-issue-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="modal-header">
            <div className="modal-header-left">
              <div className="modal-header-icon-badge">
                <i className="ph-bold ph-ticket"></i>
              </div>
              <div className="header-title-group">
                <h2 id="modal-title">New Issue</h2>
                <p>Fill in the ticket details to track</p>
              </div>
            </div>
            <button
              type="button"
              className="modal-close-btn"
              aria-label="Close modal"
              onClick={handleClose}
            >
              <i className="ph-bold ph-x"></i>
            </button>
          </div>

          {/* Form Body with 2-Column Grid */}
          <form className="modal-form custom-scroll" onSubmit={handleSubmit}>
            <div className="modal-horizontal-grid">
              {/* LEFT COLUMN: Title & Description */}
              <div className="modal-col-main">
                {/* Title */}
                <div className="form-field">
                  <div className="field-header">
                    <label className="field-label" htmlFor="issue-title">
                      Title <span className="required-mark">*</span>
                    </label>
                    <span className="field-hint">
                      Max 120 characters <span className={`title-char-counter ${title.length >= 120 ? 'is-max' : ''}`}>({title.length}/120)</span>
                    </span>
                  </div>
                  <input
                    id="issue-title"
                    name="issue-title"
                    type="text"
                    className="title-input"
                    placeholder="Enter a descriptive title for the issue or request..."
                    maxLength={120}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                {/* Description & Rich Text Editor */}
                <div className="form-field flex-grow-field">
                  <label className="field-label" htmlFor="issue-description">
                    Description <span className="required-mark">*</span>
                  </label>
                  <div className="editor-container flex-grow-editor">
                    <div className="editor-toolbar">
                      <button
                        type="button"
                        className="editor-toolbar-btn"
                        title="Bold"
                        onClick={() => applyMarkdown('**', '**')}
                      >
                        <i className="ph-bold ph-text-b"></i>
                      </button>
                      <button
                        type="button"
                        className="editor-toolbar-btn"
                        title="Italic"
                        onClick={() => applyMarkdown('*', '*')}
                      >
                        <i className="ph-bold ph-text-italic"></i>
                      </button>
                      <span className="editor-toolbar-divider"></span>
                      <button
                        type="button"
                        className="editor-toolbar-btn font-code"
                        title="Inline code"
                        onClick={() => applyMarkdown('`', '`')}
                      >
                        &lt;/&gt;
                      </button>
                      <button
                        type="button"
                        className={`editor-toolbar-btn ${isListActive ? 'is-active' : ''}`}
                        title="Bullet list"
                        onClick={handleToggleList}
                      >
                        <i className="ph-bold ph-list-bullets"></i>
                      </button>
                      <span className="editor-support-text">Ctrl+B / Ctrl+I</span>
                    </div>
                    <textarea
                      id="issue-description"
                      ref={textareaRef}
                      name="issue-description"
                      className="editor-textarea"
                      placeholder="Describe the issue in detail, precise steps to reproduce, expected behavior... Use • for lists."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      onKeyDown={handleDescriptionKeyDown}
                      onClick={updateActiveFormatting}
                      onKeyUp={updateActiveFormatting}
                      required
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Classification, Labels, Urgency, Attachments */}
              <div className="modal-col-sidebar">
                {/* Issue Type (D6) */}
                <div className="form-field">
                  <label className="field-label">
                    Issue Type (D6) <span className="required-mark">*</span>
                  </label>
                  <div className="type-selector-grid" role="radiogroup" aria-label="Issue Type">
                    {/* Bug */}
                    <label
                      className={`type-radio-card type-bug ${issueType === 'bug' ? 'is-selected' : ''}`}
                      onClick={() => setIssueType('bug')}
                    >
                      <input
                        type="radio"
                        name="issue_type"
                        value="bug"
                        checked={issueType === 'bug'}
                        onChange={() => setIssueType('bug')}
                      />
                      <i className="ph-fill ph-bug type-icon"></i>
                      <span className="type-label">Bug</span>
                    </label>

                    {/* Feature */}
                    <label
                      className={`type-radio-card type-feature ${issueType === 'feature' ? 'is-selected' : ''}`}
                      onClick={() => setIssueType('feature')}
                    >
                      <input
                        type="radio"
                        name="issue_type"
                        value="feature"
                        checked={issueType === 'feature'}
                        onChange={() => setIssueType('feature')}
                      />
                      <i className="ph-bold ph-sparkle type-icon"></i>
                      <span className="type-label">Feature</span>
                    </label>

                    {/* Question */}
                    <label
                      className={`type-radio-card type-question ${issueType === 'question' ? 'is-selected' : ''}`}
                      onClick={() => setIssueType('question')}
                    >
                      <input
                        type="radio"
                        name="issue_type"
                        value="question"
                        checked={issueType === 'question'}
                        onChange={() => setIssueType('question')}
                      />
                      <i className="ph-bold ph-question type-icon"></i>
                      <span className="type-label">Question</span>
                    </label>

                    {/* Documentation */}
                    <label
                      className={`type-radio-card type-docs ${issueType === 'documentation' ? 'is-selected' : ''}`}
                      onClick={() => setIssueType('documentation')}
                    >
                      <input
                        type="radio"
                        name="issue_type"
                        value="documentation"
                        checked={issueType === 'documentation'}
                        onChange={() => setIssueType('documentation')}
                      />
                      <i className="ph-bold ph-file-text type-icon"></i>
                      <span className="type-label">Docs</span>
                    </label>
                  </div>
                </div>

                {/* Labels & Scope (D7) */}
                <div className="form-field">
                  <div className="field-header">
                    <label className="field-label">Labels &amp; Scope (D7)</label>
                    <span className="field-hint">
                      {labels.length === 0 ? 'Click + to select tags' : `${labels.length} selected`}
                    </span>
                  </div>
                  <div className="labels-box-grid">
                    {availableTags.map((tag) => {
                      const isSelected = labels.includes(tag);
                      return (
                        <button
                          type="button"
                          key={tag}
                          className={`selectable-tag-chip ${getTagColorClass(tag)} ${isSelected ? 'is-active' : ''}`}
                          onClick={() => handleToggleTag(tag)}
                          title={isSelected ? `Click to deselect ${tag}` : `Click to select ${tag}`}
                          aria-pressed={isSelected}
                        >
                          <i className="ph-bold ph-plus tag-toggle-icon"></i>
                          <span className="tag-name">{tag}</span>
                        </button>
                      );
                    })}

                    {/* Add Custom Label */}
                    {isAddingLabel ? (
                      <div className="add-label-inline-form">
                        <i className="ph-bold ph-tag add-label-tag-icon"></i>
                        <input
                          type="text"
                          className="add-label-input"
                          placeholder="tag name..."
                          value={newLabelInput}
                          onChange={(e) => setNewLabelInput(e.target.value)}
                          onKeyDown={handleCustomLabelKeyDown}
                          onBlur={handleSaveCustomLabel}
                          autoFocus
                        />
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="btn-add-label-trigger"
                        onClick={() => setIsAddingLabel(true)}
                      >
                        <i className="ph-bold ph-plus-circle"></i>
                        <span>Add tag</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Priority & Urgency Section (D3) */}
                <div className="form-field">
                  <label className="field-label">Priority &amp; Urgency Level (D3)</label>
                  <div className={`urgency-card ${isUrgent ? 'is-active' : ''}`}>
                    <div className="urgency-info">
                      <div className="urgency-icon-box">
                        <i className="ph-bold ph-warning animate-pulse-icon"></i>
                      </div>
                      <div className="urgency-text-group">
                        <div className="urgency-title-row">
                          <span className="urgency-title-text">Mark as URGENT</span>
                          <span className="urgency-badge-block">Blocker</span>
                        </div>
                        <p className="urgency-subtext">
                          Highlights issue with top priority and pins it to the board
                        </p>
                      </div>
                    </div>

                    {/* Switch Toggle */}
                    <label className="urgency-switch">
                      <input
                        type="checkbox"
                        checked={isUrgent}
                        onChange={(e) => handleToggleUrgent(e.target.checked)}
                      />
                      <span className="switch-slider"></span>
                    </label>
                  </div>
                </div>

                {/* Attachments Section */}
                <div className="form-field">
                  <div className="field-header">
                    <label className="field-label">
                      Attach a screenshot <span className="field-optional">(optional)</span>
                    </label>
                    <span className="field-hint">PNG, JPG or GIF up to 10MB</span>
                  </div>

                  {/* Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />

                  <div
                    className={`dropzone-box ${isDragOver ? 'is-dragover' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                  >
                    <div className="dropzone-icon-circle">
                      <i className="ph ph-upload-simple"></i>
                    </div>
                    <p className="dropzone-prompt">
                      <span className="dropzone-link-text">Choose file</span> or drag image here
                    </p>
                    <p className="dropzone-keyboard-hint">
                      You can paste screenshots directly with <kbd className="kbd-badge">Ctrl+V</kbd>
                    </p>

                    {/* Attached File Preview */}
                    {attachment && (
                      <div
                        className="attachment-preview-card"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <i className="ph-fill ph-file-image attachment-preview-icon"></i>
                        <span className="attachment-filename">{attachment.name}</span>
                        <span className="attachment-filesize">({attachment.size})</span>
                        <button
                          type="button"
                          className="attachment-remove-btn"
                          aria-label="Remove attachment"
                          onClick={() => setAttachment(null)}
                        >
                          <i className="ph-bold ph-x"></i>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Hidden Submit for Enter Key trigger */}
            <button type="submit" style={{ display: 'none' }} aria-hidden="true" />
          </form>

          {/* Modal Footer */}
          <div className="modal-footer">
            <div className="footer-visibility-notice">
              <i className="ph-bold ph-shield-check visibility-icon"></i>
              Visible to all authorized collaborators
            </div>
            <div className="footer-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleSubmit}
              >
                <i className="ph-bold ph-paper-plane-tilt"></i>
                <span>Create Issue</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
