export function formatDate(date) {
  // TODO: Add timezone support
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

export function parseJSON(str) {
  try {
    return JSON.parse(str);
  } catch (error) {
    console.log('Error parsing JSON:', error.message);
    return null;
  }
}

export function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}
