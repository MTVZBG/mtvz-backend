import { Text } from "@medusajs/ui"
import type { ClipboardEvent } from "react"
import { useEffect, useRef } from "react"

type RichTextEditorProps = {
  label: string
  value: string
  onChange: (value: string) => void
  minHeight?: number
}

const toolbarButtonStyle = {
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 6,
  padding: "6px 10px",
  fontSize: 13,
  lineHeight: "18px",
  background: "transparent",
  color: "inherit",
  cursor: "pointer",
} as const

const editorStyle = {
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8,
  padding: 12,
  outline: "none",
  background: "rgba(255,255,255,0.02)",
  lineHeight: 1.6,
} as const

const RichTextEditor = ({
  label,
  value,
  onChange,
  minHeight = 180,
}: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const editor = editorRef.current

    if (!editor || editor.innerHTML === value) {
      return
    }

    editor.innerHTML = value || ""
  }, [value])

  const syncValue = () => {
    const editor = editorRef.current

    if (!editor) {
      return
    }

    onChange(editor.textContent?.trim() ? editor.innerHTML : "")
  }

  const focusEditor = () => {
    editorRef.current?.focus()
  }

  const runCommand = (command: string, commandValue?: string) => {
    focusEditor()
    document.execCommand(command, false, commandValue)
    syncValue()
  }

  const setBlock = (block: "p" | "h2" | "h3") => {
    runCommand("formatBlock", block)
  }

  const addLink = () => {
    const href = window.prompt("Link URL")

    if (!href) {
      return
    }

    runCommand("createLink", href.trim())
  }

  const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault()
    const text = event.clipboardData.getData("text/plain")

    if (!text) {
      return
    }

    document.execCommand("insertText", false, text)
    syncValue()
  }

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <Text>{label}</Text>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          alignItems: "center",
        }}
      >
        <button type="button" style={toolbarButtonStyle} onClick={() => setBlock("p")}>
          Paragraph
        </button>
        <button type="button" style={toolbarButtonStyle} onClick={() => setBlock("h2")}>
          H2
        </button>
        <button type="button" style={toolbarButtonStyle} onClick={() => setBlock("h3")}>
          H3
        </button>
        <button type="button" style={toolbarButtonStyle} onClick={() => runCommand("bold")}>
          B
        </button>
        <button type="button" style={toolbarButtonStyle} onClick={() => runCommand("italic")}>
          I
        </button>
        <button
          type="button"
          style={toolbarButtonStyle}
          onClick={() => runCommand("insertUnorderedList")}
        >
          Bullets
        </button>
        <button
          type="button"
          style={toolbarButtonStyle}
          onClick={() => runCommand("insertOrderedList")}
        >
          Numbers
        </button>
        <button type="button" style={toolbarButtonStyle} onClick={addLink}>
          Link
        </button>
        <button type="button" style={toolbarButtonStyle} onClick={() => runCommand("unlink")}>
          Remove link
        </button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={syncValue}
        onBlur={syncValue}
        onPaste={handlePaste}
        style={{
          ...editorStyle,
          minHeight,
        }}
      />
    </div>
  )
}

export default RichTextEditor
