import Router from 'express'
const router = Router()
import Course from '../database/models/course.js'
// import Location from '../database/models/location.js'

router.get('/api/courses', async (req, res) => {
  const courses = await Course.findAll()
  console.log(courses)
  res.send({ data: courses })
})

router.get('/api/courses/:location_id', async (req, res) => {
  try {
    const locationId = req.params.location_id

    const courses = await Course.findAll({
      where: { location_id: locationId },
    })
    res.send

    // const courses = await Course.findAll({
    //   include: [
    //     {
    //       model: Location,
    //       where: { location_id: locationId },
    //     },
    //   ],
    // })
    res.send({ data: courses })
  } catch (error) {
    console.error('Error fetching courses for location:', error)
    res.status(500).send({ error: 'Failed to fetch courses' })
  }
})

export default router
