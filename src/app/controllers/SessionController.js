import * as Yup from 'yup'
import jwt from 'jsonwebtoken'

import User from '../models/User.js'
import auth from '../../config/auth.js'

class SessionController {
  async store(req, res) {
    setTimeout(async () => {
      const sessionSchema = Yup.object().shape({
        email: Yup.string().email().required(),
        password: Yup.string().required(),
      })

      const userEmailOrPasswordCorrect = () => {
        return res
          .status(401)
          .json({ error: 'Make sure Email or Password are correct' })
      }

      if (!(await sessionSchema.isValid(req.body))) {
        return userEmailOrPasswordCorrect()
      }

      const { email, password } = req.body

      const user = await User.findOne({ where: { email } })

      if (!user) {
        return userEmailOrPasswordCorrect()
      }

      if (!(await user.checkPassword(password))) {
        return userEmailOrPasswordCorrect()
      }

      return res.status(200).json({
        id: user.id,
        name: user.name,
        email,
        admin: user.admin,
        token: jwt.sign({ id: user.id, name: user.name }, auth.secret, {
          expiresIn: auth.expireIn,
        }),
      })
    })
  }
}

export default new SessionController()
