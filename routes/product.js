const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Product = require('./models/productModel')

router.get('/', async (req, res) => {
  // console.log(req.body)
  let params = {}
  if (req.query.category) {
    console.log(req.query.category)
    params = {
      category: req.query.category,
    }
  }
  if (req.query.id) {
    params._id = req.query.id
  }
  if (req.query.search) {
    params.name = {
      $regex: req.query.search,
      $options: 'i',
    }
  }
  try {
    const products = await Product.find(params)
    res.send({
      success: true,
      data: products,
    })
  } catch (err) {
    console.error(err)
    res.status(404).send({
      success: false,
      error: error,
    })
  }
})

router.post('/', auth.authenticateTokenAdmin, async (req, res) => {
  console.log(req.body)
  let product = await new Product({
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    quantity: req.body.quantity,
    per: req.body.per,
    category: req.body.category,
    isAvailable: req.body.isAvailable ? req.body.isAvailable : true,
    images: req.body.images,
  })
  product.save((error, product) => {
    if (error) {
      console.error(error)
      return res.status(404).send({
        success: false,
        error: error,
      })
    }
    console.log(product)
    res.status(201).send({
      success: true,
      data: product,
    })
  })
})

router.delete('/:id', auth.authenticateTokenAdmin, (req, res) => {
  console.log(req.params.id)
  Product.findById(req.params.id, (err, product) => {
    if (err) {
      console.error(err)
      res.status(400).send({
        success: false,
        error: err,
      })
    }
    product.remove((error, product) => {
      if (error) {
        console.error(error)
        return res.status(400).send({
          success: false,
          error: err,
        })
      }
      res.send({
        success: true,
        product: product,
      })
    })
  })
})

router.put('/:id', auth.authenticateTokenAdmin, (req, res) => {
  console.log(req.params.id)
  console.log(req.body)
  Product.findById(req.params.id, (err, product) => {
    console.log('product', product)
    if (err) {
      console.log('theres an error here', err)
      res.status(400).send({
        success: false,
        error: err,
      })
    }
    if (req.body.name) {
      product.name = req.body.name
    }
    if (req.body.description) {
      product.description = req.body.description
    }
    if (req.body.price) {
      product.price = req.body.price
    }
    if (req.body.quantity) {
      product.quantity = req.body.quantity
    }
    if (req.body.per) {
      product.per = req.body.per
    }
    if (req.body.isAvailable) {
      product.isAvailable = req.body.isAvailable
    }
    if (req.body.isSpecial) {
      product.isSpecial = req.body.isSpecial
    }
    if (req.body.category) {
      product.category = req.body.category
    }
    product.save((error, newProduct) => {
      if (error) {
        console.error(error)
        res.status(500).send({
          success: false,
          error: err,
        })
      }
      res.send({
        success: true,
        data: newProduct,
      })
    })
  })
})

module.exports = router
