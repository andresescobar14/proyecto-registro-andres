const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}\s'’-]*$/u;

export function passwordScore(value) {
  return [value.length >= 8, /[a-z]/.test(value), /[A-Z]/.test(value), /\d/.test(value), /[^\w\s]/u.test(value)].filter(Boolean).length;
}

export function ageOnDate(value, today = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return NaN;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return NaN;
  let age = today.getFullYear() - year;
  if (today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day)) age--;
  return age;
}

/** Passwords are intentionally never trimmed, persisted or sent. */
export function validateField(name, value, values, today = new Date()) {
  const text = String(value ?? '').trim();
  switch (name) {
    case 'name': case 'lastName':
      return text.length >= 2 && text.length <= 60 && NAME_PATTERN.test(text) ? '' : 'Escribe al menos 2 letras; puedes usar tildes y guiones.';
    case 'email': return text.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(text) ? '' : 'Escribe un correo electrónico válido.';
    case 'phone': return /^\+\d{9,15}$/.test(text.replace(/[\s()-]/g, '')) ? '' : 'Incluye el código de país: +58 412 123 4567.';
    case 'cedula': return /^(?:[VE]-?)?\d{6,9}$/i.test(text) ? '' : 'Usa una cédula de 6 a 9 dígitos, por ejemplo V-12345678.';
    case 'birthDate': {
      const age = ageOnDate(text, today);
      return Number.isFinite(age) && age >= 16 && age <= 120 ? '' : 'Introduce una fecha válida; debes tener al menos 16 años.';
    }
    case 'password': return value.length >= 8 && value.length <= 72 && passwordScore(value) === 5 ? '' : 'Usa 8 a 72 caracteres con mayúscula, minúscula, número y símbolo.';
    case 'confirmPassword': return value && value === values.password ? '' : 'Las contraseñas deben coincidir.';
    case 'country': return text ? '' : 'Selecciona un país.';
    case 'city': return text.length >= 2 && text.length <= 100 && /[\p{L}]/u.test(text) ? '' : 'Escribe el nombre de tu ciudad.';
    case 'address': return text.length >= 5 && text.length <= 180 ? '' : 'Escribe una dirección de al menos 5 caracteres.';
    case 'modality': return text ? '' : 'Selecciona una modalidad de estudio.';
    case 'interests': return Array.isArray(value) && value.length ? '' : 'Elige al menos un área de interés.';
    case 'terms': return value === 'on' ? '' : 'Confirma que has leído cómo funciona esta demostración.';
    default: return '';
  }
}
