export type AlgorithmFixture = {
  name: string
  input: number[]
}

export const algorithmFixtures: readonly AlgorithmFixture[] = [
  { name: 'empty array', input: [] },
  { name: 'single element', input: [9] },
  { name: 'already sorted', input: [1, 2, 3, 4, 5] },
  { name: 'nearly sorted', input: [1, 2, 4, 3, 5, 6] },
  { name: 'reverse sorted', input: [5, 4, 3, 2, 1] },
  { name: 'with duplicates', input: [4, 1, 4, 2, 2] },
  { name: 'repeated values', input: [7, 7, 7, 2, 2, 9, 9] },
  { name: 'mixed values', input: [8, 3, 5, 2, 9, 1] },
]

export const divideAndConquerFixtures: readonly AlgorithmFixture[] = [
  { name: 'merge/quick empty', input: [] },
  { name: 'merge/quick single', input: [4] },
  { name: 'merge/quick nearly sorted', input: [1, 2, 3, 5, 4, 6, 7] },
  { name: 'merge/quick reverse sorted', input: [9, 8, 7, 6, 5, 4, 3, 2] },
  { name: 'merge/quick duplicates', input: [5, 1, 5, 3, 5, 2, 2, 4] },
  { name: 'merge/quick repeated blocks', input: [6, 6, 6, 1, 1, 8, 8, 3] },
  { name: 'merge/quick mixed wide', input: [12, 4, 19, 7, 3, 15, 2, 18, 6] },
]

export const sortAscending = (values: readonly number[]): number[] => {
  return [...values].sort((left, right) => left - right)
}
