"use client";

import { useMemo, useRef, useState, type ChangeEvent } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { LinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListItemNode,
  ListNode,
} from "@lexical/list";
import { $setBlocksType } from "@lexical/selection";
import {
  $createHeadingNode,
  $createQuoteNode,
  HeadingNode,
  QuoteNode,
} from "@lexical/rich-text";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  type LexicalEditor,
} from "lexical";
import {
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Underline,
  Unlink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentEditable } from "@/components/editor/editor-ui/content-editable";
import { $createImageNode, ImageNode } from "@/components/editor/nodes/image-node";
import { editorTheme } from "@/components/editor/themes/editor-theme";
import { uploadFileToR2 } from "@/lib/upload-client";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeightClassName?: string;
  imageUploadFolder?: string;
  onUploadError?: (message: string) => void;
};

function EditorToolbar({
  imageUploadFolder,
  onUploadError,
}: {
  imageUploadFolder: string;
  onUploadError?: (message: string) => void;
}) {
  const [editor] = useLexicalComposerContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  function setBlockType(type: "paragraph" | "h2" | "h3" | "quote") {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) {
        return;
      }

      if (type === "paragraph") {
        $setBlocksType(selection, () => $createParagraphNode());
        return;
      }

      if (type === "quote") {
        $setBlocksType(selection, () => $createQuoteNode());
        return;
      }

      $setBlocksType(selection, () => $createHeadingNode(type));
    });
  }

  function setLink() {
    const url = window.prompt("Masukkan URL tautan.");
    if (url === null) {
      return;
    }

    const cleanUrl = url.trim();
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, cleanUrl.length > 0 ? cleanUrl : null);
  }

  function removeLink() {
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
  }

  async function insertImage(file: File | null) {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      const message = "File gambar tidak valid.";
      onUploadError?.(message);
      window.alert(message);
      return;
    }

    setIsUploadingImage(true);

    try {
      const cleanSrc = await uploadFileToR2(file, imageUploadFolder);
      const altText = window.prompt("Teks alt gambar (opsional).") ?? "";

      editor.update(() => {
        const selection = $getSelection();
        const imageNode = $createImageNode(cleanSrc, altText.trim());

        if ($isRangeSelection(selection)) {
          selection.insertNodes([imageNode]);
          return;
        }

        $getRoot().append(imageNode);
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal mengupload gambar.";
      onUploadError?.(message);
      window.alert(message);
    } finally {
      setIsUploadingImage(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  function handleImageFileChange(event: ChangeEvent<HTMLInputElement>) {
    void insertImage(event.target.files?.[0] ?? null);
  }

  return (
    <div className="flex flex-wrap gap-2 border-b bg-muted/20 p-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageFileChange}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
        aria-label="Bold"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
        aria-label="Italic"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
        aria-label="Underline"
      >
        <Underline className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setBlockType("h2")}
        aria-label="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setBlockType("h3")}
        aria-label="Heading 3"
      >
        <Heading3 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setBlockType("quote")}
        aria-label="Quote"
      >
        <Quote className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setBlockType("paragraph")}
        aria-label="Paragraph"
      >
        T
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
        aria-label="Bullet List"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
        aria-label="Numbered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      <Button type="button" variant="outline" size="sm" onClick={setLink} aria-label="Insert Link">
        <Link2 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={removeLink}
        aria-label="Remove Link"
      >
        <Unlink className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        aria-label="Upload Image"
        disabled={isUploadingImage}
      >
        <ImagePlus className="h-4 w-4" />
        {isUploadingImage ? "Uploading..." : "Gambar"}
      </Button>
    </div>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Tulis konten artikel...",
  minHeightClassName = "min-h-[340px]",
  imageUploadFolder = "articles/content",
  onUploadError,
}: RichTextEditorProps) {
  const initialValueRef = useRef(value);

  const initialConfig = useMemo(
    () => ({
      namespace: "ArticleEditor",
      theme: editorTheme,
      nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, ImageNode],
      onError(error: Error) {
        console.error(error);
      },
      editorState(editor: LexicalEditor) {
        const initialValue = initialValueRef.current.trim();
        if (!initialValue) {
          return;
        }

        const root = $getRoot();
        root.clear();

        const isHtml = /<\/?[a-z][\s\S]*>/i.test(initialValue);
        if (!isHtml) {
          const paragraph = $createParagraphNode();
          paragraph.append($createTextNode(initialValue));
          root.append(paragraph);
          return;
        }

        const dom = new DOMParser().parseFromString(initialValue, "text/html");
        const nodes = $generateNodesFromDOM(editor, dom);

        if (nodes.length > 0) {
          root.append(...nodes);
          return;
        }

        const paragraph = $createParagraphNode();
        paragraph.append($createTextNode(initialValue));
        root.append(paragraph);
      },
    }),
    []
  );

  return (
    <div className="overflow-hidden rounded-lg border bg-background shadow-sm">
      <LexicalComposer initialConfig={initialConfig}>
        <EditorToolbar
          imageUploadFolder={imageUploadFolder}
          onUploadError={onUploadError}
        />
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              placeholder={placeholder}
              className={`ContentEditable__root relative block w-full overflow-auto px-8 py-4 text-sm leading-relaxed focus:outline-none ${minHeightClassName}`}
              placeholderClassName="text-muted-foreground pointer-events-none absolute left-0 top-0 select-none overflow-hidden px-8 py-[18px] text-ellipsis"
            />
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin />
        <OnChangePlugin
          ignoreSelectionChange
          onChange={(editorState, editor) => {
            editorState.read(() => {
              const html = $generateHtmlFromNodes(editor, null);
              onChange(html);
            });
          }}
        />
      </LexicalComposer>
    </div>
  );
}
