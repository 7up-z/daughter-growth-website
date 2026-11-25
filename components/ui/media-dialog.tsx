"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { useState } from "react"

export function MediaDialog({
  title, onClose, children,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  const [returnFocus] = useState(() => typeof document === "undefined" ? null : document.activeElement)

  return (
    <Dialog.Root open onOpenChange={(open) => { if (!open) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="media-overlay" />
        <Dialog.Content className="media-dialog" aria-describedby={undefined} onCloseAutoFocus={(event) => {
          if (returnFocus instanceof HTMLElement && returnFocus.isConnected) {
            event.preventDefault()
            returnFocus.focus()
          }
        }}>
          <div className="media-dialog-heading">
            <Dialog.Title className="yearbook-display">{title}</Dialog.Title>
            <Dialog.Close className="family-icon-button" aria-label="关闭">
              <X size={22} aria-hidden="true" />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
