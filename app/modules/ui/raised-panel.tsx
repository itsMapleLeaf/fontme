import clsx from "clsx"
import { ReactNode } from "react"

export function RaisedPanel({
  darker = false,
  rounded = true,
  fullHeight = false,
  children,
}: {
  darker?: boolean
  rounded?: boolean
  fullHeight?: boolean
  children?: ReactNode
}) {
  return (
    <div
      className={clsx(
        "shadow-md",
        darker ? "bg-base-200" : "bg-base-100",
        rounded && "rounded-md overflow-clip",
        fullHeight && "h-full",
      )}
    >
      {children}
    </div>
  )
}
