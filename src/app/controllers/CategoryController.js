import * as Yup from 'yup'
import Category from '../models/Category.js'
import User from '../models/User.js'

class CategoryController {
  async store(req, res) {
    try {
      const categorySchema = Yup.object().shape({
        name: Yup.string().required(),
      })

      try {
        await categorySchema.validateSync(req.body, { abortEarly: false })
      } catch (err) {
        res.status(400).json({ error: err.errors })
      }

      const { admin: isAdmin } = await User.findByPk(req.userId)
      if (!isAdmin) res.status(401).json()

      const { name } = req.body
      const { filename: path } = req.file

      const categoryExists = await Category.findOne({ where: { name } })

      if (categoryExists) {
        return res.status(400).json({ error: 'Category already exists' })
      }

      const { id } = await Category.create({ name, path })

      res.status(201).json({ id, name })
    } catch (err) {
      console.log(err)
    }
  }

  async index(_req, res) {
    const category = await Category.findAll()
    res.status(200).json(category)
  }

  async update(req, res) {
    try {
      const categorySchema = Yup.object().shape({
        name: Yup.string(),
      })

      try {
        await categorySchema.validateSync(req.body)
      } catch (err) {
        res.status(400).json({ error: err.errors })
      }

      const { admin: isAdmin } = await User.findByPk(req.userId)
      if (!isAdmin) res.status(401).json()

      const { id } = req.params
      const category = await Category.findByPk(id)
      if (!category) res.status(401).json({ error: 'Category is not exists' })

      let path
      if (req.file) {
        path = req.file.filename
      }

      const { name } = req.body

      await Category.update({ name, path }, { where: { id } })

      res.status(200).json()
    } catch (err) {
      console.log(err)
    }
  }
}

export default new CategoryController()
