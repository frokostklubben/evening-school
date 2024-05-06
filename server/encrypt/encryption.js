// Reused code from earlier project

import bcrypt from 'bcrypt';
import crypto from 'crypto';

export async function hashPassword(plainTextPassword) {
  const saltRounds = 14;
  const hashedPassword = await bcrypt.hash(plainTextPassword, saltRounds);
  return hashedPassword;
}

export async function comparePassword(plainTextPassword, hashedPassword) {
  const match = await bcrypt.compare(plainTextPassword, hashedPassword);
  return match;
}

export async function randomPassword() {
  let randomPassword = '0';
  try {
    randomPassword = crypto.randomBytes(16).toString('hex');
  } catch (error) {
    console.log(error);
  }
  return randomPassword;
}
