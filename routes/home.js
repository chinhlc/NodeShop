const { db, } = require('../pgp');

const Product = require('../models/products');
const Accessory = require('../models/accessory');
const Category = require('../models/category');
const Image = require('../models/images');
const PriceConverter = require('../models/priceConvert');

const product = new Product(db);
const accessory = new Accessory(db);
const cate = new Category(db);
const image = new Image(db);

let log = console.log;

module.exports = function (express, cart) {

    const router = express.Router();


    router.get('/', (req, res, next) => {
        // check if user is logged in -> if not assign req.session.login = false
        if (req.session.login === undefined) {
            req.session.login = false;
        }
        //console.log(req.session);
        // query database to get product data
        db.task(t => {
            return t.batch([
                //cate.selectCurrentById('ptpk'),
                product.selectHot(10),
                product.selectNew(10),
                accessory.selectHot(10)
            ]);
        })
            .then(data => {
                // reformat price
                data[0].forEach(eachProduct => {
                    eachProduct.price = PriceConverter(eachProduct.price);
                });
                data[1].forEach(eachProduct => {
                    eachProduct.price = PriceConverter(eachProduct.price);
                });
                data[2].forEach(eachProduct => {
                    eachProduct.price = PriceConverter(eachProduct.price);
                });
                //
                res.render('index.html', {
                    pageTitle: 'Trang chủ',
                    login: req.session.login,
                    user: req.session.user,
                    productHot: data[0],
                    productNew: data[1],
                    accessoryHot: data[2]
                });
            })
            .catch(error => {
                return error.detail;
            });
    });

    return router
};