import { createCookie } from "@remix-run/node"

const cookie = createCookie("visited", {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
})

export async function getVisited(request: Request) {
  const visited = await cookie.parse(request.headers.get("cookie"))
  return visited === true
}

export async function setVisited(response: Response) {
  response.headers.append("Set-Cookie", await cookie.serialize(true))
  return response
}
