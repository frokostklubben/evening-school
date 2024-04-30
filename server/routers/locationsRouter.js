import Router from 'express'
const router = Router()
import Location from '../database/models/location.js'

router.get('/api/locations', async (req, res) => {
  const locations = await Location.findAll()
  res.send({ data: locations })
})

router.get('/api/locations/:schoolId', async (req, res) => {
  try {
    const schoolId = req.params.schoolId
    const locations = await Location.findAll({
      where: { school_id: schoolId },
    })
    res.send({ data: locations })
  } catch (error) {
    console.error('Error fetching locations for school:', error)
    res.status(500).send({ error: 'Failed to fetch locations' })
  }
})

router.post('/api/locations', async (req, res) => {
  const { school_id, zip_code, city, street_name, street_number } = req.body.data

  try {
    const new_location = await Location.create({
      school_id: school_id,
      zip_code: zip_code,
      city: city,
      street_name: street_name,
      street_number: street_number,
    })

    res.status(200).send({ data: new_location })
  } catch (error) {
    res.status(500).send({ error: 'Failed to create location' })
  }
})

router.patch('/api/locations/:location_id', async (req, res) => {
  const { location_id } = req.params
  const updates = req.body

  try {
    const location = await Location.findByPk(location_id)

    if (location) {
      await location.update(updates)
      console.log('location', location)
      res.send({ message: 'Afdeling opdateret.', data: location })
    } else {
      res.status(404).send({ message: 'Afdeling ikke fundet.' })
    }
  } catch (error) {
    console.error('Server Error:', error)
    res.status(500).send({ message: 'Serverfejl under opdatering af afdeling.' })
  }
})

export default router
