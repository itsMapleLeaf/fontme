import clsx from "clsx"
import { useFontLoader } from "~/modules/fonts/font-loader"

export function FontPreviewText({
  family,
  variant,
  text,
}: {
  family: string
  variant: { weight: string; style: string }
  text: string
}) {
  const loadStatus = useFontLoader(family, variant, text)
  return (
    <span
      style={{
        fontFamily: family,
        fontWeight: variant.weight,
        fontStyle: variant.style,
      }}
      className={clsx(
        "transition duration-200 ease-out",
        loadStatus === "loaded"
          ? "opacity-100 translate-x-0"
          : "opacity-0 translate-x-2",
      )}
    >
      {text}
    </span>
  )
}
