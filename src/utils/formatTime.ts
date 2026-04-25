export function formatSeconds(seconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function formatMinutes(minutes: number): string {
  const mins = Math.max(0, Math.round(minutes || 0));
  if (mins < 60) {
    return `${mins} dk`;
  }
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  if (remainingMins === 0) {
    return `${hours} sa`;
  }
  return `${hours} sa ${remainingMins} dk`;
}

export function formatDuration(totalMinutes: number): string {
  const mins = Math.max(0, Math.round(totalMinutes));
  if (mins === 0) return '0 dk';
  if (mins < 60) return `${mins} dk`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  if (remainingMins === 0) return `${hours} saat`;
  return `${hours} sa ${remainingMins} dk`;
}

export function formatSecondsLong(seconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function secondsToMinutes(seconds: number): number {
  return Math.floor(seconds / 60);
}

export function minutesToSeconds(minutes: number): number {
  return minutes * 60;
}
