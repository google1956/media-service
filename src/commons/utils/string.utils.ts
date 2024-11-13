/**
 * removeVietnameseTones
 *
 * This function removes the Vietnamese tones from a string of text.
 *
 * It does this by first converting the string to its "Normalization Form Decomposition" (NFD) form,
 * which breaks down each character into its base character and any combining characters.
 *
 * Then, it uses a regular expression to remove all the combining characters that indicate a tone.
 * The regular expression is `[\u0300-\u036f]`, which matches all the Unicode characters in the range
 * of U+0300 to U+036F, which are the combining characters for tones in Vietnamese.
 *
 * Finally, it replaces all instances of ' ' and ' ' with 'd' and 'D' respectively.
 *
 * @param {string} str - The string of text to remove the tones from.
 * @returns {string} The string of text with the tones removed.
 */
export function removeVietnameseTones(str: string): string {
  str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Loại bỏ dấu
  str = str.replace(/ /g, 'd').replace(/ /g, 'D'); // Thay thế ' ' và ' ' bằng 'd' và 'D'

  return str;
}

/**
 * Generates a random string of a specified length.
 *
 * @param {number} length - The length of the string to be generated.
 * @returns {string} A random string of the specified length.
 */
export function genRandomString(length: number): string {
  // Create an array of characters to be used in the random string.
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.split('');

  // Create an empty array to store the characters that will make up the
  // random string.
  const random_string = [];

  // Loop the specified number of times and generate a random character
  // each time.
  for (let i = 0; i < length; i++) {
    // Generate a random index into the array of characters.
    const random_chart = Math.floor(Math.random() * chars.length);

    // Push the character at the generated index onto the random string
    // array.
    random_string.push(chars[random_chart]);
  }

  // Join the characters in the array into a single string and return it.
  return random_string.join('');
}
