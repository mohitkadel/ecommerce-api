const User = require('../models/user.model');
const { check, body, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');

const status = ["Active", "InActive"];
const gender = ["Male", "Female"];

let validate = function(method) {
	switch (method) {
		case 'postUser':
			{
				return [
					check('gender').exists().custom(value => {
						if (gender.indexOf(value) == -1) {
							return Promise.reject('Invalid gender')
						}
						return true;
					}),
					check('name').exists(),
					check('dob').exists(),
					check('status').custom(value => {
						if (value && status.indexOf(value) == -1) {
							return Promise.reject('Invalid status')
						}
						return true;
					}),
					check('email').exists().isEmail().custom(value => {
						return User.findOne({ email: value }).then(user => {
							if (user) {
								return Promise.reject('E-mail already in use');
							}
						});
					}),
					check('password').exists()
					.isLength({ min: 5 }).withMessage('must be at least 5 chars long')
				]
			}
		case 'putUser':
			{
				return [
					check('gender').custom(value => {
						if (value && gender.indexOf(value) == -1) {
							return Promise.reject('Invalid gender')
						}
						return true;
					}),
					// check('dob').exists(),
					// check('name').exists(),
					check('status').custom(value => {
						if (value && status.indexOf(value) == -1) {
							return Promise.reject('Invalid status')
						}
						return true;
					})
				]
			}
		case 'postLogin':
			{
				return [
					check('email').exists().isEmail(),
					// password must be at least 5 chars long
					check('password').exists()
				]
			}
		case 'changePassword':
			{
				return [
					check('password').exists().custom(value => {
						if(value.length < 6) {
							return Promise.reject('Password length shouldn\'t be less then 6 digit')
						}
						return true;
					}),
					// password must be at least 5 chars long
					check('newPassword').exists().custom(value => {
						if(value.length < 6) {
							return Promise.reject('New Password length shouldn\'t be less then 6 digit')
						}
						return true;
					})
				]
			}
	}
}

let getUsers = function(req, res) {
	let query = {};
	query = req.query;
	console.log('query')
	console.log(req.query)
	User.find(query).then((users) => {
			res.status(200).send(users);
		})
		.catch((error) => {
			res.status(400).send(error);
		})
};

let getUser = function(req, res) {
	User.findById(req.params.id).then((user) => {
			res.status(200).send(user);
		})
		.catch((error) => {
			res.status(404).send(error);
		});
};

let orderProducts = async function(req, res) {
	let errors = [];
	let body = [];

	if (req.body.orders && req.body.orders.length) {
		for (let order of req.body.orders) {
			let data = {};

			if (order.product_id) {
				let product = await Product.findById(order.product_id);
				if (product && Object.keys(product).length) {
					data.product_id = order.product_id;
					data.product_price = product.price;
				} else {
					errors.push({ param: "product_id", msg: "Invalid Product Id:" + order.product_id })
				}
			} else {
				errors.push({ param: "product_id", msg: "No product_id provided" })
			}

			if (order.final_price && typeof order.final_price == "number") {
				data.final_price = order.final_price;
			} else {
				errors.push({ param: "final_price", msg: "No final_price provided" })
			}

			if (order.quantity && typeof order.quantity == "number") {
				data.quantity = order.quantity;
			} else {
				errors.push({ param: "quantity", msg: "No quantity provided" })
			}


			if (order.coupon_code) {
				let coupon = await Coupon.findOne({ code: order.coupon_code });
				if (coupon && Object.keys(coupon).length) {
					data.coupon = {
						code: order.coupon_code,
						discount: coupon.discount,
						exp_time: coupon.exp_time
					}
				} else {
					errors.push({ param: "coupon_code", msg: "Invalid Coupon Code:" + order.coupon_code })
				}
			}

			body.push(data);
		}
	}


	if (errors.length) {
		res.status(422).json({ errors: errors });
		return;
	}

	User.findById(req.params.id).then((user) => {
			user.orders = body;
			user.save();

			res.status(200).send(user);
		})
		.catch((error) => {
			console.log(error)
			res.status(404).send({ error: "User not found" });
		})
}

let putUser = function(req, res) {
	const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions

	if (!errors.isEmpty()) {
		res.status(422).json({ errors: errors.array() });
		return;
	}
	User.findById(req.params.id).then((user) => {
			user.name = req.body.name || user.name;
			user.dob = req.body.dob || user.dob;
			user.gender = req.body.gender || user.gender;

			user.save();

			res.status(200).send(user);
		})
		.catch((error) => {
			console.log(error)
			res.status(404).send({ error: "User not found" });
		})
};

let changePassword = function(req, res) {
	const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions

	if (!errors.isEmpty()) {
		res.status(422).json({ errors: errors.array() });
		return;
	}
	User.findById(req.params.id).then((user) => {
			bcrypt.compare(req.body.password, user.password, function(err, isMatch) {
				if (err) {
					throw err
				} else if (!isMatch) {
					res.status(400).send({ error: "Old Password doesn't match!" });
				} else {
					bcrypt.hash(req.body.newPassword, 10, function(err, hash) {
						if (err) {
							res.status(400).send({ error: 'Error hashing password for user' });
						} else {
							user.password = hash;
							user.save();

							res.status(200).send(user);
						}
					});
				}
			})
		})
		.catch((error) => {
			console.log(error)
			res.status(404).send({ error: "User not found" });
		})
}

let postUser = function(req, res) {
	const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions
	if (!errors.isEmpty()) {
		res.status(422).json({ errors: errors.array() });
		return;
	}

	let user = new User(req.body);

	user.save(user).then(() => {
			res.status(201).send(user);
		})
		.catch((error) => {
			console.log(error)
			res.status(400).send("Something went wrong");
		})
};

let signupUser = function(req, res) {
	const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions
	if (!errors.isEmpty()) {
		res.status(422).json({ errors: errors.array() });
		return;
	}

	let user = new User(req.body);

	user.save(user).then((user) => {

			const options = { expiresIn: '2d', issuer: 'http://localhost' };
			const secret = "mohitkadel";
			const payload = { id: user._id };

			const token = jwt.sign(payload, secret, options);

			let result = {};
			result.data = user;
			result.token = token;

			res.status(200).send(result);
		})
		.catch((error) => {
			console.log(error)
			res.status(400).send("Something went wrong");
		})
};

let postLogin = function(req, res) {
	const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions

	if (!errors.isEmpty()) {
		res.status(422).json({ errors: errors.array() });
		return;
	}

	User.findOne({ email: req.body.email }).then((user) => {
			let result = {};

			if (user.status === 0) {
				result.message = 'User is Inactive';
				res.status(401).send(result)
				return;
			}

			const options = { expiresIn: '2d', issuer: 'http://localhost' };
			const secret = "mohitkadel";
			const payload = { id: user._id };

			const token = jwt.sign(payload, secret, options);

			bcrypt.compare(req.body.password, user.password).then(match => {
				if (match) {
					res.status(200)
					result.data = user;
					result.token = token;
				} else {
					res.status(401)
					result.message = 'Invalid email or password';
				}
				console.log(result)
				res.send(result);
			})
		})
		.catch((error) => {
			console.log(error)
			res.status(404).send({ error: "User not found" });
		})
};

module.exports = {
	postLogin: postLogin,
	postUser: postUser,
	putUser: putUser,
	getUsers: getUsers,
	getUser: getUser,
	signupUser: signupUser,
	orderProducts: orderProducts,
	changePassword: changePassword,
	validate: validate
}