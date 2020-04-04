const { Fruits, Product } = require('../models/product.model');
const { check, body, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const multer  =   require('multer');
const _ = require('lodash');
const path = require('path');

let storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './uploads');
  },
  filename: function (req, file, callback) {
  	let filename = file.fieldname + '-' + Date.now() + "." + file.originalname.split('.')[file.originalname.split('.').length - 1];
  	callback(null, filename);
  }
});

let upload = multer({ storage : storage}).single('images');


let validate = function(method) {
	switch (method) {
		case 'postProduct':
			{
				return [
					check('title').exists(),
					check('quantity').exists(),
					check('type').exists().custom(value => {
						if (Fruits().types.indexOf(value) == -1) {
							return Promise.reject('Invalid type')
						}
						return true;
					}),
					check('price').exists(),
					check('status').exists().custom(value => {
						if (Fruits().status.indexOf(value) == -1) {
							return Promise.reject('Invalid status')
						}
						return true;
					})
				]
			}
		case 'putProduct':
			{
				return [
					// check('title').exists(),
					check('quantity').custom(value => {
						if (value && typeof value != "number") {
							return Promise.reject('Invalid quantity')
						}
						return true;
					}),
					check('type').custom(value => {
						if (value && Fruits().types.indexOf(value) == -1) {
							return Promise.reject('Invalid type')
						}
						return true;
					}),
					check('price').custom(value => {
						if (value && typeof value != "number") {
							return Promise.reject('Invalid price')
						}
						return true;
					}),
					check('status').custom(value => {
						if (value && Fruits().status.indexOf(value) == -1) {
							return Promise.reject('Invalid status')
						}
						return true;
					})
				]
			}
	}
}

let getProducts = function(req, res) {
	let query = {};
	
	console.log('query')
	console.log(req.query)
	if(req.query.search || req.query.search == '') {
		var re = new RegExp(req.query.search, "i");
		query.title = re;
	}
	else {
		query = req.query;
	}
	console.log('query')
	console.log(query)
	Product.find(query).then((products) => {
			res.status(200).send(products);
		})
		.catch((error) => {
			res.status(400).send(error);
		})
};

let getProduct = function(req, res) {
	Product.findById(req.params.id).then((product) => {
			res.status(200).send(product);
		})
		.catch((error) => {
			res.status(404).send(error);
		});
};


let putProduct = function(req, res) {
	const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions

	if (!errors.isEmpty()) {
		res.status(422).json({ errors: errors.array() });
		return;
	}

	Product.findById(req.params.id).then((product) => {
			product.title = req.body.title || product.title;
			product.description = req.body.description || product.description;
			product.type = req.body.type || product.type;
			product.quantity = req.body.quantity || product.quantity;
			product.status = req.body.status || product.status;
			product.price = req.body.price || product.price;

			upload(req, res, function(err) {
		        if(err) {
		        	return res.status(404).send({ error: "Error uploading file" });
		        }

		        if(req.file) {
		        	product.images.push({url : "uploads/" + req.file.filename, name: req.file.filename})
		        }
		        
		        product.save();

				res.status(200).send(product);
		    });
		})
		.catch((error) => {
			console.log(error)
			res.status(404).send({ error: "Product not found" });
		})
};

let getImages = function(req, res) {
	Product.findById(req.params.id).then((product) => {
			let image = _.find(product.images, { name: req.params.image })
			if(image) {
				res.sendFile(path.resolve(path.resolve(__dirname + "/../", image.url)));
			}
			else {
				res.status(400).send({ error: "No image found" });
			}
		})
		.catch((error) => {
			console.log("here")
			res.status(404).send(error);
		});
}

let postProduct = function(req, res) {
	const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions
	if (!errors.isEmpty()) {
		res.status(422).json({ errors: errors.array() });
		return;
	}

	let product = new Product(req.body);

	product.save(product).then(() => {
		res.status(201).send(product);
	})
	.catch((error) => {
		console.log(error)
		res.status(400).send("Something went wrong");
	})
};


module.exports = {
	postProduct: postProduct,
	putProduct: putProduct,
	getProducts: getProducts,
	getProduct: getProduct,
	getImages: getImages,
	validate: validate
}