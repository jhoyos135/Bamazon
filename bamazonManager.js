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
        this.initInq(inquirer);
    }

    startDb() {
        connection.connect((err) => {
            if(err) {throw err;}
            // console.log('connected to database: id: ', connection.threadId);
        })
    };

    initInq(inquirer) {
        inquirer.prompt([{
            name: 'manage',
            type: 'rawlist',
            message: '\n\n What would you like to do?',
            choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory' , 'Add New Product', 'Exit Program']
        }]).then((data) => {
            switch(data.manage) {
                case 'View Products for Sale':
                this.displayProducts(inquirer);
                break;
                case 'View Low Inventory':
                this.lowInventory(inquirer);
                break;
                case 'Add to Inventory':
                this.addInventory(inquirer);
                break;
                case 'Add New Product':
                this.addProduct(inquirer);
                break;

                default:
                this.stopDb();
            }
        })
    };

    // display products
    displayProducts(inquirer) {
        table.create.prodList.splice(0);
        connection.query(`SELECT * FROM products`, (err, res) => {
            if(err) {throw err;}
            for(let i in res) {
                let data = res[i];
                table.create.prodList.push([data.item_id, data.product_name, data.department_name, data.price, data.stock_quantity]);
            }
            console.log('\n\n' + table.create.prodList.toString() + '\n\n');
            console.log('Press any key to continue');
        });
        this.initInq(inquirer)
    };

    // low inventory
    lowInventory(inquirer) {
        table.create.lowInv.splice(0);
        connection.query(`SELECT * FROM products`, (err, res) => {
            if(err) {throw err;}

            for(let i in res) {
                let data = res[i];
                if(data.stock_quantity < 5) {
                    table.create.lowInv.push([data.item_id, data.product_name, data.department_name, data.price, data.stock_quantity]);
                }
            }
            console.log('\n\n' + table.create.lowInv.toString() + '\n\n');
            console.log('Press any key to continue')
        })
        this.initInq(inquirer)
    };

    // add inventory of current products
    addInventory(inquirer) {
        table.create.prodList.splice(0);
        connection.query(`SELECT * FROM products`, (err, res) => {
            if(err) {throw err;}
            for(let i in res) {
                let data = res[i];
                table.create.prodList.push([data.item_id, data.product_name, data.department_name, data.price, data.stock_quantity]);
            }
            console.log('\n\n' + table.create.prodList.toString() + '\n\n');
        });
        inquirer.prompt([{
            type: 'choices',
            message: 'For which product would you like to adjust the inventory? Please enter an id \n',
            name: 'item'
        }]).then((data) => {
            data.item = parseInt(data.item);
            if(isNaN(data.item) === false) {
                let item = data.item;
                this.initQuantity(inquirer, item);
            } else {
                console.log('Please enter a number');
                this.addInventory(inquirer);
            }
        })
    };

    // set the quantity of the order
    initQuantity(inquirer, item) {
        inquirer.prompt([{
            type: 'input',
            message: 'How many units would you like to add? Please enter a number \n\n',
            name: 'count'
        }]).then((data) => {
            data.count = parseInt(data.count);
            if(isNaN(data.count) === false) {
                let quantity = parseInt(data.count);
                this.confirmInventoryOrder(inquirer, item, quantity);
            } else {
                console.log('Please enter a number');
                this.initQuantity(inquirer, item);
            }
        });
    };

    // confirm the order 
    confirmInventoryOrder(inquirer, item, quantity) {
        let query = 'SELECT * from products WHERE ?';
        connection.query(query, {item_id: item}, (err, res) => {
            inquirer.prompt({
                name: 'confirmOrder',
                type: 'confirm',
                message: `Please confirm you want to add ${quantity} ${res[0].product_name} to the inventory`
            }).then((answer) => {
                if(answer.confirmOrder === true) {
                    console.log('We are processing your request!... \n\n');
                    let quantNew = res[0].stock_quantity + quantity;
                    let prodName = res[0].product_name;
                    this.createOrder(inquirer, item, prodName, quantity, quantNew);
                    this.updateDB(inquirer, item, quantNew);
                }
            });
        })
    };

    // create the order
    createOrder(inquirer, item, prodName, quantity, quantNew) {
        connection.query(
            "INSERT INTO inventory SET ?", {
                item_id: item,
                product_name: prodName,
                current_stock: quantNew - quantity,
                quantity_added: quantity,
                updated_stock: quantNew
            }, (err) => {
                if (err) {throw err;}
                console.log("Your request has been processed! \n\n");
                connection.query("SELECT * FROM inventory", (err, res) => {
                    if (err) {throw err;};
                    for (let i in res) {
                        var data = result[i];
                        table.create.inventoryLog.push([data.log_id, data.item_id, data.product_name, data.current_stock, data.quantity_added, data.updated_stock]);
                    }
                    table.create.prodList.push(["item", "inventories", "have", "been", "updated"]);
                    console.log("\n\n" + table.create.inventoryLog.toString() + "\n\n");
                    console.log("Press any key to continue");

                });
            }
        );
    };

    // update database
    updateDB(inquirer, item, quantNew) {
        connection.query(
            "UPDATE products SET ? WHERE ?", [
                { stock_quantity: quantNew },
                { item_id: item }
            ], (err) => {
                if (err) {throw err;}
                console.log("The database has been updated! \n\n");
                this.initInq(inquirer, item);
            }
        );
    };

    // add a new product to the database
    addProduct(inquirer) {
        inquirer.prompt([{
            name: 'itemName',
            message: '\nEnter the product name: \n'
            },
            {
            name: 'dept',
            message: '\nEnter the name of the department:\n'
            },
            {
            name: 'price',
            message: '\nEnter the price of the item:\n'
            },
            {
            name: 'stock',
            message: '\nHow many of these items are in stock?\n'
            }
    ]).then((data) => {
        connection.query(
            "INSERT INTO products SET ?", {
                product_name: data.itemName,
                department_name: data.dept,
                price: data.price,
                stock_quantity: data.stock
            }, (err) => {
                if(err) {throw err;}
                console.log('Your request has been processed!... \n\n');
                table.create.prodList.splice(0);
                connection.query('SELECT * FROM products', (err, res) => {
                    if(err) {throw err;}
                    for(let i in res) {
                        let data = res[i];
                        table.create.prodList.push([data.item_id, data.product_name, data.department_name, data.price, data.stock_quantity]);
                    }
                    console.log('\n\n' + table.create.prodList.toString() + '\n\n');
                    console.log('Press any key to continue');
                });
                this.initInq(inquirer);
            })
    });
    };

    // stop connection
    stopDb() {
        connection.end((err) => {
            if(err) {throw err;}
            console.log('Disconnected from database \n\n');
        })
    };
    
};

let connect = new Bamazon();
connect.init();