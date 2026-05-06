/**
 * Parse an API datetime string as UTC and return it formatted in the browser's local timezone.
 * API strings are produced in UTC and typically look like "2026-05-06T03:00:00" or
 * "2026-05-06 03:00:00" (no timezone info). Without explicit UTC treatment JS may parse
 * them as local time, so we always append "Z" when there is no existing timezone info.
 *
 * Returns a string like "2026-05-06 05:00:00" in local time, or the original value
 * on parse failure.
 */
export function formatLocalDateTime(value) {
  if (!value) return "";
  const str = String(value).trim().replace(" ", "T");
  // If no timezone info is present, treat as UTC
  const utcStr = /[Zz]$|[+-]\d{2}:\d{2}$/.test(str) ? str : str + "Z";
  const d = new Date(utcStr);
  if (isNaN(d.getTime())) return value;
  const pad = (n) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  );
}
