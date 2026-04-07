const weekdayLabels: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

export function formatShortDate(input: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(input));
}

export function formatWeekday(input: string) {
  return weekdayLabels[input.toLowerCase()] ?? input;
}

export function getWeekStart(referenceDate: Date) {
  const start = new Date(referenceDate);
  const day = start.getDay();
  const offset = day === 0 ? -6 : 1 - day;

  start.setDate(start.getDate() + offset);
  start.setHours(0, 0, 0, 0);

  return start;
}

export function addDays(referenceDate: Date, daysToAdd: number) {
  const nextDate = new Date(referenceDate);
  nextDate.setDate(nextDate.getDate() + daysToAdd);
  return nextDate;
}