import {
  Deferrable,
  deferred,
  ErrorBoundaryComponent,
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node"
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  useCatch,
} from "@remix-run/react"
import type { CatchBoundaryComponent } from "@remix-run/react/routeModules"
import { FontDict, loadFonts } from "~/modules/fonts/api.server"
import { pangrams } from "./modules/fonts/pangrams"
import tailwind from "./tailwind.css"

type LoaderData = {
  fonts: Deferrable<FontDict>
  pangrams: string[]
}

export const loader: LoaderFunction = () =>
  deferred<LoaderData>({ fonts: loadFonts(), pangrams })

// don't ever reload this data; it's huge and rarely changes
export const unstable_shouldReload = () => false

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
    <html
      lang="en"
      className="overflow-y-scroll bg-base-300 text-base-content"
      data-theme="dark"
    >
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        {children}
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

export const ErrorBoundary: ErrorBoundaryComponent = ({ error }) => {
  return (
    <Document>
      <main>
        <h1>oops, something went wrong</h1>
        <pre className="overflow-x-auto">{error.stack}</pre>
      </main>
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
