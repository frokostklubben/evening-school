import Router from 'express'
import User from '../database/models/user.js'
const router = Router()

router.get('/api/users/:schoolId', async (req, res) => {
  try {
    const schoolId = req.params.schoolId
    const users = await User.findAll({
      where: { school_id: schoolId },
    })
    res.send({ data: users })
  } catch (error) {
    console.error('Error fetching users for school:', error)
    res.status(500).send({ error: 'Failed to fetch users' })
  }
})

router.post('/api/users', async (req, res) => {
  const { first_name, last_name, email, school_id } = req.body

  try {
    const user = await User.create({ first_name, last_name, email, school_id, role_id: 2 })
    res.status(201).send({ message: 'Bruger oprettet succesfuldt.', data: user })
  } catch (error) {
    console.error('Server Error:', error)
    res.status(500).send({ message: error.errors[0].message })
  }
})

router.patch('/api/users/:user_id', async (req, res) => {
  const { user_id } = req.params
  const updates = req.body

  try {
    const user = await User.findByPk(user_id)

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

router.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params

  try {
    const user = await User.findByPk(id)
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
