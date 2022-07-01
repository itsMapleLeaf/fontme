import { expect, test } from "vitest"
import { FontSelector } from "./font-selector"

test("fromParamString", () => {
  expect(
    FontSelector.fromParamString("Roboto:400,400italic;Roboto Mono:400,500")
      .selections,
  ).toEqual({
    "Roboto": ["400", "400italic"],
    "Roboto Mono": ["400", "500"],
  })
})

test("toParamString", () => {
  expect(
    new FontSelector({
      "Roboto": ["400", "400italic"],
      "Roboto Mono": ["400"],
      "Open Sans": [],
    }).toParamString(),
  ).toEqual("Roboto:400,400italic;Roboto Mono:400")
})
