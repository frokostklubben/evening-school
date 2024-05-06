import { Router } from 'express'
import bcrypt from 'bcrypt'
import { hashPassword, randomPassword } from '../encrypt/encryption.js'
import connection from '../database/database.js'
import User from '../database/models/user.js'
import { adminCheck } from '../middlewares/authMiddleware.js'
//import { sendMail } from '../nodemailer/sendEmail.js';

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
      res.status(200).send({ message: 'logged in', data: req.session.user })
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
    const response = await User.create({
      first_name,
      last_name,
      email,
      school_id,
      hashed_password,
      role_id,
    })
    //const message = `Velkommen til luffelands staffbestilling. \nDin adgangskode er: ${password} \nDu kan ændre din adgangskode når du er logget ind.`;
    //sendMail(email, 'Velkommen til luffelands staffbestilling', message);
    res.status(200).send({ data: ['User was created', response] })
  } else {
    res.status(400).send({ data: 'User was not created: user already exists' })
  }
})

router.get('/auth/logout', (req, res) => {
  delete req.session.user

  req.session.destroy(() => {
    res.status(200).send({ data: 'Logged out' })
  })
})

/*
router.post('/auth/validateSession', async (req, res) => {
    const { currentUserId } = req.body;
    let sessionId = '';
    if (req.session && req.session.user) {
        sessionId = req.session?.user.uid;
    }

    if (currentUserId === sessionId) {
        res.status(200).send({ data: 'Session validated' });
    } else {
        res.status(400).send({ data: 'Session not validated' });
    }
});
*/

export default router
