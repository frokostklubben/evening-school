import Router from 'express'
const router = Router()
import Location from '../database/models/location.js'

router.get('/api/locations', async (req, res) => {
  const locations = await Location.findAll()
  res.send({ data: locations })
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

export default router
