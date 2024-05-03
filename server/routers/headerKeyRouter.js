import { Router } from 'express'
import User from '../database/models/user.js'
import Course from '../database/models/course.js'
import Location from '../database/models/location.js'
import School from '../database/models/school.js'



const router = Router()

router.get('/api/headerKey/:modelname', async (req, res) => {

    try {
        const model = req.params.modelname;
        let columnNames = [];

        switch (model) {
            case "users":
                columnNames = Object.keys(User.getAttributes());
                break;
            case "courses":
                columnNames = Object.keys(Course.getAttributes());
                break;
            case "locations":
                columnNames = Object.keys(Location.getAttributes());
                break;
            case "schools":
                columnNames = Object.keys(School.getAttributes());
                break;
            default:
                throw new Error("Invalid model name");
        }

        res.send({ data: columnNames });
    } catch (error) {
        console.error('Error fetching headerKey:', error);
        res.status(500).send({ error: 'Failed to fetch headerKey' });
    }
})

export default router