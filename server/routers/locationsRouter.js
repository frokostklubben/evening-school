import Router from 'express'
const router = Router()
import Location from '../database/models/location.js'
import { adminCheck } from '../middlewares/authMiddleware.js'

router.get('/api/locations', adminCheck, async (req, res) => {
  const locations = await Location.findAll()
  res.send({ data: locations })
})

router.get('/api/locations/:schoolId', async (req, res) => {
  try {
    let schoolId = req.params.schoolId

    if (req.session.user.roleId === 2) {
      schoolId = req.session.user.schoolId
    }

    const locations = await Location.findAll({
      where: { school_id: schoolId },
    })

    res.send({ data: locations })
  } catch (error) {
    console.error('Error fetching locations for school:', error)
    res.status(500).send({ error: 'Failed to fetch locations' })
  }
})

router.post('/api/locations', adminCheck, async (req, res) => {
  const { school_id, zip_code, school_name, city, street_name, street_number } = req.body

  try {
    const newLocation = await Location.create({
      school_name: school_name,
      school_id: school_id,
      zip_code: zip_code,
      city: city,
      street_name: street_name,
      street_number: street_number,
    })

    res.status(200).send({ data: newLocation })
  } catch (error) {
    res.status(500).send({ error: 'Failed to create location' })
  }
})


router.patch('/api/locations/:locationId', adminCheck, async (req, res) => {
  const { locationId } = req.params
  const updates = req.body

  try {
    const location = await Location.findByPk(locationId)

    if (location) {
      await location.update(updates)
      res.send({ message: 'Afdeling opdateret.', data: location })
    } else {
      res.status(404).send({ message: 'Afdeling ikke fundet.' })
    }
  } catch (error) {
    console.error('Server Error:', error)
    res.status(500).send({ message: 'Serverfejl under opdatering af afdeling.' })
  }
})

router.delete('/api/locations/:locationId', adminCheck, async (req, res) => {
  const { locationId } = req.params

  try {
    const location = await Location.findByPk(locationId)
    if (location) {
      await location.destroy()
      res.send({ message: 'Afdeling slettet succesfuldt.' })
    } else {
      res.status(404).send({ message: 'Afdeling ikke fundet.' })
    }
  } catch (error) {
    console.error('Server Error:', error)
    res.status(500).send({ message: 'Serverfejl under sletning af afdeling.' })
  }
})

export default router
