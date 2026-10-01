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
  const [labels, setLabels] = useState<string[]>(['#backend', '#frontend', '#security']);
  const [suggestedLabels, setSuggestedLabels] = useState<string[]>(['#fast', '#ui/ux', '#urgent']);
  const [isAddingLabel, setIsAddingLabel] = useState(false);
  const [newLabelInput, setNewLabelInput] = useState('');
  const [isUrgent, setIsUrgent] = useState(true);
  const [attachment, setAttachment] = useState<AttachmentFile | null>({
    name: 'auth_error_screenshot_v2.png',
    size: '1.4 MB',
  });
  const [isDragOver, setIsDragOver] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    navigate('/dashboard/my-issues');
  };

  // Add Label Handlers
  const handleRemoveLabel = (tagToRemove: string) => {
    setLabels(labels.filter((t) => t !== tagToRemove));
    // If it was one of the suggested tags, make it available again
    if (['#fast', '#ui/ux', '#urgent'].includes(tagToRemove) && !suggestedLabels.includes(tagToRemove)) {
      setSuggestedLabels([...suggestedLabels, tagToRemove]);
    }
  };

  const handleAddSuggestedLabel = (tag: string) => {
    if (!labels.includes(tag)) {
      setLabels([...labels, tag]);
      setSuggestedLabels(suggestedLabels.filter((t) => t !== tag));
      if (tag === '#urgent') {
        setIsUrgent(true);
      }
    }
  };

  const handleSaveCustomLabel = () => {
    let clean = newLabelInput.trim();
    if (clean) {
      if (!clean.startsWith('#')) {
        clean = `#${clean}`;
      }
      clean = clean.toLowerCase();
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

  // Markdown Formatting Helper
  const applyMarkdown = (prefix: string, suffix: string = '') => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = description.substring(start, end);
    const replacement = `${prefix}${selectedText || 'text'}${suffix}`;
    const nextVal = description.substring(0, start) + replacement + description.substring(end);
    setDescription(nextVal);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selectedText.length || 4));
    }, 0);
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
    switch (tag.toLowerCase()) {
      case '#backend':
        return 'tag-color-backend';
      case '#frontend':
        return 'tag-color-frontend';
      case '#security':
        return 'tag-color-security';
      case '#fast':
        return 'tag-color-fast';
      case '#ui/ux':
        return 'tag-color-uiux';
      case '#urgent':
        return 'tag-color-urgent';
      default:
        return 'tag-color-default';
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
              <div className="brand-badge">
                <div className="brand-dots">
                  <span className="brand-dot dot-red"></span>
                  <span className="brand-dot dot-amber"></span>
                  <span className="brand-dot dot-blue"></span>
                </div>
                <span className="brand-logo-text">
                  BUGBOARD<span className="brand-num-orange">2</span><span className="brand-num-blue">6</span>
                </span>
              </div>
              <div className="header-divider"></div>
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

          {/* Form Body */}
          <form className="modal-form custom-scroll" onSubmit={handleSubmit}>
            {/* Title */}
            <div className="form-field">
              <div className="field-header">
                <label className="field-label" htmlFor="issue-title">
                  Title <span className="required-mark">*</span>
                </label>
                <span className="field-hint">Max 120 characters</span>
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
            <div className="form-field">
              <label className="field-label" htmlFor="issue-description">
                Description <span className="required-mark">*</span>
              </label>
              <div className="editor-container">
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
                    className="editor-toolbar-btn"
                    title="Bullet list"
                    onClick={() => applyMarkdown('\n- ')}
                  >
                    <i className="ph-bold ph-list-bullets"></i>
                  </button>
                  <span className="editor-support-text">Markdown supported</span>
                </div>
                <textarea
                  id="issue-description"
                  ref={textareaRef}
                  name="issue-description"
                  className="editor-textarea"
                  rows={3}
                  placeholder="Describe the issue in detail, precise steps to reproduce, expected behavior..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                ></textarea>
              </div>
            </div>

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
                  {issueType === 'bug' && (
                    <span className="ping-wrapper">
                      <span className="ping-ring"></span>
                      <span className="ping-core"></span>
                    </span>
                  )}
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
              <label className="field-label">Labels &amp; Scope (D7)</label>
              <div className="labels-box">
                {/* Active selected labels */}
                {labels.map((tag) => (
                  <span key={tag} className={`label-chip ${getTagColorClass(tag)}`}>
                    {tag}
                    <button
                      type="button"
                      className="label-chip-delete"
                      aria-label={`Remove label ${tag}`}
                      onClick={() => handleRemoveLabel(tag)}
                    >
                      <i className="ph-bold ph-x"></i>
                    </button>
                  </span>
                ))}

                {/* Suggested clickable labels */}
                {suggestedLabels.map((tag) => (
                  <span
                    key={tag}
                    className={`label-chip label-chip-suggested ${getTagColorClass(tag)}`}
                    onClick={() => handleAddSuggestedLabel(tag)}
                    title={`Click to add ${tag}`}
                  >
                    {tag}
                  </span>
                ))}

                {/* Add Custom Label */}
                {isAddingLabel ? (
                  <div className="add-label-inline-form">
                    <input
                      type="text"
                      className="add-label-input"
                      placeholder="e.g. #performance"
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
                    <i className="ph-bold ph-plus"></i> Add label...
                  </button>
                )}
              </div>
            </div>

            {/* Priority & Urgency Section (D3) */}
            <div className="form-field">
              <label className="field-label">Priority &amp; Urgency Level (D3)</label>
              <div className="urgency-card">
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
                      Instant notification sent to on-call team &amp; top priority on board
                    </p>
                  </div>
                </div>

                {/* Switch Toggle */}
                <label className="urgency-switch">
                  <input
                    type="checkbox"
                    checked={isUrgent}
                    onChange={(e) => setIsUrgent(e.target.checked)}
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
