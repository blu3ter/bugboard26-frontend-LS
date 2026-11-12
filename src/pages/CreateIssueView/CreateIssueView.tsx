import React, { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, ClipboardEvent, FormEvent, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { issueService } from '../../service/issueService';
import './CreateIssueView.css';

type IssueType = 'bug' | 'feature' | 'question' | 'documentation';

interface AttachmentFile {
  name: string;
  size: string;
  file: File;
}

interface FormErrors {
  title?: string;
  description?: string;
  issueType?: string;
}

const MAX_FILE_SIZE_BYTES = 1 * 1024 * 1024; // 1 MB (matches backend Issue.image limit)
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif'];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function serializeNodeToMarkdown(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return (node.textContent || '').replace(/\u200B/g, '');
  }
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return '';
  }

  const el = node as HTMLElement;
  const tag = el.tagName;
  const childrenMd = Array.from(el.childNodes).map(serializeNodeToMarkdown).join('');

  switch (tag) {
    case 'BR':
      return '\n';
    case 'B':
    case 'STRONG':
      return childrenMd.trim() ? `**${childrenMd}**` : childrenMd;
    case 'I':
    case 'EM':
      return childrenMd.trim() ? `*${childrenMd}*` : childrenMd;
    case 'CODE':
      return childrenMd.trim() ? `\`${childrenMd}\`` : childrenMd;
    case 'LI':
      return `- ${childrenMd.replace(/\n+$/, '')}\n`;
    case 'UL':
    case 'OL':
      return `\n${childrenMd}`;
    case 'DIV':
    case 'P':
      return `\n${childrenMd}`;
    default:
      return childrenMd;
  }
}

function serializeEditorToMarkdown(editor: HTMLElement): string {
  const raw = Array.from(editor.childNodes).map(serializeNodeToMarkdown).join('');
  return raw.replace(/^\n+/, '').replace(/\n{3,}/g, '\n\n').trim();
}

export const CreateIssueView: React.FC = () => {
  const navigate = useNavigate();

  // Form States
  const [title, setTitle] = useState('');
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

  // Attachment States
  const [attachment, setAttachment] = useState<AttachmentFile | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Validation & Submit States
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Rich Editor Active States
  const [isBoldActive, setIsBoldActive] = useState(false);
  const [isItalicActive, setIsItalicActive] = useState(false);
  const [isCodeActive, setIsCodeActive] = useState(false);
  const [isListActive, setIsListActive] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    navigate('/dashboard/my-issues');
  };

  // Helper: check if current selection is inside a specific tag inside the editor
  const findClosestTagInEditor = (tagName: string): HTMLElement | null => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection || selection.rangeCount === 0) return null;

    let node: Node | null = selection.anchorNode;
    while (node && node !== editor) {
      if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).tagName === tagName) {
        return node as HTMLElement;
      }
      node = node.parentNode;
    }
    return null;
  };

  const syncToolbarState = () => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection || selection.rangeCount === 0) return;

    const anchorNode = selection.anchorNode;
    if (!anchorNode || !editor.contains(anchorNode)) return;

    try {
      setIsBoldActive(document.queryCommandState('bold'));
      setIsItalicActive(document.queryCommandState('italic'));
      setIsListActive(document.queryCommandState('insertUnorderedList'));
    } catch {
      // Ignore browser command state query edge cases
    }
    setIsCodeActive(Boolean(findClosestTagInEditor('CODE')));
  };

  useEffect(() => {
    const handleSelectionChange = () => {
      syncToolbarState();
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  const getDescriptionText = (): string => {
    const editor = editorRef.current;
    if (!editor) return '';
    return editor.innerText.replace(/\u200B/g, '');
  };

  const handleEditorInput = () => {
    const editor = editorRef.current;
    if (!editor) return;

    const cleanText = editor.innerText.replace(/\u200B/g, '').trim();
    if (cleanText === '' && !editor.querySelector('ul, ol')) {
      editor.innerHTML = '';
    }

    if (cleanText.length > 0 && formErrors.description) {
      setFormErrors((prev) => ({ ...prev, description: undefined }));
    }
    syncToolbarState();
  };

  const applyRichCommand = (command: 'bold' | 'italic' | 'insertUnorderedList') => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    document.execCommand(command, false);
    syncToolbarState();
  };

  const handleToggleCode = () => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const existingCode = findClosestTagInEditor('CODE');

    if (existingCode) {
      if (range.collapsed) {
        const textContent = existingCode.textContent?.replace(/\u200B/g, '') || '';
        const parent = existingCode.parentNode;
        if (!parent) return;

        if (textContent === '') {
          parent.removeChild(existingCode);
        } else {
          const spacer = document.createTextNode('\u200B');
          if (existingCode.nextSibling) {
            parent.insertBefore(spacer, existingCode.nextSibling);
          } else {
            parent.appendChild(spacer);
          }
          const nextRange = document.createRange();
          nextRange.setStart(spacer, 1);
          nextRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(nextRange);
        }
      } else {
        const textNode = document.createTextNode(existingCode.textContent || '');
        existingCode.parentNode?.replaceChild(textNode, existingCode);
        const nextRange = document.createRange();
        nextRange.selectNodeContents(textNode);
        selection.removeAllRanges();
        selection.addRange(nextRange);
      }
    } else {
      const codeEl = document.createElement('code');
      if (range.collapsed) {
        const zwsp = document.createTextNode('\u200B');
        codeEl.appendChild(zwsp);
        range.insertNode(codeEl);
        const nextRange = document.createRange();
        nextRange.setStart(zwsp, 1);
        nextRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(nextRange);
      } else {
        const selectedText = range.toString();
        codeEl.textContent = selectedText;
        range.deleteContents();
        range.insertNode(codeEl);
        const nextRange = document.createRange();
        nextRange.selectNodeContents(codeEl);
        selection.removeAllRanges();
        selection.addRange(nextRange);
      }
    }

    syncToolbarState();
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

  // File Upload Validation & Handler
  const handleSelectedFile = (file: File) => {
    const isValidType =
      ALLOWED_IMAGE_TYPES.includes(file.type) ||
      /\.(png|jpe?g|gif)$/i.test(file.name);

    if (!isValidType) {
      setAttachmentError('Unsupported format. Please select a PNG, JPG or GIF image.');
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setAttachmentError('File size exceeds the 1MB backend limit.');
      return;
    }

    setAttachmentError(null);
    setAttachment({
      name: file.name,
      size: formatFileSize(file.size),
      file,
    });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleSelectedFile(file);
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleSelectedFile(file);
    }
  };

  const handleModalPaste = (e: ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          const extension = file.type.split('/')[1] || 'png';
          const namedFile =
            file.name && file.name !== 'image.png'
              ? file
              : new File([file], `screenshot-${Date.now()}.${extension}`, { type: file.type });
          handleSelectedFile(namedFile);
          return;
        }
      }
    }
  };

  const handleEditorPaste = (e: ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          return; // Let handleModalPaste handle image clipboard paste
        }
      }
    }
    e.preventDefault();
    const plainText = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, plainText);
  };

  // Submit Handler with Required Field Validation & Backend API Call
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const errors: FormErrors = {};
    if (!title.trim()) {
      errors.title = 'Title is required.';
    }
    if (!getDescriptionText().trim()) {
      errors.description = 'Description is required.';
    }
    if (!issueType) {
      errors.issueType = 'Please select an issue type.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      if (errors.title) {
        titleInputRef.current?.focus();
      } else if (errors.description) {
        editorRef.current?.focus();
      }
      return;
    }

    setFormErrors({});
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const descriptionMarkdown = editorRef.current
        ? serializeEditorToMarkdown(editorRef.current)
        : getDescriptionText().trim();

      await issueService.createIssue(
        {
          title: title.trim(),
          description: descriptionMarkdown,
          isUrgent,
          type: issueType.toUpperCase(),
          tagNames: labels,
        },
        attachment?.file
      );

      navigate('/dashboard/all-issues');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create issue.');
    } finally {
      setIsSubmitting(false);
    }
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
      <div className="create-issue-overlay" onClick={handleClose} onPaste={handleModalPaste}>
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
          <form className="modal-form custom-scroll" onSubmit={handleSubmit} noValidate>
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
                      Max 120 characters{' '}
                      <span className={`title-char-counter ${title.length >= 120 ? 'is-max' : ''}`}>
                        ({title.length}/120)
                      </span>
                    </span>
                  </div>
                  <input
                    ref={titleInputRef}
                    id="issue-title"
                    name="issue-title"
                    type="text"
                    className={`title-input ${formErrors.title ? 'is-invalid' : ''}`}
                    placeholder="Enter a descriptive title for the issue or request..."
                    maxLength={120}
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (e.target.value.trim() && formErrors.title) {
                        setFormErrors((prev) => ({ ...prev, title: undefined }));
                      }
                    }}
                    required
                  />
                  {formErrors.title && <span className="field-error-msg">{formErrors.title}</span>}
                </div>

                {/* Description & WYSIWYG Rich Text Editor */}
                <div className="form-field flex-grow-field">
                  <label className="field-label" htmlFor="issue-description">
                    Description <span className="required-mark">*</span>
                  </label>
                  <div className={`editor-container flex-grow-editor ${formErrors.description ? 'is-invalid' : ''}`}>
                    <div className="editor-toolbar">
                      <button
                        type="button"
                        className={`editor-toolbar-btn ${isBoldActive ? 'is-active' : ''}`}
                        title="Bold"
                        aria-pressed={isBoldActive}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => applyRichCommand('bold')}
                      >
                        <i className="ph-bold ph-text-b"></i>
                      </button>
                      <button
                        type="button"
                        className={`editor-toolbar-btn ${isItalicActive ? 'is-active' : ''}`}
                        title="Italic"
                        aria-pressed={isItalicActive}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => applyRichCommand('italic')}
                      >
                        <i className="ph-bold ph-text-italic"></i>
                      </button>
                      <span className="editor-toolbar-divider"></span>
                      <button
                        type="button"
                        className={`editor-toolbar-btn font-code ${isCodeActive ? 'is-active' : ''}`}
                        title="Inline code"
                        aria-pressed={isCodeActive}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={handleToggleCode}
                      >
                        &lt;/&gt;
                      </button>
                      <button
                        type="button"
                        className={`editor-toolbar-btn ${isListActive ? 'is-active' : ''}`}
                        title="Bullet list"
                        aria-pressed={isListActive}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => applyRichCommand('insertUnorderedList')}
                      >
                        <i className="ph-bold ph-list-bullets"></i>
                      </button>
                    </div>
                    <div
                      id="issue-description"
                      ref={editorRef}
                      role="textbox"
                      aria-multiline="true"
                      aria-required="true"
                      contentEditable
                      suppressContentEditableWarning
                      className="editor-textarea"
                      data-placeholder="Describe the issue in detail, precise steps to reproduce, expected behavior..."
                      onInput={handleEditorInput}
                      onKeyUp={syncToolbarState}
                      onMouseUp={syncToolbarState}
                      onFocus={syncToolbarState}
                      onPaste={handleEditorPaste}
                    />
                  </div>
                  {formErrors.description && (
                    <span className="field-error-msg">{formErrors.description}</span>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: Classification, Labels, Urgency, Attachments */}
              <div className="modal-col-sidebar">
                {/* Issue Type */}
                <div className="form-field">
                  <label className="field-label">
                    Issue Type <span className="required-mark">*</span>
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
                  {formErrors.issueType && (
                    <span className="field-error-msg">{formErrors.issueType}</span>
                  )}
                </div>

                {/* Labels & Scope */}
                <div className="form-field">
                  <div className="field-header">
                    <label className="field-label">Labels &amp; Scope</label>
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

                {/* Priority & Urgency Section */}
                <div className="form-field">
                  <label className="field-label">Priority &amp; Urgency Level</label>
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
                    <label className="field-label">Attach a screenshot</label>
                    <span className="field-hint">PNG, JPG or GIF up to 1MB</span>
                  </div>

                  {/* Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".png,.jpg,.jpeg,.gif,image/png,image/jpeg,image/gif"
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
                          onClick={() => {
                            setAttachment(null);
                            setAttachmentError(null);
                          }}
                        >
                          <i className="ph-bold ph-x"></i>
                        </button>
                      </div>
                    )}
                  </div>
                  {attachmentError && <span className="field-error-msg">{attachmentError}</span>}
                </div>
              </div>
            </div>

            {/* Hidden Submit for Enter Key trigger */}
            <button type="submit" style={{ display: 'none' }} aria-hidden="true" />
          </form>

          {submitError && (
            <div className="submit-error-banner" role="alert">
              {submitError}
            </div>
          )}

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
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                <i className="ph-bold ph-paper-plane-tilt"></i>
                <span>{isSubmitting ? 'Creating...' : 'Create Issue'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
