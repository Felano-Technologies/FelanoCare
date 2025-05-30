export function getAge(birthDateStr) {
  const today = new Date();
  const [y,m,d] = birthDateStr.split('-').map(Number);
  const b = new Date(y,m-1,d);
  let age = today.getFullYear() - b.getFullYear();
  if (
    today.getMonth() < b.getMonth() ||
    (today.getMonth()===b.getMonth() && today.getDate()<b.getDate())
  ) age--;
  return age;
}

export function getAgeCategory(age) {
  if (age < 17) return 'youth';
  if (age < 60) return 'adult';
  return 'senior';
}
