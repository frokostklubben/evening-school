import Router from 'express'
const router = Router()
import School from '../database/models/school.js'

router.get('/api/schools', async (req, res) => {
  const schools = await School.findAll()
  console.log(schools)
  res.send({ data: schools })
})

router.post('/api/schools', async (req, res) => {
  const { school_id, user_id, name } = req.body.data

  try {
    const school = await Location.create({
      school_id: school_id,
      user_id: user_id,
      name: name,
    })

    console.log(`${school.school_id} ${school.name}`)
    res.status(200).send({ data: school })
  } catch (error) {
    console.error('Error creating a school:', error)
    res.status(500).send({ error: 'Failed to create a school' })
  }
})

export default router
