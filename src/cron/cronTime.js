export function convertToCron(time) {
  const [hour, minute] = time.split(":");
  return `${minute} ${hour} * * *`;
}
