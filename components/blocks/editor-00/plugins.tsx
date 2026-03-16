"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentProps,
  type ReactNode,
} from "react"
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { ListPlugin } from "@lexical/react/LexicalListPlugin"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import {
  $isLinkNode,
  TOGGLE_LINK_COMMAND,
} from "@lexical/link"
import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from "@lexical/list"
import {
  $getSelectionStyleValueForProperty,
  $patchStyleText,
  $setBlocksType,
} from "@lexical/selection"
import {
  $createHeadingNode,
  $createQuoteNode,
  HeadingNode,
  QuoteNode,
} from "@lexical/rich-text"
import { mergeRegister } from "@lexical/utils"
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Eraser,
  Heading2,
  Heading3,
  ImagePlus,
  IndentIncrease,
  IndentDecrease,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Subscript,
  Superscript,
  Type,
  Underline,
  Undo2,
  Unlink,
} from "lucide-react"
import {
  $getRoot,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_LOW,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  INDENT_CONTENT_COMMAND,
  OUTDENT_CONTENT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from "lexical"

import { ContentEditable } from "@/components/editor/editor-ui/content-editable"
import { $createImageNode } from "@/components/editor/nodes/image-node"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { uploadFileToR2 } from "@/lib/upload-client"

type PluginsProps = {
  placeholder?: string
  minHeightClassName?: string
  imageUploadFolder?: string
  onUploadError?: (message: string) => void
  onPendingImageAdd?: (file: File, previewUrl: string) => void
}

type BlockType = "paragraph" | "h2" | "h3" | "quote" | "bullet" | "number"
type Alignment = "left" | "center" | "right" | "justify"

function ToolbarDivider() {
  return <div className="h-8 w-px bg-border" />
}

function ToolbarButton({
  active = false,
  className,
  ...props
}: ComponentProps<typeof Button> & { active?: boolean }) {
  return (
    <Button
      type="button"
      size="icon-sm"
      variant={active ? "secondary" : "outline"}
      className={cn("h-9 w-9", className)}
      {...props}
    />
  )
}

function ToolbarSelect({
  value,
  onChange,
  className,
  children,
}: {
  value: string
  onChange: (value: string) => void
  className?: string
  children: ReactNode
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={cn(
        "h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40",
        className
      )}
    >
      {children}
    </select>
  )
}

function ToolbarPlugin({
  imageUploadFolder = "articles/content",
  onUploadError,
  onPendingImageAdd,
}: {
  imageUploadFolder?: string
  onUploadError?: (message: string) => void
  onPendingImageAdd?: (file: File, previewUrl: string) => void
}) {
  const [editor] = useLexicalComposerContext()
  const imageInputRef = useRef<HTMLInputElement>(null)
  const colorInputRef = useRef<HTMLInputElement>(null)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [blockType, setBlockType] = useState<BlockType>("paragraph")
  const [alignment, setAlignment] = useState<Alignment>("left")
  const [textColor, setTextColor] = useState("#111827")
  const [isLink, setIsLink] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [formats, setFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    subscript: false,
    superscript: false,
  })

  const applyTextStyle = useCallback(
    (patch: Record<string, string | null>) => {
      editor.update(() => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) {
          return
        }

        $patchStyleText(selection, patch)
      })
    },
    [editor]
  )

  const updateToolbar = useCallback(() => {
    const selection = $getSelection()

    if (!$isRangeSelection(selection)) {
      setIsLink(false)
      return
    }

    setFormats({
      bold: selection.hasFormat("bold"),
      italic: selection.hasFormat("italic"),
      underline: selection.hasFormat("underline"),
      strikethrough: selection.hasFormat("strikethrough"),
      subscript: selection.hasFormat("subscript"),
      superscript: selection.hasFormat("superscript"),
    })

    const colorValue = $getSelectionStyleValueForProperty(selection, "color", "#111827")
    setTextColor(colorValue || "#111827")

    const anchorNode = selection.anchor.getNode()
    const topLevelNode =
      anchorNode.getKey() === "root"
        ? anchorNode
        : anchorNode.getTopLevelElementOrThrow()

    if ($isListNode(topLevelNode)) {
      setBlockType(topLevelNode.getListType() === "number" ? "number" : "bullet")
    } else if (topLevelNode instanceof HeadingNode) {
      const tag = topLevelNode.getTag()
      setBlockType(tag === "h3" ? "h3" : "h2")
    } else if (topLevelNode instanceof QuoteNode) {
      setBlockType("quote")
    } else {
      setBlockType("paragraph")
    }

    if ($isElementNode(topLevelNode)) {
      const format = topLevelNode.getFormatType()
      const normalizedAlignment =
        format === "center" || format === "right" || format === "justify"
          ? format
          : "left"
      setAlignment(normalizedAlignment)
    } else {
      setAlignment("left")
    }

    const parents = [anchorNode, ...anchorNode.getParents()]
    setIsLink(parents.some((node) => $isLinkNode(node)))
  }, [])

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar()
        })
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar()
          return false
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload)
          return false
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload)
          return false
        },
        COMMAND_PRIORITY_LOW
      )
    )
  }, [editor, updateToolbar])

  const setBlock = useCallback(
    (nextBlockType: BlockType) => {
      editor.update(() => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) {
          return
        }

        if (nextBlockType === "bullet") {
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
          return
        }

        if (nextBlockType === "number") {
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
          return
        }

        if (blockType === "bullet" || blockType === "number") {
          editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
        }

        if (nextBlockType === "paragraph") {
          $setBlocksType(selection, () => $createParagraphNode())
          return
        }

        if (nextBlockType === "quote") {
          $setBlocksType(selection, () => $createQuoteNode())
          return
        }

        $setBlocksType(selection, () => $createHeadingNode(nextBlockType))
      })
    },
    [blockType, editor]
  )

  const setLink = useCallback(() => {
    const url = window.prompt("Masukkan URL tautan.")
    if (url === null) {
      return
    }

    const cleanUrl = url.trim()
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, cleanUrl.length > 0 ? cleanUrl : null)
  }, [editor])

  const clearFormatting = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) {
        return
      }

      for (const format of [
        "bold",
        "italic",
        "underline",
        "strikethrough",
        "subscript",
        "superscript",
      ] as const) {
        if (selection.hasFormat(format)) {
          selection.formatText(format)
        }
      }

      $patchStyleText(selection, {
        color: null,
      })

      if (blockType === "bullet" || blockType === "number") {
        editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
      }

      $setBlocksType(selection, () => $createParagraphNode())
      editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")
    })
  }, [blockType, editor])

  const handleImageUpload = useCallback(
    async (file: File | null) => {
      if (!file) {
        return
      }

      if (!file.type.startsWith("image/")) {
        const message = "File gambar tidak valid."
        onUploadError?.(message)
        window.alert(message)
        return
      }

      if (onPendingImageAdd) {
        const previewUrl = URL.createObjectURL(file)
        const altText = window.prompt("Teks alt gambar (opsional).") ?? ""
        onPendingImageAdd(file, previewUrl)

        editor.update(() => {
          const selection = $getSelection()
          const imageNode = $createImageNode(previewUrl, altText.trim())

          if ($isRangeSelection(selection)) {
            selection.insertNodes([imageNode])
            return
          }

          $getRoot().append(imageNode)
        })

        if (imageInputRef.current) {
          imageInputRef.current.value = ""
        }
        return
      }

      setIsUploadingImage(true)

      try {
        const src = await uploadFileToR2(file, imageUploadFolder)
        const altText = window.prompt("Teks alt gambar (opsional).") ?? ""

        editor.update(() => {
          const selection = $getSelection()
          const imageNode = $createImageNode(src, altText.trim())

          if ($isRangeSelection(selection)) {
            selection.insertNodes([imageNode])
            return
          }

          $getRoot().append(imageNode)
        })
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Gagal mengupload gambar."
        onUploadError?.(message)
        window.alert(message)
      } finally {
        setIsUploadingImage(false)
        if (imageInputRef.current) {
          imageInputRef.current.value = ""
        }
      }
    },
    [editor, imageUploadFolder, onPendingImageAdd, onUploadError]
  )

  const handleImageChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      void handleImageUpload(event.target.files?.[0] ?? null)
    },
    [handleImageUpload]
  )

  return (
    <div className="border-b bg-background/95 px-3 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
        <input
          ref={colorInputRef}
          type="color"
          className="sr-only"
          value={textColor}
          onChange={(event) => {
            setTextColor(event.target.value)
            applyTextStyle({ color: event.target.value })
          }}
        />

        <ToolbarButton
          aria-label="Undo"
          disabled={!canUndo}
          onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        >
          <Undo2 />
        </ToolbarButton>
        <ToolbarButton
          aria-label="Redo"
          disabled={!canRedo}
          onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        >
          <Redo2 />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarSelect
          value={blockType}
          onChange={(value) => setBlock(value as BlockType)}
          className="min-w-36"
        >
          <option value="paragraph">Paragraph</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="quote">Quote</option>
          <option value="bullet">Bullet List</option>
          <option value="number">Numbered List</option>
        </ToolbarSelect>

        <ToolbarDivider />

        <ToolbarButton
          active={formats.bold}
          aria-label="Bold"
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
        >
          <Bold />
        </ToolbarButton>
        <ToolbarButton
          active={formats.italic}
          aria-label="Italic"
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
        >
          <Italic />
        </ToolbarButton>
        <ToolbarButton
          active={formats.underline}
          aria-label="Underline"
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
        >
          <Underline />
        </ToolbarButton>
        <ToolbarButton
          active={formats.strikethrough}
          aria-label="Strikethrough"
          onClick={() =>
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")
          }
        >
          <Strikethrough />
        </ToolbarButton>
        <ToolbarButton
          active={formats.subscript}
          aria-label="Subscript"
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "subscript")}
        >
          <Subscript />
        </ToolbarButton>
        <ToolbarButton
          active={formats.superscript}
          aria-label="Superscript"
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "superscript")}
        >
          <Superscript />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          active={isLink}
          aria-label="Tambah tautan"
          onClick={setLink}
        >
          <Link2 />
        </ToolbarButton>
        <ToolbarButton
          aria-label="Hapus tautan"
          onClick={() => editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)}
        >
          <Unlink />
        </ToolbarButton>
        <ToolbarButton
          aria-label="Warna teks"
          onClick={() => colorInputRef.current?.click()}
          className="relative"
        >
          <Type />
          <span
            className="absolute bottom-1 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full"
            style={{ backgroundColor: textColor }}
          />
        </ToolbarButton>
        <ToolbarButton aria-label="Reset format" onClick={clearFormatting}>
          <Eraser />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          active={alignment === "left"}
          aria-label="Rata kiri"
          onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")}
        >
          <AlignLeft />
        </ToolbarButton>
        <ToolbarButton
          active={alignment === "center"}
          aria-label="Rata tengah"
          onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")}
        >
          <AlignCenter />
        </ToolbarButton>
        <ToolbarButton
          active={alignment === "right"}
          aria-label="Rata kanan"
          onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")}
        >
          <AlignRight />
        </ToolbarButton>
        <ToolbarButton
          active={alignment === "justify"}
          aria-label="Justify"
          onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify")}
        >
          <AlignJustify />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          aria-label="Outdent"
          onClick={() => editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined)}
        >
          <IndentDecrease />
        </ToolbarButton>
        <ToolbarButton
          aria-label="Indent"
          onClick={() => editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined)}
        >
          <IndentIncrease />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          active={blockType === "h2"}
          aria-label="Heading 2"
          onClick={() => setBlock("h2")}
        >
          <Heading2 />
        </ToolbarButton>
        <ToolbarButton
          active={blockType === "h3"}
          aria-label="Heading 3"
          onClick={() => setBlock("h3")}
        >
          <Heading3 />
        </ToolbarButton>
        <ToolbarButton
          active={blockType === "quote"}
          aria-label="Quote"
          onClick={() => setBlock("quote")}
        >
          <Quote />
        </ToolbarButton>
        <ToolbarButton
          active={blockType === "bullet"}
          aria-label="Bullet list"
          onClick={() => setBlock("bullet")}
        >
          <List />
        </ToolbarButton>
        <ToolbarButton
          active={blockType === "number"}
          aria-label="Numbered list"
          onClick={() => setBlock("number")}
        >
          <ListOrdered />
        </ToolbarButton>
        <ToolbarButton
          aria-label="Upload gambar"
          disabled={isUploadingImage}
          onClick={() => imageInputRef.current?.click()}
          className="w-auto px-3"
        >
          <ImagePlus />
          <span className="text-xs">{isUploadingImage ? "Uploading..." : "Insert"}</span>
        </ToolbarButton>
      </div>
    </div>
  )
}

export function Plugins({
  placeholder = "Mulai menulis...",
  minHeightClassName = "min-h-[340px]",
  imageUploadFolder,
  onUploadError,
  onPendingImageAdd,
}: PluginsProps) {
  return (
    <div className="relative">
      <ToolbarPlugin
        imageUploadFolder={imageUploadFolder}
        onUploadError={onUploadError}
        onPendingImageAdd={onPendingImageAdd}
      />

      <div className="relative">
        <RichTextPlugin
          contentEditable={
            <div>
              <ContentEditable
                placeholder={placeholder}
                className={cn(
                  "ContentEditable__root relative block w-full overflow-auto px-6 py-4 text-sm leading-7 focus:outline-none",
                  minHeightClassName
                )}
                placeholderClassName="pointer-events-none absolute left-0 top-0 select-none overflow-hidden px-6 py-[18px] text-sm text-muted-foreground"
              />
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin />
      </div>
    </div>
  )
}
