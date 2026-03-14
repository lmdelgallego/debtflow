export function getStartAndEndDate(date: string) {
  const [yearStr, monthStr] = date.split('-');
  const yearNum = parseInt(yearStr, 10);
  const monthNum = parseInt(monthStr, 10);
  const startDate = `${yearStr}-${monthStr}-01`;
  const lastDay = new Date(yearNum, monthNum, 0).getDate();
  const endDate = `${yearStr}-${monthStr}-${lastDay}`;
  return { startDate, endDate };
}
