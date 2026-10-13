export function randomInt(
  min: number,
  max: number
) {
  return Math.floor(
    Math.random() *
      (max - min + 1)
  ) + min
}

export function choice<T>(
  items: readonly T[]
): T {
  return items[
    randomInt(
      0,
      items.length - 1
    )
  ]
}

export function shuffle<T>(
  items: readonly T[]
): T[] {
  const result = [...items]

  for (
    let index =
      result.length - 1;
    index > 0;
    index--
  ) {
    const swapIndex =
      randomInt(0, index)

    ;[
      result[index],
      result[swapIndex],
    ] = [
      result[swapIndex],
      result[index],
    ]
  }

  return result
}