function normalizePhone(input) {
  const digits = String(input || '').replace(/\D/g, '');

  if (digits.length === 10) {
    return `91${digits}`;
  }

  if (digits.length === 12 && digits.startsWith('91')) {
    return digits;
  }

  throw new Error('Please enter a valid Indian mobile number.');
}

function displayPhone(phone) {
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  return phone;
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

function cleanString(value, max = 500) {
  return String(value ?? '').trim().slice(0, max);
}

module.exports = {
  normalizePhone,
  displayPhone,
  validEmail,
  cleanString
};
