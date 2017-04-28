const {db, } = require('../pgp');
const shortid = require('shortid');

const Product = require('../models/products');

const product = new Product(db);

let log = console.log;

function getFormattedDate() {
    var date = new Date();
    var str = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +  date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

    return str;
}

module.exports = function (express, csrfProtection) {
	const router = express.Router();

	router.post('/', csrfProtection, (req, res) => {

	    //log(req.body);
        let idClient = req.cookies['cart'];
        let cart = req.session.cart;
        let ids = '';
        let count = 0;

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
            window.location.replace("/gio-hang/");
            exit;
        }

        db.task(t => {
            return t.batch([
                product.cartIDs(ids),
                cart
            ]);
        })
            .then(data => {
                let total = 0;
                data[0].forEach((item) => {
                    total = total + (item.price * data[1][item.product_id]);
                });
                //log(data[1])
                if(req.body['thanhtoan']) {
                    if(req.body['name'] && req.body['phone'] && req.body['email'] && req.body['address'] && req.body['method']){
                        let order_id = shortid.generate();
                        let val = {
                            id: order_id,
                            user_id: '1',
                            name: req.body['name'],
                            phone: req.body['phone'],
                            email: req.body['email'],
                            address: req.body['address'],
                            method: req.body['method'],
                            note: req.body['note'],
                            status: 'pending',
                            order_date: getFormattedDate(),
                            //delivery_date: 'NULLIF("0000-00-00 00:00:00", "0000-00-00 00:00:00")::timestamp',
                            delivery_date: '0000-00-00 00:00:00',
                            total: total
                        };
                        //log('INSERT INTO orders VALUES(' + val.id + ', ' + val.user_id + ', ' + val.name + ', ' + val.phone + ', ' + val.email + ', ' + val.address + ', ' + val.note + ', ' + val.status + ', ' + val.total + ', ' + val.method + ', ' + val.order_date + ', ' + val.delivery_date + ')');
                        /*
                        db.query("INSERT INTO orders (orders_id, user_id, name, phone, email, address, note, status, total, method, order_date, delivery_date)" +
                            "VALUES($(id), ${user_id}, ${name}, ${phone}, ${email}, ${address}, ${note}, ${status}, ${total}, ${method}, ${order_date}, ${delivery_date})", val)
                            */
                        db.task(t => {
                            let queries = lst.map(l => {
                                return t.one("INSERT INTO orders (orders_id, user_id, name, phone, email, address, note, status, total, method, order_date, delivery_date)" +
                            "VALUES($(id), ${user_id}, ${name}, ${phone}, ${email}, ${address}, ${note}, ${status}, ${total}, ${method}, ${order_date}, ${delivery_date})", val)
                            });
                            return t.batch(queries);
                        })
                            .then((data) => {
                            log(data);
                            res.render('thanh-cong.html', {
                                title: 'Đặt hàng thành công',
                                idClient: idClient
                            });
                        })
                        .catch(error => {
                            res.json({
                                success: false,
                                error: error.message || error
                            });
                        });
                    }
                }else {
                    window.location.replace("/gio-hang/");
                }
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