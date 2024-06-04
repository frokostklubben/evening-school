import { Router } from 'express'
import bcrypt from 'bcrypt'
import { hashPassword, randomPassword } from '../encrypt/encryption.js'
import connection from '../database/database.js'
import User from '../database/models/user.js'
import { adminCheck } from '../middlewares/authMiddleware.js'
import crypto from 'crypto'
//import { sendMail } from '../nodemailer/sendEmail.js';
import { Op } from 'sequelize'
const router = Router()

router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body

  try {
    const foundUser = await User.findOne({ where: { email: email } })
    const passwordMatch = await bcrypt.compare(password, foundUser.hashed_password)

    if (passwordMatch) {
      req.session.user = {
        email: foundUser.email,
        schoolId: foundUser.school_id,
        roleId: foundUser.role_id,
      }

      res.status(200).send({ message: 'logged in', data: req.session.user, session: req.session.id })
    } else {
      res.status(400).send({ message: 'not logged in' })
    }
  } catch (error) {
    res.status(400).send({ message: 'Wrong password or username' })
  }
})

router.post('/auth/signup', adminCheck, async (req, res) => {
  const { first_name, last_name, email, school_id } = req.body
  const role_id = 2
  const existingUser = await User.findOne({ where: { email } })

  if (!existingUser) {
    const password = await randomPassword()
    const hashed_password = await hashPassword(password)
    const reset_password_token = crypto.randomBytes(20).toString('hex')
    const reset_password_expires = new Date(Date.now() + 3600000) // 1 hour

    const response = await User.create({
      first_name,
      last_name,
      email,
      school_id,
      hashed_password,
      role_id,
      reset_password_token,
      reset_password_expires,
    })

    // Log the reset password token to the console for testing
    console.log(`Reset Password Token: ${reset_password_token}`)

    console.log(`Reset Password Expires: ${reset_password_expires}`)

    // Use localhost for the reset link in development
    const resetLink = `http://localhost:5173/reset-password?token=${reset_password_token}`
    const message = `Velkommen til Aftenskolerne. Du skal ændre dit kodeord med dette link: ${resetLink}. Linken er gyldig i 1 time.`

    // sendMail(email, 'Welcome to Aftenskolerne', message)

    console.log('send mail: ', message)

    res.status(200).send({ data: response })
  } else {
    res.status(400).send({ data: 'User was not created: user already exists' })
  }
})

// router.post('/auth/signup', adminCheck, async (req, res) => {
//   const { first_name, last_name, email, school_id } = req.body
//   const role_id = 2
//   const existingUser = await User.findOne({ where: { email } })

//   if (!existingUser) {
//     const password = await randomPassword()
//     const hashed_password = await hashPassword(password)
//     const response = await User.create({
//       first_name,
//       last_name,
//       email,
//       school_id,
//       hashed_password,
//       role_id,
//     })
//
//     res.status(200).send({ data: response })
//   } else {
//     res.status(400).send({ data: 'User was not created: user already exists' })
//   }
// })

router.get('/auth/logout', (req, res) => {
  delete req.session.user

  req.session.destroy(() => {
    res.status(200).send({ data: 'Logged out' })
  })
})

router.post('/auth/validateSession', async (req, res) => {
  const { sid } = req.body

  let sessionId = ''
  if (req.session && req.session.id) {
    sessionId = req.session.id
  }

  if (sid === sessionId) {
    res.status(200).send({ data: req.session.user })
  } else {
    res.status(400).send({ data: 'Session not validated' })
  }
})

router.post('/auth/reset-password', async (req, res) => {
  const { token, newPassword } = req.body

  try {
    const user = await User.findOne({ where: { reset_password_token: token, reset_password_expires: { [Op.gt]: Date.now() } } })

    if (!user) {
      return res.status(400).send({ data: 'Password reset token is invalid or has expired.' })
    }

    const hashed_password = await hashPassword(newPassword)
    user.hashed_password = hashed_password
    user.reset_password_token = null
    user.reset_password_expires = null

    await user.save()

    res.status(200).send({ data: 'Password has been updated.' })
  } catch (error) {
    console.error(error)
    res.status(500).send({ data: 'Internal server error.' })
  }
})

export default router
