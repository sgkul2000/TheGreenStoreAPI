const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')

const User = require('./models/userModel')
const Order = require('./models/orderModel')
const Product = require('./models/productModel')
const Address = require('./models/addressModel')

router.get('/', auth.authenticateToken, (req, res, next) => {
  // expected params are : all, completed, id
  let params = {
    user: req.user.id,
  }
  if (req.user.isAdmin === true) {
    if (parseInt(req.query.all) === 1) {
      params = {}
    } else if (parseInt(req.query.completed) === 1) {
      params = {
        status: 'complete',
      }
    } else if (parseInt(req.query.completed) === 0) {
      params = {
        status: 'pending',
      }
    } else if (req.query.id) {
      params = {
        _id: req.query.id,
      }
    }
  } else {
    if (req.query.id) {
      // params = {
      // 	_id: req.query.id,
      // 	user: req.user.id
      // }
      params._id = req.query.id
    }
  }
  Order.find(params, null, {
    sort: {
      createdAt: -1,
    },
  })
    .populate('user')
    .populate('cart')
    .exec()
    .then((orders) => {
      res.send({
        success: true,
        data: orders,
      })
    })
    .catch(next)
})

router.post('/', auth.authenticateToken, async (req, res, next) => {
  console.log(req.body)
  var cartProducts = await Product.find({})
    .exec()
    .then(async (products) => {
      return products
    })
    .catch(next)
  var productList = await cartProducts.filter((product) => {
    return req.body.cart.includes(product._id.toString())
  })
  var amount = 0
  for (let index = 0; index < productList.length; index++) {
    // await console.log('product price', productList[index].price)
    amount += await productList[index].price
  }
  var orderAddress = await Address.findById(req.body.address)
    .then((address) => {
      return address
    })
    .catch(next)
  const newOrder = new Order({
    user: req.user.id,
    amount: amount,
    cart: req.body.cart,
    address: orderAddress,
  })
  savedOrder = await newOrder
    .save()
    .then(async (savedOrder) => {
      User.findById({
        _id: req.user.id,
      })
        .then((orderedUser) => {
          // console.log(orderedUser)
          orderedUser.orders.push(savedOrder._id)
          orderedUser
            .save()
            .then(async (updatedUser) => {
              // console.log(updatedUser)
              await savedOrder.populate('cart')
              await savedOrder.populate('user').execPopulate()
              res.send({
                success: true,
                data: savedOrder,
              })
            })
            .catch(next)
        })
        .catch(next)
    })
    .catch(next)
})

router.delete('/:id', auth.authenticateToken, (req, res, next) => {
  Order.findById(req.params.id)
    .then((order) => {
      // console.log(order)
      // console.log(req.user.id ,order.user)
      if (req.user.id.toString() !== order.user.toString()) {
        if (
          !(parseInt(req.query.forcedelete) === 1 && req.user.isAdmin === true)
        ) {
          return res.status(401).send({
            success: false,
            message: 'Unauthorized user',
          })
        }
      }
      User.findById(req.user.id)
        .then(async (user) => {
          var arrayIndex = await user.orders.indexOf(req.params.id)
          await user.orders.splice(arrayIndex, 1)
          await user
            .save()
            .then((savedUser) => {
              console.log(savedUser)
            })
            .catch(next)
        })
        .catch(next)
      order
        .remove()
        .then((removedOrder) => {
          removedOrder.populate('user').execPopulate()
          res.send({
            success: true,
            data: removedOrder,
          })
        })
        .catch(next)
    })
    .catch(next)
})

router.put('/:id', auth.authenticateTokenAdmin, (req, res, next) => {
  console.log(req.params.id, req.body)
  Order.findById(req.params.id)
    .then((order) => {
      order.status = req.body.status
      order
        .save()
        .then((savedOrder) => {
          res.send({
            success: true,
            data: savedOrder,
          })
        })
        .catch(next)
    })
    .catch(next)
})

router.get('/sales/total', (req, res, next) => {
  Order.aggregate([
    {
      $match: {
        status: 'complete',
      },
    },
    {
      $group: {
        _id: {
          $month: '$createdAt',
        },
        sales: {
          $sum: '$amount',
        },
      },
    },
  ]).then((orders) => {
    res.json({
      success: true,
      data: orders,
    })
  }).catch(next)
})

module.exports = router
