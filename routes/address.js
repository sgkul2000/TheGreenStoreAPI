const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth')

const User = require("./models/userModel");
const Address = require("./models/addressModel");


router.get('/', auth.authenticateToken, (req, res) => {
	var params = {
		email: req.user.email
	}
	User.findOne(params, async (err, user) => {
		if (err) {
			console.error(err)
			return res.status(400).send({
				success: false,
				error: err
			})
		}
		// await user.populate('orders')
		await user.populate('addresses').execPopulate()
		console.log(user.addresses)
		res.send({
			success: true,
			data: user.addresses
		})
	})
})

router.get('/:id', auth.authenticateToken, (req, res) => {
	var params = {
		email: req.user.email
	}
	User.findOne(params, async (err, user) => {
		if (err) {
			console.error(err)
			return res.status(400).send({
				success: false,
				error: err
			})
		}
		await user.populate('addresses').execPopulate()
		var requiredAddress = await user.addresses.filter((element) => {
			return element._id.toString() === req.params.id.toString()
		})
		console.log(user.addresses)
		res.send({
			success: true,
			data: requiredAddress[0]
		})
	})
})
router.post('/', auth.authenticateToken, (req, res) => {
	console.log(req.body)
	var address = new Address({
		buildingDetails: req.body.buildingDetails,
		area: req.body.area,
		landmark: req.body.landmark ? req.body.landmark : "",
		cityName: req.body.cityName,
		stateName: req.body.stateName,
		pincode: req.body.pincode,
		gpsLocation: req.body.gpsLocation ? req.body.gpsLocation : "",
	})
	address.save((err, savedAddress) => {
		if (err) {
			console.error(err)
			return res.status(400).send({
				success: false,
				error: err
			})
		}
		User.findOne({
			email: req.user.email
		}, (error, user) => {
			if (error) {
				console.error(error)
				return res.status(401).send({
					success: false,
					error: error
				})
			}
			console.log(savedAddress._id)
			user.addresses.push(savedAddress._id)
			user.save((err, savedUser) => {
				if (err) {
					console.error(err)
					return res.status(400).send({
						success: false,
						error: err
					})
				}
				res.send({
					success: true,
					data: savedAddress
				})
			})
		})
	})
})


router.delete('/:id', auth.authenticateToken, async (req, res) => {
	Address.findById(req.params.id, (err, address) => {
		if (err) {
			console.error(err)
			return res.status(400).send({
				success: false,
				error: err
			})
		}
		User.findById(req.user.id, async (err, user) => {
			if (err) {
				console.error(err)
				return res.status(400).send({
					success: false,
					error: err
				})
			}
			var arrayIndex = await user.addresses.indexOf(req.params.id)
			await user.addresses.splice(arrayIndex, 1)
			await user.save((err, savedUser) => {
				if (err) {
					console.error(err)
					return res.status(400).send({
						success: false,
						error: err
					})
				}
				console.log(savedUser)
			})
		})
		address.remove((err, deletedAddress) => {
			if (err) {
				console.error(err)
				return res.status(400).send({
					success: false,
					error: err
				})
			}
			res.send({
				success: true,
				data: deletedAddress
			})
		})
	})
})

router.put('/:id', auth.authenticateToken, (req, res) => {
	Address.findById(req.params.id, (err, address) => {
		if (err) {
			console.error(err)
			return res.status(400).send({
				success: false,
				error: err
			})
		}
		address.buildingDetails = req.body.buildingDetails
		address.area = req.body.area
		if(req.body.landmark){
			address.landmark = req.body.landmark
		}
		address.cityName = req.body.cityName
		address.stateName = req.body.stateName
		address.pincode = req.body.pincode
		if(req.body.gpsLocation){
			address.gpsLocation = req.body.gpsLocation
		}
		address.save((err, savedAddress) => {
			if (err) {
				console.error(err)
				return res.status(400).send({
					success: false,
					error: err
				})
			}
			res.send({
				success: true,
				data: savedAddress
			})
		})
	})
})

module.exports = router