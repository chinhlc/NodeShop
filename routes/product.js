const { db, } = require('../pgp');

const Product = require('../models/products');
const Category = require('../models/category');
const Image = require('../models/images');

const product = new Product(db);
const cate = new Category(db);
const image = new Image(db);

let log = console.log;

module.exports = function (express) {
    const router = express.Router();

    router.get('/', (req, res) => {

        let idClient = req.cookies['cart'];
        //Add to cart
        let addtocart = req.query['add-to-cart'];

        let cart = req.session.cart;
        //log(cart);
        let addcart = '';
	    if(typeof addtocart != 'undefined') {

            if(cart && cart[addtocart]) {
                let qty = parseInt(cart[addtocart]);
                cart[addtocart] = qty + 1;

                let cart_insert = {
                    session_user_id: idClient,
                    product_id: addtocart,
                    qty: qty + 1
                };

                db.none('UPDATE carts SET qty=${qty} WHERE session_user_id=${session_user_id} AND product_id=${product_id}', cart_insert)
                    .then(() => {
                        console.log('Update Success');
                    })
                    .catch(error => {
                        res.json({
                            success: false,
                            error: error.message || error
                        });
                    });
            }else {
                cart[addtocart] = 1;

                let cart_insert = {
                    id: '',
                    session_user_id: idClient,
                    product_id: addtocart,
                    qty: 1
                };
                db.none('INSERT INTO carts(session_user_id, product_id, qty) VALUES(${session_user_id}, ${product_id}, ${qty})', cart_insert)
                    .then(() => {
                        console.log('Insert Success');
                    })
                    .catch(error => {
                        res.json({
                            success: false,
                            error: error.message || error
                        });
                    });

            }
            //log(cart);
            addcart = product.selectName(addtocart);
        }

        let q = req.query.page;
        let n = 9;
        let pgfrom = 0;
        if (q != undefined && q > 0) {
            pgfrom = (pgfrom + q - 1) * n;
        } else {
            q = 0;
        }
        //
        let price = req.query.gia;
        let order = req.query.order;
        //
        db.task(t => {
            return t.batch([
                product.selectByPagination(n, pgfrom),
                product.countAll(),
                q,
                addcart
            ]);
        })
            .then(data => {
                let countAll = page = 0;
                data[1].forEach((index) => {
                    countAll = index.count;
                    page = Math.ceil(index.count / n, 0);
                });
                if (q > page) {
                    q = 1;
                }
                res.render('danh-sach.html', {
                    pageTitle: 'Điện thoại',
                    products: data[0],
                    countAll: data[1],
                    allpage: page,
                    pageCurrent: q
                });
            })
            .catch(error => {
                res.json({
                    success: false,
                    error: error.message || error
                });
            });
    });

    router.get('/:id', function (req, res) {
        let id = req.params.id;
        db.task(t => {
            return t.batch([
                product.detail(id),
                image.selectByParentId(id),
                product.selectNew(10)
            ]);
        })
            .then(data => {
                res.render('chi-tiet.html', { pageTitle: 'Điện Thoại', detail: data[0], images: data[1], productSimilar: data[2] });
            })
            .catch(error => {
                res.json({
                    success: false,
                    error: error.message || error
                });
            });
    });

    return router
};