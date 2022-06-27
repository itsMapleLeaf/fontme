import { useLoaderData } from "@remix-run/react"
import { googleFontsApiFetch } from "~/modules/gfonts/api.server"

export async function loader() {
  return googleFontsApiFetch()
}

export default function Index() {
  const data: { items: any[] } = useLoaderData()
  return (
    <div>
      <ul>
        {data.items.map((item) => (
          <li key={item.family}>{item.family}</li>
        ))}
      </ul>
    </div>
  )
}
