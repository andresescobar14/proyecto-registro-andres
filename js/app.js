import { passwordScore, validateField } from './validation.js';

const form = document.getElementById('registration-form');
const panels = [...document.querySelectorAll('.step-panel')];
const steps = [...document.querySelectorAll('.steps li')];
const next = document.getElementById('next-button');
const back = document.getElementById('back-button');
const summary = document.getElementById('error-summary');
const success = document.getElementById('success-panel');
const fieldNames = [
  ['name', 'lastName', 'email', 'phone', 'cedula', 'birthDate'],
  ['password', 'confirmPassword', 'country', 'city', 'address'],
  ['modality', 'interests', 'terms'],
];
let currentStep = 0;

function readValues() {
  const data = new FormData(form);
  return { ...Object.fromEntries(data), interests: data.getAll('interests') };
}

function showError(name, message) {
  const fields = [...form.querySelectorAll(`[name="${name}"]`)];
  let error = document.getElementById(`${name}-error`);
  if (!error) {
    error = document.createElement('p');
    error.id = `${name}-error`;
    error.className = 'field-error';
    fields[0].closest('.field').append(error);
  }
  error.textContent = message;
  error.hidden = !message;
  fields.forEach(field => {
    field.setAttribute('aria-invalid', String(Boolean(message)));
    const ids = new Set((field.getAttribute('aria-describedby') || '').split(' ').filter(Boolean));
    if (message) ids.add(error.id); else ids.delete(error.id);
    if (ids.size) field.setAttribute('aria-describedby', [...ids].join(' '));
    else field.removeAttribute('aria-describedby');
  });
}

function validateStep() {
  const values = readValues();
  const errors = fieldNames[currentStep].filter(name => {
    const error = validateField(name, values[name], values);
    showError(name, error);
    return Boolean(error);
  });
  summary.hidden = !errors.length;
  summary.textContent = errors.length ? `Revisa ${errors.length === 1 ? 'el campo señalado' : `los ${errors.length} campos señalados`} para continuar.` : '';
  if (errors.length) form.querySelector(`[name="${errors[0]}"]`).focus();
  return !errors.length;
}

function goToStep(index, focus = true) {
  currentStep = index;
  panels.forEach((panel, i) => { panel.hidden = i !== index; });
  steps.forEach((step, i) => {
    if (i === index) step.setAttribute('aria-current', 'step'); else step.removeAttribute('aria-current');
    step.classList.toggle('complete', i < index);
  });
  document.getElementById('step-count').textContent = `PASO 0${index + 1} / 03`;
  back.hidden = index === 0;
  next.firstChild.textContent = index === panels.length - 1 ? 'Validar registro ' : 'Continuar ';
  summary.hidden = true;
  if (focus) panels[index].querySelector('input,select').focus();
}

form.addEventListener('submit', event => {
  event.preventDefault();
  if (!validateStep()) return;
  if (currentStep < panels.length - 1) { goToStep(currentStep + 1); return; }
  // Revalidate all steps: browser autofill or edits must never bypass validation.
  const values = readValues();
  const invalid = fieldNames.findIndex(names => names.some(name => validateField(name, values[name], values)));
  if (invalid >= 0) { goToStep(invalid); validateStep(); return; }
  document.getElementById('success-name').textContent = values.name.trim();
  form.hidden = true;
  success.hidden = false;
  success.focus();
  // Clear credentials immediately; no account is created by this frontend demo.
  form.reset();
});
back.addEventListener('click', () => goToStep(currentStep - 1));
form.addEventListener('focusout', event => {
  if (!fieldNames[currentStep].includes(event.target.name)) return;
  const values = readValues();
  showError(event.target.name, validateField(event.target.name, values[event.target.name], values));
});
form.addEventListener('input', event => {
  const { name } = event.target;
  const values = readValues();
  if (event.target.getAttribute('aria-invalid') === 'true') showError(name, validateField(name, values[name], values));
  if (name === 'password') {
    const score = passwordScore(values.password);
    document.getElementById('strength-fill').style.width = `${score * 20}%`;
    document.getElementById('strength-label').textContent = values.password ? ['Muy débil', 'Muy débil', 'Débil', 'Aceptable', 'Casi lista', 'Contraseña completa'][score] : 'Seguridad de la contraseña';
    if (values.confirmPassword) showError('confirmPassword', validateField('confirmPassword', values.confirmPassword, values));
  }
});
document.querySelectorAll('[data-password-toggle]').forEach(button => button.addEventListener('click', () => {
  const input = document.getElementById(button.dataset.passwordToggle);
  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  button.textContent = show ? 'Ocultar' : 'Ver';
  button.setAttribute('aria-pressed', String(show));
  const suffix = input.name === 'confirmPassword' ? 'confirmación de contraseña' : 'contraseña';
  button.setAttribute('aria-label', `${show ? 'Ocultar' : 'Mostrar'} ${suffix}`);
}));
document.getElementById('restart-button').addEventListener('click', () => {
  success.hidden = true;
  form.hidden = false;
  form.querySelectorAll('[aria-invalid]').forEach(field => field.removeAttribute('aria-invalid'));
  form.querySelectorAll('.field-error').forEach(error => { error.hidden = true; });
  form.querySelectorAll('[data-password-toggle]').forEach(button => {
    const field = document.getElementById(button.dataset.passwordToggle);
    field.type = 'password';
    button.textContent = 'Ver';
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-label', `Mostrar ${field.name === 'confirmPassword' ? 'confirmación de contraseña' : 'contraseña'}`);
  });
  document.getElementById('strength-fill').style.width = '0%';
  document.getElementById('strength-label').textContent = 'Seguridad de la contraseña';
  goToStep(0);
});
const today = new Date();
const dateOnly = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
document.getElementById('birthDate').max = dateOnly(new Date(today.getFullYear() - 16, today.getMonth(), today.getDate()));
document.getElementById('year').textContent = today.getFullYear();
goToStep(0, false);
