'use strict';
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const config = require('./../config.js');

mongoose.Promise = Promise;
mongoose.connect(config.mongo.uri);

const userSchema = new mongoose.Schema({
	email: {
		type: String,
		unique: true
	},
	password: String,
	active: Boolean,
	password_reset_code: String,
	password_reset_time: Number,
	activation_code: String
});

userSchema.pre('save', function(next) {
	let user = this;
	if (this.isModified('password') || this.isNew) {
		bcrypt.genSalt(10, (err, salt) => {
			if (err) return next(err);
			bcrypt.hash(user.password, salt, (err, hash) => {
				if (err) return next(err);
				user.password = hash;
				next();
			});
		});
	} else return next();
});

userSchema.methods.comparePassword = function(password) {
	return new Promise((resolve, reject) => {
		bcrypt.compare(password, this.password, (err, isMatch) => {
			if (err) {
				reject(err);
			}
			resolve(isMatch);
		});
	});

};


const User = mongoose.model('User', userSchema);

const formulaSchema = new mongoose.Schema({
	name: String,
	weights: Object
});


const Formula = mongoose.model('Formula', formulaSchema);

const vehicleTypeSchema = new mongoose.Schema({
	name: String,
	label: String,
	subMenus: []
});

const VehicleType = mongoose.model('VehicleType', vehicleTypeSchema);

const vehicleSchema = new mongoose.Schema({
	type: String,
	value: Number,
	gosNumber: String,
	model: String,
	bridges: [],
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

const scalesSchema = new mongoose.Schema({
	name: String,
	number: String,
	isInRegister: Boolean,
	numberRegister: String,
	dateCheck: Date,
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Scales = mongoose.model('Scales', scalesSchema);

const orgSchema = new mongoose.Schema({
	name: String,
	inn: String,
	kpp: String,
	address: String,
	email: String,
	phone: String,
	operatorName: String,
	leadName: String,
	leadPhone: String,
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Org = mongoose.model('Org', orgSchema);

const actSchema = new mongoose.Schema({
	time: Date,
	date: Date,
	driverName: String,
	vehicle: Object,
	scales: Object,
	org: Object,
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	deleted: Boolean
});

const Act = mongoose.model('Act', actSchema);


module.exports.User = User;
module.exports.Formula = Formula;
module.exports.VehicleType = VehicleType;
module.exports.Vehicle = Vehicle;
module.exports.Scales = Scales;
module.exports.Org = Org;
module.exports.Act = Act;
