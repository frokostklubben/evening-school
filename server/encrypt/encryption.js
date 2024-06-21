// Reused code from earlier project

import bcrypt from 'bcrypt'
import crypto from 'crypto'

export async function hashPassword(plainTextPassword) {
  const saltRounds = 14
  const hashedPassword = await bcrypt.hash(plainTextPassword, saltRounds)
  return hashedPassword
}

export async function comparePassword(plainTextPassword, hashedPassword) {
  const match = await bcrypt.compare(plainTextPassword, hashedPassword)
  return match
}

export async function randomPassword() {
  let randomPassword = '0'
  try {
    randomPassword = crypto.randomBytes(16).toString('hex')
  } catch (error) {
    console.error(error)
  }
  return randomPassword
}

// To make an admin user, run the console log with the hashPassword, by running the 2.line in the terminal:
// console.log(await hashPassword('PASSWORD_HERE'))
// Go to server folder: run node ./encrypt/encryption.js

// Script to make an admin user in mysql (run in workbench):
// INSERT INTO users (school_id, first_name, last_name, email, role_id, hashed_password, reset_password_token, reset_password_expires)
// VALUES (NULL, 'FirstName', 'LastName', 'email', 1, 'hashedPassword', NULL, NULL);
