import type { LinksFunction, MetaFunction } from "@remix-run/node"
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
} from "@remix-run/react"
import type { CatchBoundaryComponent } from "@remix-run/react/routeModules"
import tailwind from "./tailwind.css"

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "fontme",
  description: "Generate optimized fonts and CSS for self-hosting Google Fonts",
  viewport: "width=device-width,initial-scale=1",
})

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: tailwind },
]

function Document({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-slate-900 text-slate-50">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

export default function App() {
  return (
    <Document>
      <Outlet />
    </Document>
  )
}

export const CatchBoundary: CatchBoundaryComponent = (props) => {
  const response = useCatch()
  return (
    <Document>
      <main>
        <h1>oops, something went wrong</h1>
        <p>{response.statusText}</p>
      </main>
    </Document>
  )
}
