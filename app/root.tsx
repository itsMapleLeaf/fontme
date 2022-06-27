import type { MetaFunction } from "@remix-run/node"
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

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "fontme",
  description: "Generate optimized fonts and CSS for self-hosting Google Fonts",
  viewport: "width=device-width,initial-scale=1",
})

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

export const CatchBoundary: CatchBoundaryComponent = (props) => {
  const response = useCatch()
  return (
    <main>
      <h1>oops, something went wrong</h1>
      <p>{response.statusText}</p>
    </main>
  )
}
