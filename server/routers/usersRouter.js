import Router from 'express'
import User from '../database/models/user.js'
import { adminCheck } from '../middlewares/authMiddleware.js'
import { hashPassword, randomPassword } from '../encrypt/encryption.js'
const router = Router()

router.get('/api/users/:schoolId', async (req, res) => {
  try {
    let schoolId = req.params.schoolId
    if (req.session.user.roleId === 2) {
      schoolId = req.session.user.schoolId
    }

    const users = await User.findAll({
      where: { school_id: schoolId },
      attributes: { exclude: ['hashed_password'] },
    })

    res.send({ data: users })
  } catch (error) {
    console.error('Error fetching users for school:', error)
    res.status(500).send({ error: 'Failed to fetch users' })
  }
})

// Dette er samme kode som signup, men skal ligge her fordi koden er generaliseret til at kigge på users
router.post('/api/users', adminCheck, async (req, res) => {
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

router.patch('/api/users/:userId', adminCheck, async (req, res) => {
  const { userId } = req.params
  const updates = req.body

  try {
    const user = await User.findByPk(userId)

    if (user) {
      await user.update(updates)
      res.send({ message: 'Bruger opdateret succesfuldt.', data: user })
    } else {
      res.status(404).send({ message: 'Bruger ikke fundet.' })
    }
  } catch (error) {
    console.error('Server Error:', error)
    res.status(500).send({ message: 'Serverfejl under opdatering af bruger.' })
  }
})

router.delete('/api/users/:userId', adminCheck, async (req, res) => {
  const { userId } = req.params

  try {
    const user = await User.findByPk(userId)
    if (user) {
      await user.destroy()
      res.send({ message: 'Bruger slettet succesfuldt.' })
    } else {
      res.status(404).send({ message: 'Bruger ikke fundet.' })
    }
  } catch (error) {
    console.error('Server Error:', error)
    res.status(500).send({ message: 'Serverfejl under sletning af bruger.' })
  }
})

export default router
