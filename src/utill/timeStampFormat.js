export function timeStampFormat(createdAt) {
  const date = createdAt.toDate();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = String(date.getHours()).padStart(2, 0);
  const minutes = String(date.getMinutes()).padStart(2, 0);
  const createdAtSimple = `${year}-${month}-${day} ${hour}:${minutes}`;
  return createdAtSimple;
}
export function timeStampFormatNotHour(createdAt) {
  const date = createdAt.toDate();
  const year = date.getFullYear();
  // month 10 이하면 0 붙여주기
  const month = String(date.getMonth() + 1).padStart(2, 0);
  const day = String(date.getDate()).padStart(2, 0);
  const createdAtSimple = `${year}${month}${day}`;
  return createdAtSimple;
}