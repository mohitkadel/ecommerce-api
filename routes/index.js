const routes = require('express').Router();
const authorize = require('../helper/authorize');

// const Role = require('../helper/role');

const userController = require('../controllers/user');
const productController = require('../controllers/product');
const couponController = require('../controllers/coupon');


routes.post('/login', userController.validate('postLogin'), userController.postLogin);
routes.post('/signup', userController.validate('postUser'), userController.signupUser);

routes.post('/users', authorize(), userController.validate('postUser'), userController.postUser);
routes.put('/users/:id', authorize(), userController.validate('putUser'), userController.putUser);
routes.get('/users/:id', authorize(), userController.getUsers);
routes.put('/users/:id/change-password', authorize(), userController.validate('changePassword'), userController.changePassword);
routes.get('/users', authorize(), userController.getUsers);


routes.post('/users/:id/order', authorize(), userController.orderProducts)

routes.get('/products', productController.getProducts)
routes.get('/products/:id', productController.getProduct)
routes.put('/products/:id', authorize(), productController.validate('putProduct'), productController.putProduct)
routes.post('/products', authorize(), productController.validate('postProduct'), productController.postProduct)
routes.get('/products/:id/images/:image', productController.getImages);


routes.get('/coupons', authorize(), couponController.getCoupons)
routes.get('/coupons/:id', authorize(), couponController.getCoupon)
routes.put('/coupons/:id', authorize(), couponController.validate('putCoupon'), couponController.putCoupon)
routes.post('/coupons', authorize(), couponController.validate('postCoupon'), couponController.postCoupon)

module.exports = routes;