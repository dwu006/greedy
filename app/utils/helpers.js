/**
 * Get a random color from predefined set of colors
 * @returns {string} - Color name
 */
export function getRandomColor() {
  const colors = [
    'forest',
    'blue',
    'green',
    'purple',
    'amber',
    'teal',
    'pink',
    'indigo',
    'orange',
    'emerald'
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
}
