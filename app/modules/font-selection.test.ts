import { expect, test } from "vitest"
import {
  encodeFontSelectionSearchParam,
  parseFontSelectionSearchParam,
} from "./font-selection"

test("parseFontSelectionSearchParam", () => {
  expect(
    parseFontSelectionSearchParam("Roboto:400,400italic;Roboto Mono:400,500"),
  ).toEqual({
    "Roboto": ["400", "400italic"],
    "Roboto Mono": ["400", "500"],
  })
})

test("encodeFontSelectionSearchParam", () => {
  expect(
    encodeFontSelectionSearchParam({
      "Roboto": ["400", "400italic"],
      "Roboto Mono": ["400"],
      "Open Sans": [],
    }),
  ).toEqual("Roboto:400,400italic;Roboto Mono:400")
})
