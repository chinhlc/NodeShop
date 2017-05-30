// ORDER MODEL CLASS

class Order {
    constructor (db) {
        this.db = db;
    }

    selectOrder () {
        return this.db.any("SELECT * FROM orders");
    }

    selectOneOrder (id) {
        return this.db.oneOrNone("SELECT * FROM orders WHERE orders_id = $1", id);
    }

    selectDetail (id) {
        return this.db.any("SELECT * FROM detailed_orders WHERE orders_id = $1", id);
    }

    updateOrderStatus (id) {
        return this.db.none("UPDATE orders SET status = 'confirmed' WHERE orders_id = $1", id);
    }
    // LẤY DỮ LIỆU TỪ BẢNG HÓA ĐƠN
    // total revenue from order table - tổng doanh thu bán hàng lấy từ bảng đơn hàng
    countTotalRevenue () {
        return this.db.any("SELECT SUM(total_revenue) FROM bill");
    }
    // count total revenue by month - tính doanh thu hàng tháng 
    countMonthlyRevenue() {
        return this.db.any("SELECT SUM(total_revenue) AS month_revenue, EXTRACT(MONTH FROM founded_date) AS founded_month FROM bill GROUP BY founded_month ORDER BY founded_month");
    }
}

module.exports = Order;