const { Fruit, Product } = require('../models/product.model');
const Coupon = require('../models/coupon.model');
const { check, body, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');

let validate = function(method) {
	switch (method) {
		case 'postCoupon':
			{
				return [
					check('code').exists(),
					check('discount').exists(),
					check('exp_time').exists(),
					check('quantity').exists(),
					check('status').exists().custom(value => {
						if (Fruit.status.indexOf(value) == -1) {
							return Promise.reject('Invalid status')
						}
						return true;
					}),
					check('rules').custom(rules => {
						for(let rule of rules) {
							if(!rule.product_type || Product.types.indexOf(rule.product_type)) {
								return Promise.reject('Invalid product_type')
							}

							if(!rule.product_quantity || typeof rule.product_quantity!="number") {
								return Promise.reject('Invalid product_quantity')
							}
						}
						return true;
					})
				]
			}
		case 'putCoupon':
			{
				return [
					check('code').exists(),
					check('discount').exists(),
					check('exp_time').exists(),
					check('quantity').exists(),
					check('status').exists().custom(value => {
						if (Fruit.status.indexOf(value) == -1) {
							return Promise.reject('Invalid status')
						}
						return true;
					}),
					check('rules').custom(rules => {
						for(let rule of rules) {
							if(!rule.product_type || Product.types.indexOf(rule.product_type)) {
								return Promise.reject('Invalid product_type')
							}

							if(!rule.product_quantity || typeof rule.product_quantity!="number") {
								return Promise.reject('Invalid product_quantity')
							}
							return true;
						}
					})
				]
			}
	}
}

let getCoupons = function(req, res) {
	let query = {};
	query = req.query;
	console.log('query')
	console.log(req.query)
	Coupon.find(query).then((coupons) => {
			res.status(200).send(coupons);
		})
		.catch((error) => {
			res.status(400).send(error);
		})
};

let getCoupon = function(req, res) {
	Coupon.findById(req.params.id).then((coupon) => {
			res.status(200).send(coupon);
		})
		.catch((error) => {
			res.status(404).send(error);
		});
};


let putCoupon = function(req, res) {
	const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions

	if (!errors.isEmpty()) {
		res.status(422).json({ errors: errors.array() });
		return;
	}


	Coupon.findById(req.params.id).then((coupon) => {

			coupon.code = req.body.code || coupon.code;
			coupon.discount = req.body.discount || coupon.discount;
			coupon.exp_time = req.body.exp_time || coupon.exp_time;
			coupon.quantity = req.body.quantity || coupon.quantity;
			coupon.rules = req.body.rules || coupon.rules;
			
			coupon.save();

			res.status(200).send(coupon);
		})
		.catch((error) => {
			console.log(error)
			res.status(404).send({ error: "Product not found" });
		})
};

let postCoupon = function(req, res) {
	const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions
	if (!errors.isEmpty()) {
		res.status(422).json({ errors: errors.array() });
		return;
	}
	let coupon = new Coupon(req.body);

	coupon.save(coupon).then(() => {
		res.status(201).send(coupon);
	})
	.catch((error) => {
		console.log(error)
		res.status(400).send("Something went wrong");
	})
};


module.exports = {
	postCoupon: postCoupon,
	putCoupon: putCoupon,
	getCoupons: getCoupons,
	getCoupon: getCoupon,
	validate: validate
}