export default function timeStampFormat(createdAt) {
  const date = createdAt.toDate();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = String(date.getHours()).padStart(2, 0);
  const minutes = String(date.getMinutes()).padStart(2, 0);
  const createdAtSimple = `${year}-${month}-${day} ${hour}:${minutes}`;
  return createdAtSimple;
}
