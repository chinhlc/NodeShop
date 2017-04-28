const {db, } = require('../pgp');
const shortid = require('shortid');

const Product = require('../models/products');

const product = new Product(db);

let log = console.log;

module.exports = function (express, csrfProtection) {
	const router = express.Router();

	router.get('/', csrfProtection, (req, res) => {

	    //Lấy giá trị session cart
        let cart = req.session.cart;
        //log(cart);
        let ids = '';
        let count = 0;

        //Lấy chuỗi product_id để SELECT DATABASE
        for(item in cart){
            count++;
            if(count === 1){
                ids += "'" + item + "'";
            }else{
                ids += ",'" + item + "'";
            }
        }

        //Đếm cart
        let countCart = 0;
        if(cart) {
            countCart = Object.keys(cart).length;
        }
        if (!cart || countCart === 0) {
            res.render('gio-hang.html', {
                title: 'Giỏ hàng',
                product: '',
                cart: '',
                csrfToken: req.csrfToken()
            });
        }else {

            db.task(t => {
                return t.batch([
                    product.cartIDs(ids),
                    cart
                ]);
            })
                .then(data => {
                    //log(data);
                    res.render('gio-hang.html', {
                        title: 'Giỏ hàng',
                        product: data[0],
                        cart: data[1],
                        csrfToken: req.csrfToken()
                    });
                })
                .catch(error => {
                    res.json({
                        success: false,
                        error: error.message || error
                    });
                });
        }
	});

	router.post('/', (req, res) => {

	    //log(req.body);
        let idClient = req.cookies['cart'];
        let cart = req.session.cart;
        let ids = '';
        let count = 0;
        if(req.body['capnhat']){
            for (item in cart) {
                if (req.body[item] > 0) {

                    cart[item] = req.body[item];

                    let qty = req.body[item];

                    let cart_insert = {
                        session_user_id: idClient,
                        product_id: item,
                        qty: qty
                    };

                    db.none('UPDATE carts SET qty=${qty} WHERE session_user_id=${session_user_id} AND product_id=${product_id}', cart_insert)
                        .then(() => {
                            console.log('Cart: Update Success');
                        })
                        .catch(error => {
                            res.json({
                                success: false,
                                error: error.message || error
                            });
                        });
                } else {
                    delete cart[item];
                    let cart_insert = {
                        session_user_id: idClient,
                        product_id: item
                    };
                    db.none('DELETE FROM carts WHERE session_user_id=${session_user_id} AND product_id=${product_id}', cart_insert)
                        .then(() => {
                            console.log('Cart: Delete Success');
                        })
                        .catch(error => {
                            res.json({
                                success: false,
                                error: error.message || error
                            });
                        });
                }
            }
        }

        for (item in cart) {
            count++;
            if (count === 1) {
                ids += "'" + item + "'";
            } else {
                ids += ",'" + item + "'";
            }
        }

        //log(ids);
        let countCart = Object.keys(cart).length;
        if (countCart === 0) {
            res.render('gio-hang.html', {
                title: 'Giỏ hàng',
                product: '',
                cart: '',
                csrfToken: req.csrfToken()
            });
        }

        db.task(t => {
            return t.batch([
                product.cartIDs(ids),
                cart
            ]);
        })
            .then(data => {
                res.render('gio-hang.html', {
                    title: 'Giỏ hàng',
                    product: data[0],
                    cart: data[1],
                    csrfToken: req.csrfToken()
                });
            })
            .catch(error => {
                res.json({
                    success: false,
                    error: error.message || error
                });
            });
	});

	return router;
};