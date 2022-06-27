import { jsonTyped, useLoaderDataTyped } from "remix-typed"
import { loadFonts } from "~/modules/gfonts/api.server"

export async function loader() {
  return jsonTyped(await loadFonts())
}

export default function Index() {
  const data = useLoaderDataTyped<typeof loader>()
  return (
    <main className="fixed inset-0 flex">
      <section className="bg-slate-800 overflow-y-auto shadow-md">
        {data.items.map((font) => (
          <p key={font.family}>{font.family}</p>
        ))}
      </section>
      <section className="flex-1 min-w-0 p-4">
        <div className="bg-slate-800 rounded-md p-4 shadow-md">test</div>
      </section>
    </main>
  )
}
