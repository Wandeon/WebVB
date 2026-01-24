'use client';

import * as Popover from '@radix-ui/react-popover';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useCallback, useEffect, useState } from 'react';

import { cn } from '../../lib/utils';

export interface TipTapEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  error?: boolean;
  className?: string;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  'aria-label': string;
  children: React.ReactNode;
}

function ToolbarButton({
  onClick,
  isActive,
  disabled,
  'aria-label': ariaLabel,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        'h-8 w-8 rounded flex items-center justify-center text-sm font-medium transition-colors',
        'hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed',
        isActive && 'bg-primary-100 text-primary-700'
      )}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-6 bg-neutral-300 mx-1" />;
}

function EditorSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="border-b border-neutral-200 bg-neutral-50 p-2 flex gap-1">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-8 w-8 rounded bg-neutral-200" />
        ))}
      </div>
      <div className="p-4 min-h-[300px]">
        <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2" />
        <div className="h-4 bg-neutral-200 rounded w-1/2 mb-2" />
        <div className="h-4 bg-neutral-200 rounded w-2/3" />
      </div>
    </div>
  );
}

export function TipTapEditor({
  value,
  onChange,
  placeholder = '',
  error = false,
  className,
}: TipTapEditorProps) {
  const [linkUrl, setLinkUrl] = useState('');
  const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3, 4],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary-600 underline',
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass:
          'before:content-[attr(data-placeholder)] before:text-neutral-400 before:float-left before:h-0 before:pointer-events-none',
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // Treat empty paragraph as empty string
      if (html === '<p></p>') {
        onChange('');
      } else {
        onChange(html);
      }
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none min-h-[300px] p-4 outline-none focus:outline-none',
      },
    },
  });

  // Sync external value changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      // Only update if the value is genuinely different
      const currentHtml = editor.getHTML();
      const normalizedCurrent = currentHtml === '<p></p>' ? '' : currentHtml;
      const normalizedValue = value === '<p></p>' ? '' : value;

      if (normalizedValue !== normalizedCurrent) {
        editor.commands.setContent(value || '');
      }
    }
  }, [editor, value]);

  const handleAddLink = useCallback(() => {
    if (!editor || !linkUrl) return;

    // If there's no selection, we can't add a link
    if (editor.state.selection.empty) {
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: linkUrl })
      .run();

    setLinkUrl('');
    setIsLinkPopoverOpen(false);
  }, [editor, linkUrl]);

  const handleRemoveLink = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().unsetLink().run();
    setIsLinkPopoverOpen(false);
  }, [editor]);

  const openLinkPopover = useCallback(() => {
    if (!editor) return;

    // Pre-fill with existing link URL if editing
    const attributes = editor.getAttributes('link') as { href?: string };
    const previousUrl = attributes.href;
    setLinkUrl(previousUrl ?? '');
    setIsLinkPopoverOpen(true);
  }, [editor]);

  if (!editor) {
    return (
      <div
        className={cn(
          'rounded-md border bg-white',
          error
            ? 'border-error'
            : 'border-neutral-300 focus-within:ring-2 focus-within:ring-primary-500',
          className
        )}
      >
        <EditorSkeleton />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-md border bg-white',
        error
          ? 'border-error'
          : 'border-neutral-300 focus-within:ring-2 focus-within:ring-primary-500',
        className
      )}
    >
      {/* Toolbar */}
      <div className="border-b border-neutral-200 bg-neutral-50 p-2 flex flex-wrap gap-1">
        {/* Text formatting group */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          aria-label="Bold"
        >
          B
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          aria-label="Italic"
        >
          <span className="italic">I</span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          aria-label="Underline"
        >
          <span className="underline">U</span>
        </ToolbarButton>

        <Popover.Root open={isLinkPopoverOpen} onOpenChange={setIsLinkPopoverOpen}>
          <Popover.Trigger asChild>
            <button
              type="button"
              onClick={openLinkPopover}
              aria-label="Link"
              className={cn(
                'h-8 w-8 rounded flex items-center justify-center text-sm font-medium transition-colors',
                'hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed',
                editor.isActive('link') && 'bg-primary-100 text-primary-700'
              )}
            >
              <span role="img" aria-hidden="true">
                &#128279;
              </span>
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              className="z-50 w-72 rounded-md border border-neutral-200 bg-white p-4 shadow-md"
              sideOffset={5}
            >
              <div className="flex flex-col gap-2">
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="flex h-9 w-full rounded-md border border-neutral-300 bg-white px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddLink();
                    }
                  }}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAddLink}
                    disabled={!linkUrl}
                    className="flex-1 h-8 rounded-md bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Dodaj
                  </button>
                  {editor.isActive('link') && (
                    <button
                      type="button"
                      onClick={handleRemoveLink}
                      className="flex-1 h-8 rounded-md border border-neutral-300 bg-white text-sm font-medium hover:bg-neutral-50"
                    >
                      Ukloni
                    </button>
                  )}
                </div>
              </div>
              <Popover.Arrow className="fill-white" />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        <ToolbarDivider />

        {/* Headings group */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          aria-label="Heading 2"
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          aria-label="Heading 3"
        >
          H3
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          isActive={editor.isActive('heading', { level: 4 })}
          aria-label="Heading 4"
        >
          H4
        </ToolbarButton>

        <ToolbarDivider />

        {/* Blocks group */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          aria-label="Bullet list"
        >
          <span role="img" aria-hidden="true">
            &#8226;
          </span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          aria-label="Ordered list"
        >
          1.
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          aria-label="Blockquote"
        >
          <span role="img" aria-hidden="true">
            &#10077;
          </span>
        </ToolbarButton>
      </div>

      {/* Editor content */}
      <EditorContent editor={editor} />
    </div>
  );
}
