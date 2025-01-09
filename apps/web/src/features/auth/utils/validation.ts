export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return 'Password must be at least 8 characters'
  }
  
  if (!/\d/.test(password)) {
    return 'Password must include at least one number'
  }
  
  if (!/[a-zA-Z]/.test(password)) {
    return 'Password must include at least one letter'
  }
  
  return null
}

export function validateEmail(email: string): string | null {
  if (!email) {
    return 'Email is required'
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address'
  }

  return null
} 