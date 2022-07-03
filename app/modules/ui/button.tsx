import { Link, LinkProps } from "@remix-run/react"
import clsx from "clsx"
import { ReactNode } from "react"

export type ButtonProps = {
  type?: "button" | "submit" | "reset"
  variant?: "default" | "ghost"
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  shape?: "default" | "square" | "circle"
  label: ReactNode
  icon?: ReactNode
  onClick?: (event: React.MouseEvent) => void
  renderContainer?: (props: ButtonContainerProps) => ReactNode
}

export type ButtonContainerProps = {
  type: "button" | "submit" | "reset"
  className: string
  children: ReactNode
  onClick?: (event: React.MouseEvent) => void
}

export function Button({
  type = "button",
  variant = "default",
  size = "md",
  shape = "default",
  label,
  icon,
  onClick,
  renderContainer = (props) => <button {...props} />,
}: ButtonProps) {
  const variantClass = {
    default: clsx``,
    ghost: clsx`btn-ghost`,
  }[variant]

  const sizeClass = {
    xs: clsx`btn-xs`,
    sm: clsx`btn-sm`,
    md: clsx``,
    lg: clsx`btn-lg`,
    xl: clsx`btn-xl`,
  }[size]

  const shapeClass = {
    default: clsx``,
    square: clsx`btn-square`,
    circle: clsx`btn-circle`,
  }[shape]

  return (
    <>
      {renderContainer({
        type,
        className: clsx("btn gap-2", variantClass, sizeClass, shapeClass),
        children: (
          <>
            {icon}
            {label}
          </>
        ),
        onClick,
      })}
    </>
  )
}

Button.renderRouterLink =
  (linkProps: LinkProps) =>
  ({ type, ...buttonProps }: ButtonContainerProps) =>
    <Link {...linkProps} {...buttonProps} />
