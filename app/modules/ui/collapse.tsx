import { ReactNode, useState } from "react"

export type CollapseHeaderProps = {
  visible: boolean
  toggle: () => void
}

const states: Record<string, boolean> = {}

export function Collapse({
  stateKey,
  header,
  children,
}: {
  stateKey?: string
  header: (props: CollapseHeaderProps) => ReactNode
  children: ReactNode
}) {
  const [visible, setVisible] = useState(
    (stateKey && states[stateKey]) || false,
  )
  return (
    <>
      {header({
        visible,
        toggle: () => {
          setVisible(!visible)
          if (stateKey) states[stateKey] = !visible
        },
      })}
      {visible && children}
    </>
  )
}
