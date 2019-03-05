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
           for(let i in res) {
               let data = res[i];
               table.create.prodList.push([
                   data.item_id, data.product_name, data.department_name, data.price, data.stock_quantity
               ]);
           };
           console.log(table.create.prodList.toString() + "\n\n\n\n")
        
        })
    };

    initInq(inquirer) {
        inquirer.prompt([{
            type: 'choices',
            message: 'which product would you like to purchase? please enter an item id',
            name: 'item'
        }]).then((data) => {
            data.item = parseInt(data.item);
            if(isNaN(data.item) === false) {
                let item = data.item;
                this.initQuant(inquirer, item)

            } else {
                console.log('Please enter a number')
                this.initInq(inquirer);
            }
        })
    };

    initQuant(inquirer, item) {
        inquirer.prompt([{
            type: 'input',
            message: 'How many would you like to purchase? Please enter a number \n',
            name: 'count'

        }]).then((data) => {
            data.count = parseInt(data.count);
            if(isNaN(data.count) === false) {
                let quantity = parseInt(data.count);
                console.log(quantity)
            } else {
                console.log('Please enter a number');
                this.initQuant(inquirer, item)
            }
        })
    }
    
};

let connect = new Bamazon();
connect.init();