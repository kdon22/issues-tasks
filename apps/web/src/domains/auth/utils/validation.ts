export function validateEmail(email: string) {
  if (!email) return 'Email is required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Please enter a valid email address'
  }
  return null
}

export function validatePassword(password: string) {
  if (!password) return 'Password is required'
  if (password.length < 8) {
    return 'Password must be at least 8 characters'
  }
  return null
} 