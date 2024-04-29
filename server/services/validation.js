export function isAlpha(value) {
  return typeof value === 'string' && /^[A-Za-zæøåÆØÅ]+$/.test(value)
}

export function isValidEmail(email) {
  return (
    String(email)
      .toLowerCase()
      .match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/) != null
  )
}

export function isNotEmpty(value) {
  return typeof value === 'string' && value.trim() !== ''
}
