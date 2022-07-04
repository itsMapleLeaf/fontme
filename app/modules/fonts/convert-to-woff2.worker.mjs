// @ts-check
import { compress } from "wawoff2"

/**
 * @param {Buffer} input
 * @returns {Promise<ArrayBuffer>}
 */
export default async function convertToWoff2(input) {
  const result = await compress(Buffer.from(input))
  return result.buffer
}
