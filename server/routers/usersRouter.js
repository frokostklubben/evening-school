import Router from 'express'
import User from '../database/models/user.js'
import { adminCheck } from '../middlewares/authMiddleware.js'
const router = Router()

router.get('/api/users/:schoolId', async (req, res) => {
  try {
    let schoolId = req.params.schoolId
    if (req.session.user.roleId === 2) {
      schoolId = req.session.user.schoolId
    }

    const users = await User.findAll({
      where: { school_id: schoolId },
      attributes: { exclude: ['hashed_password', 'reset_password_token', 'reset_password_expires'] },
    })

    res.send({ data: users })
  } catch (error) {
    console.error('Error fetching users for school:', error)
    res.status(500).send({ error: 'Failed to fetch users' })
  }
})

router.patch('/api/users/:userId', adminCheck, async (req, res) => {
  const { userId } = req.params
  const updates = req.body

  try {
    const user = await User.findByPk(userId)

    if (user) {
      const updatedUser = await user.update(updates)
      // Convert Sequelize instance to plain object
      let userObject = updatedUser.toJSON()

      // Remove sensitive data
      delete userObject.hashed_password
      delete userObject.reset_password_token
      delete userObject.reset_password_expires

      res.send({ message: 'Bruger opdateret succesfuldt.', data: userObject })
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
