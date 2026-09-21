"use client"

import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"

/**
 * Wraps a manually-toggled dropdown/popover panel (`{open && <div>...}`) with a
 * fade + rise + scale entrance/exit. Used for the chrome panels that aren't built
 * on the Base UI primitives (which already animate their own popups/dialogs).
 */
export function AnimatedDropdown({
  open, children, className, align = "right", origin = "top",
}: {
  open: boolean
  children: React.ReactNode
  className?: string
  align?: "left" | "right"
  origin?: "top" | "bottom"
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: origin === "top" ? -6 : 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: origin === "top" ? -6 : 6 }}
          transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: `${origin} ${align}` }}
          className={cn(
            "absolute z-50 bg-popover border border-border rounded-xl shadow-2xl overflow-hidden",
            align === "right" ? "right-0" : "left-0",
            origin === "top" ? "top-full mt-2" : "bottom-full mb-2",
            className,
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
