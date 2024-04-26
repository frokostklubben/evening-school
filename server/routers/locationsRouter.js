import Router from 'express'
const router = Router()
import Location from '../database/models/location.js'

router.get('/api/locations', async (req, res) => {
  const locations = await Location.findAll()
  console.log(locations)
  res.send({ data: locations })
})

router.post('/api/locations', async (req, res) => {
  console.log(req.body)
  const { school_id, zip_code, city, street_name, street_number } = req.body

  try {
    const new_location = await Location.create({
      school_id: school_id,
      zip_code: zip_code,
      city: city,
      street_name: street_name,
      street_number: street_number,
    })

    console.log(`${new_location.city} ${new_location.zip_code}`)
    res.status(200).send({ data: new_location })
  } catch (error) {
    console.error('Error creating the location:', error)
    res.status(500).send({ error: 'Failed to create location' })
  }
})

export default router
