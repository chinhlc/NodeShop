'use strict';

const Model = require('./model');

class Product extends Model {
    constructor(db) {
        super(db);
        this.db = db;
    }
    selectByPagination(n, pgfrom) {
        //return this.db.many('SELECT * FROM product﻿ORDER BY product_id DESC LIMIT $1 OFFSET $2', [n, pgfrom]);
        return this.db.many("SELECT * FROM product WHERE product_type_id = 'ptdt' ORDER BY product_id DESC LIMIT $1 OFFSET $2", [n, pgfrom]);
    }
    countAll() {
        return this.db.many("SELECT count(*) FROM product WHERE product_type_id = 'ptdt'");
    }
    detail(id) {
        return this.db.oneOrNone("SELECT * FROM product WHERE product_id = $1", id);
    }
    cartIDs (ids){
        return this.db.any("SELECT product_id, product_name, price FROM product WHERE product_type_id = 'ptdt' and product_id IN (" + ids + ")");
    }
    findByName(name) {
        return this.db.any("SELECT * FROM product WHERE product_type_id = 'ptdt' AND product_name like '%$1#%'", name);
    }
    selectHot(max) {
        return this.db.many("SELECT * FROM product WHERE product_type_id = 'ptdt' ORDER BY sales_volume DESC LIMIT $1", max);
    }
    selectNew(max) {
        return this.db.many("SELECT * FROM product WHERE product_type_id = 'ptdt' ORDER BY store_day DESC LIMIT $1", max);
    }
    selectByManufacturer(name, n, pgfrom) {
        return this.db.any("SELECT * FROM product WHERE product_type_id = 'ptdt' AND manufacturer_id ILIKE $1 LIMIT $2 OFFSET $3", [name, n, pgfrom]);
    }
    countAllByManufacturer(name) {
        return this.db.any("SELECT count(*) FROM product WHERE product_type_id = 'ptdt' AND manufacturer_id ILIKE $1", [name])
    }
    selectByOtherManufacturer(name1, name2, name3, n, pgfrom) {
        return this.db.any("SELECT * FROM product WHERE product_type_id = 'ptdt' AND manufacturer_id NOT ILIKE $1 AND manufacturer_id NOT ILIKE $2 AND manufacturer_id NOT ILIKE $3 LIMIT $4 OFFSET $5", [name1, name2, name3, n, pgfrom]);
    }
    countAllByOtherManufacturer(name1, name2, name3) {
        return this.db.any("SELECT count(*) FROM product WHERE product_type_id = 'ptdt' AND manufacturer_id NOT ILIKE $1 AND manufacturer_id NOT ILIKE $2 AND manufacturer_id NOT ILIKE $3", [name1, name2, name3])
    }
    selectByPrice(lowprice, highprice, n, pgfrom) {
        return this.db.any("SELECT * FROM product WHERE product_type_id = 'ptdt' AND price >= $1 AND price <= $2  ORDER BY price DESC LIMIT $3 OFFSET $4", [lowprice, highprice, n, pgfrom]);
    }
    countAllByPrice(lowprice, highprice) {
        return this.db.any("SELECT count(*) FROM product WHERE product_type_id = 'ptdt' AND price >= $1 AND price <= $2", [lowprice, highprice])
    }
    selectByNewest(n, pgfrom) {
        return this.db.many("SELECT * FROM product WHERE product_type_id = 'ptdt' ORDER BY store_day DESC LIMIT $1 OFFSET $2", [n, pgfrom]);
    }
    selectBySales(n, pgfrom) {
        return this.db.many("SELECT * FROM product WHERE product_type_id = 'ptdt' ORDER BY sales_volume DESC LIMIT $1 OFFSET $2", [n, pgfrom]);
    }
    selectByPriceDesc(n, pgfrom) {
        return this.db.many("SELECT * FROM product WHERE product_type_id = 'ptdt' ORDER BY price DESC LIMIT $1 OFFSET $2", [n, pgfrom]);
    }
    selectByPriceAsc(n, pgfrom) {
        return this.db.many("SELECT * FROM product WHERE product_type_id = 'ptdt' ORDER BY price ASC LIMIT $1 OFFSET $2", [n, pgfrom]);
    }
    selectName (id) {
        return this.db.oneOrNone("SELECT product_id, product_name FROM product WHERE product_id = $1", id);
    }
}

module.exports = Product;


//var sql = require('../sql').products;
/*
module.exports = (rep) => {

    return {
        query: (pgfrom, n) =>
            //rep.any('SELECT * FROM product﻿ORDER BY product_id DESC LIMIT $1 OFFSET $2', [n, pgfrom]),
            rep.any('SELECT * FROM product ORDER BY product_id DESC LIMIT $1 OFFSET $2', [n, pgfrom]),

        countAll: ()=>
            rep.any('SELECT count(*) FROM product'),

        byProductType: id =>
            rep.many('SELECT * FROM product WHERE product_type_id = $1', id),

        detail: id =>
            rep.oneOrNone('SELECT * FROM product WHERE product_id = $1', id),

        all: () =>
            rep.any('SELECT * FROM product ')
    };
};
*/
