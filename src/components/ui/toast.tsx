"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const toastVariants = cva(
  "pointer-events-auto relative flex w-full items-center justify-between gap-4 overflow-hidden rounded-md border p-4 shadow-lg transition-all",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border",
        destructive:
          "bg-destructive text-white border-destructive",
        success:
          "bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface Toast {
  id: string
  title?: string
  description?: string
  variant?: "default" | "destructive" | "success"
  duration?: number
}

interface ToastContextValue {
  toasts: Toast[]
  toast: (props: Omit<Toast, "id">) => void
  dismiss: (id: string) => void
}

const ToastContext = React.createContext<ToastContextValue>({
  toasts: [],
  toast: () => {},
  dismiss: () => {},
})

let toastCount = 0

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = React.useCallback(
    (props: Omit<Toast, "id">) => {
      const id = `toast-${++toastCount}`
      const newToast: Toast = { ...props, id }
      setToasts((prev) => [...prev, newToast])

      const duration = props.duration ?? 5000
      setTimeout(() => {
        dismiss(id)
      }, duration)

      return id
    },
    [dismiss]
  )

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastViewport toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  )
}

function ToastViewport({
  toasts,
  dismiss,
}: {
  toasts: Toast[]
  dismiss: (id: string) => void
}) {
  if (toasts.length === 0) return null

  return (
    <div
      data-slot="toast-viewport"
      className="fixed bottom-4 right-4 z-[100] flex max-h-screen w-full max-w-sm flex-col gap-2"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
      ))}
    </div>
  )
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast
  onDismiss: (id: string) => void
}) {
  return (
    <div
      data-slot="toast"
      className={cn(
        toastVariants({ variant: toast.variant }),
        "animate-in slide-in-from-bottom-full fade-in-0"
      )}
    >
      <div className="flex flex-col gap-1">
        {toast.title && (
          <div data-slot="toast-title" className="text-sm font-semibold">
            {toast.title}
          </div>
        )}
        {toast.description && (
          <div
            data-slot="toast-description"
            className="text-sm opacity-90"
          >
            {toast.description}
          </div>
        )}
      </div>
      <button
        data-slot="toast-close"
        type="button"
        className="shrink-0 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none cursor-pointer"
        onClick={() => onDismiss(toast.id)}
      >
        <X className="size-4" />
        <span className="sr-only">Close</span>
      </button>
    </div>
  )
}

function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }

  // Support both toast("message", "variant") and toast({ title, variant }) patterns
  const wrappedToast = React.useCallback(
    (propsOrMessage: Omit<Toast, "id"> | string, variant?: "default" | "destructive" | "success") => {
      if (typeof propsOrMessage === "string") {
        return context.toast({ title: propsOrMessage, variant: variant || "default" })
      }
      return context.toast(propsOrMessage)
    },
    [context]
  )

  return {
    toast: wrappedToast,
    dismiss: context.dismiss,
    toasts: context.toasts,
  }
}

export { ToastProvider, useToast, toastVariants, type Toast }
