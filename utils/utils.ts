export function formatTag(input: string) {
  return input
    .trim() // Remove leading and trailing spaces
    .replace(/\s+/g, '_') // Replace one or more spaces with an underscore
    .toLowerCase(); // Convert the entire string to lowercase
}

export function validateTag(input: string): boolean {
  // Check for empty input or leading/trailing spaces
  if (!input.trim() || input !== input.trim()) {
    return false;
  }

  // Regular expression to check if the tag contains only letters and spaces
  const tagPattern = /^[a-zA-Z ]+$/; // allows only letters and spaces
  return tagPattern.test(input);
}
