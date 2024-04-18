import * as Yup from 'yup'
import Product from '../models/Product.js'
import Category from '../models/Category.js'
import User from '../models/User.js'

class ProductController {
  async store(req, res) {
    try {
      const productSchema = Yup.object().shape({
        name: Yup.string().required(),
        price: Yup.number().required(),
        category_id: Yup.number().required(),
        offer: Yup.boolean(),
      })

      try {
        await productSchema.validateSync(req.body, { abortEarly: false })
      } catch (err) {
        res.status(400).json({ error: err.errors })
      }

      const { admin: isAdmin } = await User.findByPk(req.userId)
      if (!isAdmin) res.status(401).json()

      const { filename: path } = req.file
      const { name, price, category_id, offer } = req.body

      const product = await Product.create({
        name,
        price,
        category_id,
        path,
        offer,
      })

      res.status(201).json(product)
    } catch (err) {
      console.log(err)
    }
  }

  async index(req, res) {
    const product = await Product.findAll({
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
        },
      ],
    })

    console.log(req.userId)
    res.status(200).json(product)
  }

  async update(req, res) {
    try {
      const productSchema = Yup.object().shape({
        name: Yup.string(),
        price: Yup.number(),
        category_id: Yup.number(),
        offer: Yup.boolean(),
      })

      try {
        await productSchema.validateSync(req.body, { abortEarly: false })
      } catch (err) {
        res.status(400).json({ error: err.errors })
      }

      const { admin: isAdmin } = await User.findByPk(req.userId)
      if (!isAdmin) res.status(401).json()

      const { id } = req.params
      const product = Product.findByPk(id)
      if (!product) res.status(4001).json({ error: 'Product is not exists' })

      let path
      if (req.file) {
        path = req.file.filename
      }

      const { name, price, category_id, offer } = req.body

      await Product.update(
        {
          name,
          price,
          category_id,
          path,
          offer,
        },
        {
          where: { id },
        },
      )

      res.status(200).json()
    } catch (err) {
      console.log(err)
    }
  }
}

export default new ProductController()
