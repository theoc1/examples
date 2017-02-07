'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const expressJWT = require('express-jwt');

const register = require('./lib/register.js');
const login = require('./lib/login.js');
const weight = require('./lib/weight.js');
const vehicleType = require('./lib/vehicle-type.js');
const vehicle = require('./lib/vehicle.js');
const scales = require('./lib/scales.js');
const org = require('./lib/org.js');
const act = require('./lib/act.js');
const publicAct = require('./lib/public-act.js');

const config = require('./config.js');

const app = express();

const allowCrossDomain = function(req, res, next) {
	res.header('Access-Control-Allow-Origin', config.origin);
	res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE');
	res.header('Access-Control-Allow-Headers', 'Content-Type, authorization');
	if (req.method === 'OPTIONS') {
		res.sendStatus(200);
	}
	else {
		next();
	}
};

app.use(allowCrossDomain);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressJWT({
	secret: config.jwt.secret
})
	.unless({ path: [
		'/register',
		{ url: '/login', methods: ['POST'] },
		'/vehicle-type',
		'/weight',
		'/'
	]})
);

app.use('/', express.static('frontend/app'));

app.use('/register', register);
app.use('/login', login);

app.use('/weight', weight);
app.use('/vehicle-type', vehicleType);
app.use('/vehicle', vehicle);
app.use('/scales', scales);
app.use('/org', org);
app.use('/act', act);
app.use('/public-act', publicAct);

app.use((err, req, res, next) => {
	if (err.name === 'UnauthorizedError') {
		res.status(401);
		res.json({
			status: 401,
			message: 'Unauthorized'
		})
	}
});

app.use((req, res) => {
	res.status(404);
	res.json({
		"status": "404",
		"message": "Not found"
	});
});

app.use((req, res) => {
	res.status(503);
	res.json({
		"status": 503,
		"message": "Internal Server Error"
	});
});



app.listen(process.env.PORT || 5000, () => {
	console.log('Server started');
});
