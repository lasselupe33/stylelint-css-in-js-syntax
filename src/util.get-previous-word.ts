const WHITESPACE_CHARS = [" ", "\n", "\t", "\r"];

export function getPreviousWord(str: string, currentIndex: number): string {
  const prevWordChars = [] as string[];
  let hasEncounteredText = false;

  for (let i = currentIndex - 1; i >= 0; i--) {
    const currentChar = str[i];

    if (!currentChar || WHITESPACE_CHARS.includes(currentChar)) {
      if (hasEncounteredText) {
        return prevWordChars.join("");
      } else {
        continue;
      }
    }

    hasEncounteredText = true;
    prevWordChars.unshift(currentChar);
  }

  return prevWordChars.join("");
}
