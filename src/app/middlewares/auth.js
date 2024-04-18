import Jwt from 'jsonwebtoken'
import auth from '../../config/auth'

export default (req, res, next) => {
  const authToken = req.headers.authorization

  if (!authToken) {
    res.status(401).json({ error: 'Token not provided' })
  }

  const token = authToken.split(' ')[1]

  try {
    Jwt.verify(token, auth.secret, (err, decoded) => {
      if (err) throw new Error()
      req.userId = decoded.id
      req.userName = decoded.name
      next()
    })
  } catch (error) {
    res.status(401).json({ error: 'Token is invalid' })
  }
}
