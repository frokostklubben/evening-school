import Router from 'express'
const router = Router()
import User from '../database/models/user.js'

router.get('/api/users', async (req, res) => {
  const users = await User.findAll()
  console.log(users)
  res.send({ data: users })
})

router.post('/api/users', async (req, res) => {
  const { first_name, last_name, email } = req.body
  const user = await User.create({ first_name: first_name, last_name: last_name, email: email })
  console.log(user.email + ' ' + user.last_name)
  res.status(200).send({ data: user })
})

export default router
