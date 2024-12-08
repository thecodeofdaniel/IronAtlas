export function generateSettId() {
  const timestamp = Date.now(); // Current timestamp in milliseconds
  const randomNum = Math.floor(Math.random() * 10000); // Random number between 0 and 9999
  return Number(`${timestamp}${randomNum}`);
}
