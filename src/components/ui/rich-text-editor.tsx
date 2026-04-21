import { Placeholder } from "@tiptap/extension-placeholder";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  IndentDecrease,
  IndentIncrease,
  Italic,
  Link2,
  List,
  ListOrdered,
  Underline,
} from "lucide-react";
import { type ReactNode, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DEFAULT_COLORS = [
  "#000000",
  "#374151",
  "#dc2626",
  "#ea580c",
  "#ca8a04",
  "#16a34a",
  "#2563eb",
  "#7c3aed",
  "#db2777",
];

function ToolbarIconButton(props: {
  label: string;
  pressed?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  const { label, pressed, disabled, onClick, children } = props;
  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      aria-label={label}
      aria-pressed={pressed}
      disabled={disabled}
      className={cn(pressed && "bg-muted")}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

export function RichTextEditor(props: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  editorClassName?: string;
}) {
  const { value, onChange, placeholder, disabled, className, editorClassName } =
    props;

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        blockquote: false,
        code: false,
        codeBlock: false,
        heading: false,
        horizontalRule: false,
        strike: false,
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
        },
      }),
      TextStyle,
      Color,
      Placeholder.configure({
        placeholder: placeholder ?? "",
      }),
    ],
    editable: !disabled,
    content: value || "",
    editorProps: {
      attributes: {
        class: cn(
          "min-h-[7.5rem] max-w-none px-2 py-1.5 text-sm outline-none",
          editorClassName,
        ),
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [editor, disabled]);

  useEffect(() => {
    if (!editor) {
      return;
    }
    const current = editor.getHTML();
    if (current !== value) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) {
    return (
      <div
        className={cn(
          "rich-text-editor-root border-input bg-background min-h-[7.5rem] rounded-md border",
          className,
        )}
        aria-hidden
      />
    );
  }

  const canSink = editor.can().sinkListItem("listItem");
  const canLift = editor.can().liftListItem("listItem");

  return (
    <div
      className={cn(
        "rich-text-editor-root border-input bg-background flex flex-col overflow-hidden rounded-md border",
        disabled && "pointer-events-none opacity-60",
        className,
      )}
    >
      <div
        className="border-input flex flex-wrap gap-0.5 border-b bg-muted/30 p-1"
        role="toolbar"
        aria-label="Formatação"
      >
        <ToolbarIconButton
          label="Negrito"
          pressed={editor.isActive("bold")}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="size-4" aria-hidden />
        </ToolbarIconButton>
        <ToolbarIconButton
          label="Itálico"
          pressed={editor.isActive("italic")}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="size-4" aria-hidden />
        </ToolbarIconButton>
        <ToolbarIconButton
          label="Sublinhado"
          pressed={editor.isActive("underline")}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <Underline className="size-4" aria-hidden />
        </ToolbarIconButton>
        <ToolbarIconButton
          label="Link"
          pressed={editor.isActive("link")}
          disabled={disabled}
          onClick={() => {
            const previous =
              (editor.getAttributes("link").href as string | undefined) ?? "";
            const next = window.prompt("URL do link", previous || "https://");
            if (next === null) {
              return;
            }
            if (next.trim() === "") {
              editor.chain().focus().extendMarkRange("link").unsetLink().run();
              return;
            }
            editor
              .chain()
              .focus()
              .extendMarkRange("link")
              .setLink({ href: next.trim() })
              .run();
          }}
        >
          <Link2 className="size-4" aria-hidden />
        </ToolbarIconButton>
        <ToolbarIconButton
          label="Lista com marcadores"
          pressed={editor.isActive("bulletList")}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="size-4" aria-hidden />
        </ToolbarIconButton>
        <ToolbarIconButton
          label="Lista numerada"
          pressed={editor.isActive("orderedList")}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="size-4" aria-hidden />
        </ToolbarIconButton>
        <ToolbarIconButton
          label="Aumentar recuo"
          disabled={disabled || !canSink}
          onClick={() => editor.chain().focus().sinkListItem("listItem").run()}
        >
          <IndentIncrease className="size-4" aria-hidden />
        </ToolbarIconButton>
        <ToolbarIconButton
          label="Diminuir recuo"
          disabled={disabled || !canLift}
          onClick={() => editor.chain().focus().liftListItem("listItem").run()}
        >
          <IndentDecrease className="size-4" aria-hidden />
        </ToolbarIconButton>
        <label className="ml-1 flex cursor-pointer items-center gap-1">
          <span className="sr-only">Cor do texto</span>
          <input
            type="color"
            aria-label="Cor do texto"
            disabled={disabled}
            className="border-input size-8 cursor-pointer rounded border bg-transparent p-0.5 disabled:cursor-not-allowed"
            value={
              (editor.getAttributes("textStyle").color as string | undefined) ||
              "#000000"
            }
            onChange={(e) => {
              editor.chain().focus().setColor(e.target.value).run();
            }}
          />
        </label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs"
          disabled={disabled}
          onClick={() => editor.chain().focus().unsetColor().run()}
        >
          Limpar cor
        </Button>
        {DEFAULT_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            title={c}
            disabled={disabled}
            className="border-input size-6 shrink-0 rounded border disabled:opacity-50"
            style={{ backgroundColor: c }}
            onClick={() => editor.chain().focus().setColor(c).run()}
          />
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
