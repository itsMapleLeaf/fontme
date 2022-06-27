import { jsonTyped, useLoaderDataTyped } from "remix-typed"
import { loadFonts } from "~/modules/gfonts/api.server"

export async function loader() {
  return jsonTyped(await loadFonts())
}

export default function Index() {
  const data = useLoaderDataTyped<typeof loader>()
  return (
    <div>
      <ul>
        {data.items.map((font) => (
          <li key={font.family}>{font.family}</li>
        ))}
      </ul>
    </div>
  )
}
