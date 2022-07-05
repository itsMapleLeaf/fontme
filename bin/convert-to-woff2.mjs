#!/usr/bin/env node
// @ts-check
import { compress } from "wawoff2"

const input = []
for await (const inputChunk of process.stdin) {
  input.push(inputChunk)
}
const inputBuffer = Buffer.concat(input)

const result = await compress(inputBuffer)
const chunkSize = 1024 * 1024 * 10
for (let i = 0; i < result.length; i += chunkSize) {
  process.stdout.write(result.slice(i, i + chunkSize))
}
