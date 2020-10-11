const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth')

const User = require("./models/userModel");
const Address = require("./models/addressModel");


router.get('/', auth.authenticateToken, (req, res, next) => {
	var params = {
		email: req.user.email
	}
	User.findOne(params).then( async (user) => {
		// await user.populate('orders')
		await user.populate('addresses').execPopulate()
		console.log(user.addresses)
		res.send({
			success: true,
			data: user.addresses
		})
	}).catch(next)
})

router.get('/:id', auth.authenticateToken, (req, res, next) => {
	var params = {
		email: req.user.email
	}
	User.findOne(params).then( async (user) => {
		await user.populate('addresses').execPopulate()
		var requiredAddress = await user.addresses.filter((element) => {
			return element._id.toString() === req.params.id.toString()
		})
		console.log(user.addresses)
		res.send({
			success: true,
			data: requiredAddress[0]
		})
	}).catch(next)
})


router.post('/', auth.authenticateToken, (req, res, next) => {
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
	address.save().then((savedAddress) => {
		User.findOne({
			email: req.user.email
		}).then((user) => {
			console.log(savedAddress._id)
			user.addresses.push(savedAddress._id)
			user.save().then(( savedUser) => {
				res.send({
					success: true,
					data: savedAddress
				})
			}).catch(next)
		}).catch(next)
	}).catch(next)
})


router.delete('/:id', auth.authenticateToken, async (req, res, next) => {
	Address.findById(req.params.id).exec().then( (address) => {
		User.findById(req.user.id).exec().then( async (user) => {
			var arrayIndex = await user.addresses.indexOf(req.params.id)
			await user.addresses.splice(arrayIndex, 1)
			await user.save().then((savedUser) => {
				// console.log(savedUser)
			}).catch(next)
		}).catch(next)
		address.remove().then((deletedAddress) => {
			res.send({
				success: true,
				data: deletedAddress
			})
		}).catch(next)
	}).catch(next)
})

router.put('/:id', auth.authenticateToken, (req, res, next) => {
	Address.findById(req.params.id).then((address) => {
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
		address.save().then((savedAddress) => {
			res.send({
				success: true,
				data: savedAddress
			})
		}).catch(next)
	}).catch(next)
})

module.exports = router