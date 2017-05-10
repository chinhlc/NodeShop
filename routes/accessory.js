const { db, } = require('../pgp');

const Category = require('../models/category');
const Image = require('../models/images');
const Accessory = require('../models/accessory');
const PriceConverter = require('../models/priceConvert');

const cate = new Category(db);
const image = new Image(db);
const accessory = new Accessory(db);

let log = console.log;

module.exports = function (express) {
    const router = express.Router();

    router.get('/', (req, res) => {

        if (req.session.login === undefined) {
            req.session.login = false;
        }

        let q = req.query.page;
        let n = 9;
        let pgfrom = 0;
        if (q != undefined && q > 0) {
            pgfrom = (pgfrom + q - 1) * n;
        } else {
            q = 0;
        }
        let order = req.query.order;
        db.task(t => {
            if (order !== undefined) {
                switch (order) {
                    case 'newest':
                        return t.batch([
                            accessory.selectByNewest(n, pgfrom),
                            accessory.countAll(),
                            q
                        ])
                        break;
                    case 'hotest':
                        return t.batch([
                            accessory.selectBySales(n, pgfrom),
                            accessory.countAll(),
                            q
                        ])
                        break;
                    case 'hightolow':
                        return t.batch([
                            accessory.selectByPriceDesc(n, pgfrom),
                            accessory.countAll(),
                            q
                        ])
                        break;
                    case 'lowtohigh':
                        return t.batch([
                            accessory.selectByPriceAsc(n, pgfrom),
                            accessory.countAll(),
                            q
                        ])
                }
            } else {
                return t.batch([
                    accessory.selectByPagination(n, pgfrom),
                    accessory.countAll(),
                    q
                ]);
            }
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
                // reformat price
                data[0].forEach(eachProduct => {
                    eachProduct.price = PriceConverter(eachProduct.price);
                });
                //
                res.render('danh-sach-pk.html', {
                    pageTitle: 'Phụ Kiện',
                    login: req.session.login,
                    user: req.session.user,
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

        if (req.session.login === undefined) {
            req.session.login = false;
        }
        
        let id = req.params.id;

        db.task(t => {
            return t.batch([
                accessory.detail(id),
                image.selectByParentId(id),
                accessory.selectNew(10)
            ]);
        })
            .then(data => {
                // reformat price
                data[0].price = PriceConverter(data[0].price);
                data[2].forEach(eachProduct => {
                    eachProduct.price = PriceConverter(eachProduct.price);
                });
                //
                res.render('chi-tiet-pk.html', {
                    pagetitle: 'Phụ Kiện',
                    login: req.session.login,
                    user: req.session.user,
                    detail: data[0],
                    images: data[1],
                    productSimilar: data[2]
                });
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