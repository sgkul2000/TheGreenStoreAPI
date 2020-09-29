const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')

const User = require('./models/userModel')

router.get('/', auth.authenticateTokenAdmin, (req, res) => {
  User.find({ isAdmin: true }, (err, admins) => {
    if (err) {
      console.error(err)
      return res.status(400).send({
        success: false,
        error: err,
      })
    }
    res.send({
      success: true,
      data: admins,
    })
  })
})

router.post('/', auth.authenticateTokenAdmin, (req, res) => {
  console.log(req.body)
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) {
      console.error(err)
      return res.status(400).send({
        success: false,
        error: err,
      })
    }
    user.isAdmin = true
    user.save((err, savedUser) => {
      if (err) {
        console.error(err)
        return res.status(400).send({
          success: false,
          error: err,
        })
      }
      res.send({
        success: true,
        data: savedUser,
      })
    })
  })
})

router.delete('/', auth.authenticateTokenAdmin, (req, res) => {
  console.log(req.query)
  User.findById(req.query.id, (err, user) => {
    if (err) {
      console.error(err)
      return res.status(400).send({
        success: false,
        error: err,
      })
    }
    user.isAdmin = false
    user.save((err, removedUser) => {
      if (err) {
        console.error(err)
        return res.status(400).send({
          success: false,
          error: err,
        })
      }
      res.send({
        success: true,
        data: removedUser,
      })
    })
  })
})

module.exports = router
