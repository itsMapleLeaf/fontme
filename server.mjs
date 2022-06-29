// @ts-check
import { App } from "@tinyhttp/app"
import compression from "compression"
import { pinoHttp } from "pino-http"
import sirv from "sirv"
import { handler as ssrHandler } from "./dist/server/entry.mjs"

const port = Number(process.env.PORT || 8080)

new App()
  .use(pinoHttp())
  // @ts-expect-error
  .use(compression())
  .use(sirv("dist/client"))
  .use(ssrHandler)
  .listen(port, () => {
    console.info(`Server started on http://localhost:${port}`)
  })
