export function formatTagOrExercise(input: string) {
  return input
    .trim() // Remove leading and trailing spaces
    .replace(/\s+/g, '_') // Replace one or more spaces with an underscore
    .toLowerCase(); // Convert the entire string to lowercase
}

export function isValidTagOrExercise(_input: string): boolean {
  // Check for empty input or leading/trailing spaces
  if (_input === null || _input === '') return false;

  const input = _input.trim();

  if (input === '') {
    return false;
  }

  // Regular expression to check if the tag contains only letters and spaces
  const pattern = /^[a-zA-Z ]+$/; // allows only letters and spaces
  return pattern.test(input);
}
