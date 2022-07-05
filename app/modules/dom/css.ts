/** tagged template string for highlighting/formatting */
export const css = (
  constants: TemplateStringsArray,
  ...variables: unknown[]
) => {
  let result = []
  for (let i = 0; i < constants.length; i++) {
    result.push(constants[i])
    if (i < variables.length) {
      result.push(variables[i])
    }
  }
  return result.join("")
}
