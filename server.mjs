import http from "http"
import { handler as ssrHandler } from "./dist/server/entry.mjs"

const server = http.createServer((req, res) => {
  ssrHandler(req, res, (err) => {
    if (err) {
      res.writeHead(500)
      res.end(err.toString())
    } else {
      // Serve your static assets here maybe?
      // 404?
      res.writeHead(404)
      res.end()
    }
  })
})

const port = process.env.PORT || 8080
server.listen(port, () => {
  console.info(`Server started on http://localhost:${port}`)
})
