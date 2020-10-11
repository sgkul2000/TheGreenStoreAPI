const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')

const User = require('./models/userModel')

router.get('/', auth.authenticateTokenAdmin, (req, res, next) => {
  User.find({ isAdmin: true }).then((admins) => {
    res.send({
      success: true,
      data: admins,
    })
  }).catch(next)
})

router.post('/', auth.authenticateTokenAdmin, (req, res, next) => {
  console.log(req.body)
  User.findOne({ email: req.body.email }).then((user) => {
    user.isAdmin = true
    user.save().then((savedUser) => {
      res.send({
        success: true,
        data: savedUser,
      })
    }).catch(next)
  }).catch(next)
})

router.delete('/', auth.authenticateTokenAdmin, (req, res, next) => {
  console.log(req.query)
  User.findById(req.query.id).then((user) => {
    user.isAdmin = false
    user.save().then(( removedUser) => {
      res.send({
        success: true,
        data: removedUser,
      })
    }).catch(next)
  }).catch(next)
})

module.exports = router
