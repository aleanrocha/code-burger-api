import * as Yup from 'yup'

import Product from '../models/Product.js'
import Category from '../models/Category.js'
import Order from '../schemas/Order.js'
import User from '../models/User.js'

class OrderController {
  async store(req, res) {
    const orderSchema = Yup.object().shape({
      products: Yup.array()
        .required()
        .of(
          Yup.object().shape({
            id: Yup.number().required(),
            quantity: Yup.number().required(),
          }),
        ),
    })

    try {
      await orderSchema.validateSync(req.body, { abortEarly: false })
    } catch (err) {
      return res.status(400).json({ error: err.errors })
    }

    const producstId = req.body.products.map((product) => product.id)

    const updatedProducts = await Product.findAll({
      where: { id: producstId },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['name'],
        },
      ],
    })

    const editedProduct = updatedProducts.map((product) => {
      const productIndex = req.body.products.findIndex(
        (reqProduct) => reqProduct.id === product.id,
      )

      const newProduct = {
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category.name,
        url: product.url,
        quantity: req.body.products[productIndex].quantity,
      }
      return newProduct
    })

    const order = {
      user: {
        id: req.userId,
        name: req.userName,
      },
      products: editedProduct,
      status: 'Pedido realizado',
    }

    const orderResponse = await Order.create(order)
    console.log(orderResponse)

    res.status(201).json(orderResponse)
  }

  async index(_req, res) {
    const orders = await Order.find()
    res.status(200).json(orders)
  }

  async update(req, res) {
    const statusSchema = Yup.object().shape({
      status: Yup.string().required(),
    })

    try {
      await statusSchema.validateSync(req.body)
    } catch (err) {
      return res.status(400).json({ error: err.errors })
    }

    const { admin: isAdmin } = await User.findByPk(req.userId)
    if (!isAdmin) res.status(401).json()

    const { id } = req.params
    const { status } = req.body

    try {
      await Order.updateOne({ _id: id }, { status })
    } catch (err) {
      return res.status(400).json({ error: err.message })
    }
    res.status(200).json({ message: 'Status was updated sucessfully' })
  }
}

export default new OrderController()
