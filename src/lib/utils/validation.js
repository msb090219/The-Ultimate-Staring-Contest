export function sanitizePlayerName(name) {
  if (!name) return 'Anonymous';

  return name
    .trim()
    .substring(0, 20) // Max length
    .replace(/[<>"']/g, '') // Remove dangerous characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    || 'Anonymous'; // Fallback
}

export function validateName(name) {
  if (!name || name.length < 1) {
    return { valid: false, error: 'Please enter your name' };
  }

  if (name.length > 20) {
    return { valid: false, error: 'Name must be 20 characters or less' };
  }

  if (!/^[a-zA-Z0-9\s-]+$/.test(name)) {
    return { valid: false, error: 'Name can only contain letters, numbers, spaces, and hyphens' };
  }

  return { valid: true };
}

export function validateCalibration(criteria) {
  const results = {};

  for (const [key, value] of Object.entries(criteria)) {
    results[key] = {
      passed: value.passed,
      message: value.message || ''
    };
  }

  const allPassed = Object.values(results).every(r => r.passed);

  return {
    allPassed,
    results
  };
}
