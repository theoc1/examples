'use strict';
const router = require('express').Router();
const Scales = require('./models.js').Scales;
const User = require('./models.js').User;

router.get('/', (req, res) => {
	User.findOne({ email: req.user.email })
		.then(user => Scales.find({ userId: user._id }))
		.then(scales => {
			res.status(200);
			res.json({
				status: 200,
				scales: scales
			});
		})
		.catch(error => {
			res.status(503);
			res.json({
				status: 503,
				error: error.message
			})
		})
});

router.post('/', (req, res) => {
	if (req.body.name === undefined) {
		res.status(400);
		res.json({
			status: 400,
			message: 'Inappropriate request'
		});
		return;
	}

	User.findOne({ email: req.user.email })
		.then(user => {
			return Scales.create({
				name: req.body.name,
				number: req.body.number,
				isInRegister: req.body.isInRegister,
				numberRegister: req.body.numberRegister,
				dateCheck: req.body.dateCheck,
				userId: user._id
			})
		})
		.then(scales => {
			res.status(201);
			res.json({
				status: 201,
				message: 'Scales created',
				id: scales._id
			})
		})
		.catch(error => {
			res.status(503);
			res.json({
				status: 503,
				error: error.message
			})
		})
});

router.post('/:id', (req, res) => {
	User.findOne({ email: req.user.email })
		.then(user => Scales.findOneAndUpdate(
			{
				userId: user._id,
				_id: req.params.id
			},
			{
				name: req.body.name,
				number: req.body.number,
				isInRegister: req.body.isInRegister,
				numberRegister: req.body.numberRegister,
				dateCheck: req.body.dateCheck
			}
		))
		.then(() => {
			res.status(204);
			res.json({
				status: 204,
				message: 'Scales modified.'
			});
		})
		.catch(error => {
			res.status(500);
			res.json({
				status: 500,
				error: error.message
			})
		})
});

router.delete('/:id', (req, res) => {
	User.findOne({ email: req.user.email })
		.then(user => Scales.findOneAndRemove({
			userId: user._id,
			_id: req.params.id
		}))
		.then(() => {
			res.status(204);
			res.json({
				status: 204,
				message: 'Scales deleted.'
			})
		})
		.catch(error => {
			res.status(500);
			res.json({
				status: 500,
				error: error.message
			})
		})
});

module.exports = router;
