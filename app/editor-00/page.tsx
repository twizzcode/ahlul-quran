"use client"

import { useState } from "react"
import type { SerializedEditorState } from "lexical"

import { Editor } from "@/components/blocks/editor-00/editor"

const initialHtml = `
  <h2>Editor Artikel Lengkap</h2>
  <p>Gunakan toolbar di atas untuk mengatur heading, font, ukuran, list, tautan, alignment, dan upload gambar.</p>
  <p><strong>Tip:</strong> editor ini sudah siap dipakai untuk artikel dan berita di admin.</p>
`

export default function EditorPage() {
  const [html, setHtml] = useState(initialHtml)
  const [serialized, setSerialized] = useState<SerializedEditorState | null>(null)

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Editor 00</h1>
        <p className="text-sm text-muted-foreground">
          Demo editor lengkap untuk artikel dan berita.
        </p>
      </div>

      <Editor
        html={html}
        onHtmlChange={setHtml}
        onSerializedChange={setSerialized}
        placeholder="Mulai menulis konten..."
        imageUploadFolder="articles/content"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-2 rounded-xl border bg-card p-4">
          <h2 className="text-lg font-semibold">Output HTML</h2>
          <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap break-words rounded-lg bg-muted p-4 text-xs leading-6">
            {html}
          </pre>
        </section>

        <section className="space-y-2 rounded-xl border bg-card p-4">
          <h2 className="text-lg font-semibold">Serialized State</h2>
          <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap break-words rounded-lg bg-muted p-4 text-xs leading-6">
            {serialized ? JSON.stringify(serialized, null, 2) : "Belum ada perubahan"}
          </pre>
        </section>
      </div>
    </div>
  )
}
