/**
 * Formats a date string from ISO format to "MMM DD, YYYY" format
 * @param dateString - ISO date string (e.g., "2025-01-17T00:00:00.000Z")
 * @returns Formatted date string (e.g., "Jan 17, 2025")
 */
function dateToReadable(dateString: string): string {
  const date = new Date(dateString);

  // Get month as abbreviated name
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = monthNames[date.getMonth()];

  // Get day and year
  const day = date.getDate();
  const year = date.getFullYear();

  // Return formatted date
  return `${month} ${day}, ${year}`;
}
export default dateToReadable;
