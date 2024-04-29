import { isAlpha, isValidEmail } from '../services/validation.js'
import User from '../database/models/user.js'
import { Op } from 'sequelize'

export async function validateUser(req, res, next) {
  const { first_name, last_name, email } = req.body
  let errors = []

  if (!isAlpha(first_name)) {
    errors.push('Fornavn må kun indeholde bogstaver.')
  }

  if (!isAlpha(last_name)) {
    errors.push('Efternavn må kun indeholde bogstaver.')
  }

  if (!isValidEmail(email)) {
    errors.push('Ugyldig email-adresse.')
  } else {
    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      errors.push('Emailen er allerede i brug.')
    }
  }

  if (errors.length > 0) {
    return res.status(400).send({ message: errors.join(' ') })
  }

  next()
}

export async function validateUserForUpdate(req, res, next) {
  const { user_id } = req.params
  const { email } = req.body

  try {
    // Check if the email is taken by someone other than the current user
    const existingUser = await User.findOne({
      where: {
        email: email,
        id: { [Op.ne]: user_id },
      },
    })

    if (existingUser) {
      return res.status(400).send({ message: 'Email er allerede i brug af en anden bruger.' })
    }

    next()
  } catch (error) {
    console.error('Validation error:', error)
    res.status(500).send({ message: 'Validering fejlet.' })
  }
}
