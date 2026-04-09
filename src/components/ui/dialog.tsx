"use client"

import * as React from "react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

interface DialogContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DialogContext = React.createContext<DialogContextValue>({
  open: false,
  onOpenChange: () => {},
})

function Dialog({
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  defaultOpen = false,
}: {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultOpen?: boolean
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen
  const onOpenChange = isControlled
    ? controlledOnOpenChange ?? (() => {})
    : setUncontrolledOpen

  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  )
}

function DialogTrigger({
  children,
  className,
  ...props
}: React.ComponentProps<"button">) {
  const { onOpenChange } = React.useContext(DialogContext)
  return (
    <button
      data-slot="dialog-trigger"
      type="button"
      className={className}
      onClick={() => onOpenChange(true)}
      {...props}
    >
      {children}
    </button>
  )
}

function DialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const { open, onOpenChange } = React.useContext(DialogContext)
  const dialogRef = React.useRef<HTMLDialogElement>(null)

  React.useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open) {
      dialog.showModal()
    } else {
      dialog.close()
    }
  }, [open])

  React.useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const handleClose = () => {
      onOpenChange(false)
    }

    const handleClick = (e: MouseEvent) => {
      if (e.target === dialog) {
        onOpenChange(false)
      }
    }

    dialog.addEventListener("close", handleClose)
    dialog.addEventListener("click", handleClick)
    return () => {
      dialog.removeEventListener("close", handleClose)
      dialog.removeEventListener("click", handleClick)
    }
  }, [onOpenChange])

  return (
    <dialog
      ref={dialogRef}
      data-slot="dialog-overlay"
      className="backdrop:bg-black/50 backdrop:backdrop-blur-[2px] bg-transparent p-0 open:flex open:items-center open:justify-center fixed inset-0 m-0 h-dvh max-h-dvh w-dvw max-w-none"
    >
      <div
        data-slot="dialog-content"
        className={cn(
          "bg-background relative mx-auto flex w-full max-w-lg flex-col gap-4 rounded-lg border p-6 shadow-lg",
          "animate-in fade-in-0 zoom-in-95 duration-200",
          className
        )}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {children}
        <button
          data-slot="dialog-close"
          type="button"
          className="ring-offset-background focus:ring-ring absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none cursor-pointer"
          onClick={() => onOpenChange(false)}
        >
          <X className="size-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </dialog>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

function DialogTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function DialogClose({
  children,
  className,
  ...props
}: React.ComponentProps<"button">) {
  const { onOpenChange } = React.useContext(DialogContext)
  return (
    <button
      data-slot="dialog-close-button"
      type="button"
      className={className}
      onClick={() => onOpenChange(false)}
      {...props}
    >
      {children}
    </button>
  )
}

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
}
