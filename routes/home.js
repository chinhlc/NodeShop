const {db,} = require('../pgp');

const Product = require('../models/products');
const Accessory = require('../models/accessory');
const Category = require('../models/category');
const Image = require('../models/images');

const product = new Product(db);
const accessory = new Accessory(db);
const cate = new Category(db);
const image = new Image(db);

let log = console.log;

module.exports = function (express, cart) {

    const router = express.Router();


    router.get('/', (req, res, next) => {

        db.task(t => {
            return t.batch([
                //cate.selectCurrentById('ptpk'),
                product.selectHot(10),
                product.selectNew(10),
                accessory.selectHot(10)
            ]);
        })
            .then(data => {
                res.render('index.html', {
                    pageTitle: 'Trang chủ',
                    //childDtHeader: data[0],
                    //accessory: data[1],
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