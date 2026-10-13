declare module "nerdamer/all.min" {
  type NerdamerSubstitutions = Record<
    string,
    string | number
  >

  type NerdamerExpression = {
    toString: () => string

    text: (
      mode?: string
    ) => string

    evaluate: (
      substitutions?: NerdamerSubstitutions
    ) => NerdamerExpression
  }

  type Nerdamer = {
    (
      expression: string,
      substitutions?: NerdamerSubstitutions
    ): NerdamerExpression

    convertFromLaTeX: (
      expression: string
    ) => NerdamerExpression

    convertToLaTeX: (
      expression: string
    ) => NerdamerExpression
  }

  const nerdamer: Nerdamer

  export default nerdamer
}