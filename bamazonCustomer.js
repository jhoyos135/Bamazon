const mysql = require('mysql');
const inquirer = require('inquirer');
const table = require('./table');

let connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'bamazon_db'
});

class Bamazon {
    init() {
        this.startDb();
        this.displayProducts();
        this.initInq(inquirer);
    };

    startDb() {
        connection.connect((err) => {
            if(err) {throw err;}
            // console.log('connected to database: id: ', connection.threadId);
        })
    };

    displayProducts() {
        connection.query(`SELECT * FROM products`,
        (err, res) => {
            if(err) {throw err;}

           for(let i in res) {
               let data = res[i];
               table.create.prodList.push([
                   data.item_id, data.product_name, data.department_name, data.price, data.stock_quantity
               ]);
           };
           console.log( "\n" + table.create.prodList.toString() + "\n")
        
        })
    };

    initInq(inquirer) {
        inquirer.prompt([{
            type: 'choices',
            message: 'Which product would you like to purchase? please enter an item id \n\n',
            name: 'item'
        }]).then((data) => {
            data.item = parseInt(data.item);
            if(isNaN(data.item) === false) {
                let item = data.item;
                // callback functions
                this.initQuant(inquirer, item)

            } else {
                console.log('Please enter a number')
                // callback functions
                this.initInq(inquirer);
            }
        })
    };

    initQuant(inquirer, item) {
        inquirer.prompt([{
            type: 'input',
            message: 'How many would you like to purchase? Please enter a number \n\n',
            name: 'count'

        }]).then((data) => {
            data.count = parseInt(data.count);
            if(isNaN(data.count) === false) {
                let quantity = parseInt(data.count);
                // callback functions
                this.confirmOrder(inquirer, item, quantity);
            } else {
                console.log('Please enter a number');
                // callback functions
                this.initQuant(inquirer, item)
            }
        })
    };

    confirmOrder(inquirer, item, quantity) {
        let query = 'SELECT product_name, price, stock_quantity FROM products WHERE ?';
        connection.query(query, {item_id: item}, (err, res) => {
            let cost = quantity * res[0].price;
            let response = '';
            inquirer.prompt({
                name: 'confirmOrder',
                type: 'confirm',
                message: `Please confirm you want to purchase ${quantity} ${res[0].product_name} for $${cost}`
            }).then((answer) => {
                if(answer.confirmOrder === true) {
                    if(quantity <= res[0].stock_quantity) {
                        response = '\nWe are processing your order... \n1';
                        let quantityNew = res[0].stock_quantity - quantity;
                        let productName = res[0].product_name;
                        // callback functions
                        this.createOrder(item, productName, quantity, cost, quantityNew);
                        this.updateDb(item, quantityNew);
                    } else {
                        response = `Sorry but you have requested more ${res[0].product_name} than we have available.`;
                        this.stopDb;
                    }
                    console.log(response);
                } else {
                console.log('\nsee your later');
                // callback functions
                this.stopDb();
                }
            })
        })
    };

    createOrder(item, productName, quantity, cost, quantityNew) {
        connection.query(
            `INSERT INTO orders SET ?`, {
                item_id: item,
                product_name: productName,
                quantity: quantity,
                total_price:cost,
                remaining_stock: quantityNew
            },
            (err) => {
                if(err) {throw err;}
                console.log('Your order was made');
                connection.query('SELECT * FROM orders', (err, res) => {
                    if(err) {throw err;}
                    for(let i in res) {
                        let data = res[i];
                        table.create.orders.push([
                            data.order_id, data.item_id, data.product_name, data.quantity, data.total_price, data.remaining_stock
                        ]);
                    }
                    console.log('\n' + table.create.orders.toString() + '\n');
                })
            }
        )
    };

    updateDb(item, quantityNew) {
        connection.query(
            `UPDATE products SET ? WHERE ?`, [
                {stock_quantity: quantityNew},
                {item_id: item}
            ], (err) => {
                if(err) {throw err;}
                console.log('Database has been updated. \n');
                this.stopDb()
            }
        )
    };

    stopDb() {
        connection.end(err => {
            if(err){throw err;}
            console.log('Disconnected from Database \n');
        })
    };
    
};

let connect = new Bamazon();
connect.init();