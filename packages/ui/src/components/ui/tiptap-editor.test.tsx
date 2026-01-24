import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { TipTapEditor } from './tiptap-editor';

// Mock the TipTap editor as it requires a DOM environment
vi.mock('@tiptap/react', async () => {
  const actual = await vi.importActual('@tiptap/react');
  return {
    ...actual,
    useEditor: vi.fn(() => ({
      chain: () => ({
        focus: () => ({
          toggleBold: () => ({ run: vi.fn() }),
          toggleItalic: () => ({ run: vi.fn() }),
          toggleUnderline: () => ({ run: vi.fn() }),
          toggleHeading: () => ({ run: vi.fn() }),
          toggleBulletList: () => ({ run: vi.fn() }),
          toggleOrderedList: () => ({ run: vi.fn() }),
          toggleBlockquote: () => ({ run: vi.fn() }),
          extendMarkRange: () => ({
            setLink: () => ({ run: vi.fn() }),
          }),
          unsetLink: () => ({ run: vi.fn() }),
        }),
      }),
      isActive: vi.fn(() => false),
      getHTML: vi.fn(() => '<p>Test content</p>'),
      getAttributes: vi.fn(() => ({})),
      commands: {
        setContent: vi.fn(),
      },
      state: {
        selection: { empty: false },
      },
    })),
    EditorContent: () => <div data-testid="editor-content">Editor Content</div>,
  };
});

describe('TipTapEditor', () => {
  it('renders with placeholder', () => {
    render(
      <TipTapEditor
        value=""
        onChange={() => {}}
        placeholder="Enter content here..."
      />
    );

    // The editor should render (mocked)
    expect(screen.getByTestId('editor-content')).toBeInTheDocument();
  });

  it('renders toolbar buttons with aria-labels', () => {
    render(<TipTapEditor value="" onChange={() => {}} />);

    // Text formatting
    expect(screen.getByRole('button', { name: 'Bold' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Italic' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Underline' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Link' })).toBeInTheDocument();

    // Headings
    expect(
      screen.getByRole('button', { name: 'Heading 2' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Heading 3' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Heading 4' })
    ).toBeInTheDocument();

    // Blocks
    expect(
      screen.getByRole('button', { name: 'Bullet list' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Ordered list' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Blockquote' })
    ).toBeInTheDocument();
  });

  it('applies border-error class when error prop is true', () => {
    const { container } = render(
      <TipTapEditor value="" onChange={() => {}} error={true} />
    );

    const editorContainer = container.firstChild as HTMLElement;
    expect(editorContainer).toHaveClass('border-error');
  });

  it('does not apply border-error class when error prop is false', () => {
    const { container } = render(
      <TipTapEditor value="" onChange={() => {}} error={false} />
    );

    const editorContainer = container.firstChild as HTMLElement;
    expect(editorContainer).not.toHaveClass('border-error');
  });

  it('calls onChange when content changes', async () => {
    const handleChange = vi.fn();

    // Re-mock to trigger onChange
    const { useEditor } = await import('@tiptap/react');
    const mockUseEditor = useEditor as ReturnType<typeof vi.fn>;
    mockUseEditor.mockImplementation(
      (config: { onUpdate?: (args: { editor: unknown }) => void }) => {
        // Simulate content update after a short delay
        setTimeout(() => {
          if (config?.onUpdate) {
            config.onUpdate({
              editor: {
                getHTML: () => '<p>Updated content</p>',
              },
            });
          }
        }, 10);

        return {
          chain: () => ({
            focus: () => ({
              toggleBold: () => ({ run: vi.fn() }),
              toggleItalic: () => ({ run: vi.fn() }),
              toggleUnderline: () => ({ run: vi.fn() }),
              toggleHeading: () => ({ run: vi.fn() }),
              toggleBulletList: () => ({ run: vi.fn() }),
              toggleOrderedList: () => ({ run: vi.fn() }),
              toggleBlockquote: () => ({ run: vi.fn() }),
              extendMarkRange: () => ({
                setLink: () => ({ run: vi.fn() }),
              }),
              unsetLink: () => ({ run: vi.fn() }),
            }),
          }),
          isActive: vi.fn(() => false),
          getHTML: vi.fn(() => '<p>Test content</p>'),
          getAttributes: vi.fn(() => ({})),
          commands: {
            setContent: vi.fn(),
          },
          state: {
            selection: { empty: false },
          },
        };
      }
    );

    render(<TipTapEditor value="" onChange={handleChange} />);

    await waitFor(
      () => {
        expect(handleChange).toHaveBeenCalledWith('<p>Updated content</p>');
      },
      { timeout: 100 }
    );
  });

  it('applies custom className', () => {
    const { container } = render(
      <TipTapEditor value="" onChange={() => {}} className="custom-class" />
    );

    const editorContainer = container.firstChild as HTMLElement;
    expect(editorContainer).toHaveClass('custom-class');
  });
});
