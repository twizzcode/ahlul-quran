"use client"

import { useMemo } from "react"
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html"
import {
  type InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer"
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin"
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  type EditorState as LexicalEditorState,
  type LexicalEditor,
  type SerializedEditorState,
} from "lexical"

import { editorTheme } from "@/components/editor/themes/editor-theme"
import { TooltipProvider } from "@/components/ui/tooltip"

import { nodes } from "./nodes"
import { Plugins } from "./plugins"

type EditorProps = {
  editorState?: LexicalEditorState
  editorSerializedState?: SerializedEditorState
  html?: string
  placeholder?: string
  minHeightClassName?: string
  imageUploadFolder?: string
  onPendingImageAdd?: (file: File, previewUrl: string) => void
  onChange?: (editorState: LexicalEditorState) => void
  onSerializedChange?: (editorSerializedState: SerializedEditorState) => void
  onHtmlChange?: (html: string) => void
  onUploadError?: (message: string) => void
}

const baseEditorConfig: InitialConfigType = {
  namespace: "Editor00",
  theme: editorTheme,
  nodes,
  onError: (error: Error) => {
    console.error(error)
  },
}

export function Editor({
  editorState,
  editorSerializedState,
  html,
  placeholder,
  minHeightClassName,
  imageUploadFolder,
  onPendingImageAdd,
  onChange,
  onSerializedChange,
  onHtmlChange,
  onUploadError,
}: EditorProps) {
  const initialConfig = useMemo<InitialConfigType>(() => {
    if (editorState) {
      return {
        ...baseEditorConfig,
        editorState,
      }
    }

    if (editorSerializedState) {
      return {
        ...baseEditorConfig,
        editorState: JSON.stringify(editorSerializedState),
      }
    }

    if (html) {
      return {
        ...baseEditorConfig,
        editorState(editor: LexicalEditor) {
          const initialValue = html.trim()
          if (!initialValue) {
            return
          }

          const root = $getRoot()
          root.clear()

          const isHtml = /<\/?[a-z][\s\S]*>/i.test(initialValue)
          if (!isHtml) {
            const paragraph = $createParagraphNode()
            paragraph.append($createTextNode(initialValue))
            root.append(paragraph)
            return
          }

          const dom = new DOMParser().parseFromString(initialValue, "text/html")
          const parsedNodes = $generateNodesFromDOM(editor, dom)

          if (parsedNodes.length > 0) {
            root.append(...parsedNodes)
            return
          }

          const paragraph = $createParagraphNode()
          paragraph.append($createTextNode(initialValue))
          root.append(paragraph)
        },
      }
    }

    return baseEditorConfig
  }, [editorSerializedState, editorState, html])

  return (
    <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
      <LexicalComposer initialConfig={initialConfig}>
        <TooltipProvider>
          <Plugins
            placeholder={placeholder}
            minHeightClassName={minHeightClassName}
            imageUploadFolder={imageUploadFolder}
            onPendingImageAdd={onPendingImageAdd}
            onUploadError={onUploadError}
          />

          <OnChangePlugin
            ignoreSelectionChange={true}
            onChange={(nextEditorState, editor) => {
              onChange?.(nextEditorState)
              onSerializedChange?.(nextEditorState.toJSON())

              if (onHtmlChange) {
                nextEditorState.read(() => {
                  onHtmlChange($generateHtmlFromNodes(editor, null))
                })
              }
            }}
          />
        </TooltipProvider>
      </LexicalComposer>
    </div>
  )
}
