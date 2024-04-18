import { v4 } from 'uuid'
import * as Yup from 'yup'

import User from '../models/User.js'

class UserController {
  async store(req, res) {
    const userSchema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().email().required(),
      password: Yup.string().required().min(8).max(30),
      admin: Yup.boolean(),
    })

    try {
      await userSchema.validateSync(req.body, { abortEarly: false })
    } catch (err) {
      return res.status(400).json({ error: err.errors })
    }

    const { name, email, password, admin } = req.body

    const userExists = await User.findOne({ where: { email } })

    if (userExists) {
      return res.status(409).json({ error: 'E-mail already exists' })
    }

    await User.create({
      id: v4(),
      name,
      email,
      password,
      admin,
    })

    return res.status(201).json({ name, email, admin })
  }
}

export default new UserController()
