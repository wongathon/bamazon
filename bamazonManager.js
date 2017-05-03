var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "Bamazon"
});

connection.connect(function(err) {
  if (err) throw err;
  runManager();
});

var runManager = function(){

  console.log("...")
  console.log("=====================");
  console.log("Welcome to Bamazon Manager!!!");
  console.log("=====================");
  console.log("Here are your options: ");
  console.log("---------------------");

  inquirer.prompt({
    name: "action",
    type: "rawlist",
    message: "What would you like to do?",
    choices: [
      "View products for sale", //id's, name, prices, quantity
      "View low inventory", //items less than 5
      "Add to inventory", //add quantity number to inventory
      "Add new product", // add a new item, with all info
      "Quit"
    ]
  }).then(function(answer) {
    switch (answer.action) {
      case "View products for sale":
        viewProducts();
        break;
      case "View low inventory":
        lowInventory();
        break; 
      case "Add to inventory":
        addInventory();
        break;
      case "Add new product":
        addProduct();
        break;
      case "Quit":
        process.exit();
      default: 
        console.log("No command!");
        break;
    }
  });
};

var viewProducts = function(){
  connection.query("SELECT * FROM products", function(err, res){
    if (err) throw err;
    for (var i = 0; i < res.length; i++){
      console.log("Product id: " + res[i].item_id + " || Item: " + res[i].product_name + " || Price: " + res[i].price +" || Quantity: " + res[i].stock_quantity);
    };
    runManager();
  });
};

var lowInventory = function(){ // test with new item
  connection.query("SELECT * FROM products WHERE stock_quantity < 5", function(err, res){
    if (err) throw err;

    console.log("...");
    if (res.length >= 1) {
      console.log("Low inventory on the following item(s):")
      console.log("...");
      for (var i = 0; i < res.length; i++){
        console.log("Product id: " + res[i].item_id + " || Item: " + res[i].product_name + " || Price: " + res[i].price +" || Quantity: " + res[i].stock_quantity);
      };
    } else {
      console.log("You have no low inventories!")
    }
    
    runManager();
  });
};

var addInventory = function(){

  connection.query("SELECT * from products", function(err, res){
    if(err) throw err;

    for (var i = 0; i < res.length; i++){
      console.log("Product id: " + res[i].item_id + " || Item: " + res[i].product_name + " || Price: " + res[i].price +" || Quantity: " + res[i].stock_quantity);
    };

    inquirer.prompt([
      {
        type: "input",
        message: "ID of item to add quantity?",
        name: "id",
      },{ 
        type: "input",
        message: "UNITS of the item you'd like to add?",
        name: "units",
      }
    ]).then(function(answer){
      if (answer.id && answer.units) {

        var selectedItem;
        for (var i = 0; i < res.length; i++) {
          if(res[i].item_id === parseInt(answer.id)){
            selectedItem = res[i];
          } 
        }

        var addStock = parseInt(selectedItem.stock_quantity) + parseInt(answer.units);

        console.log(addStock);

        connection.query("UPDATE products SET ? WHERE ?", [{
          stock_quantity: addStock 
        }, {
          item_id: answer.id
        }], function(err){
          if (err) throw err;
          console.log("Successfully added quantity "+answer.units);
          runManager();
        });

      } else {
        console.log("Invalid entry.");
        addInventory();
      }
    });
  });
};

var addProduct = function(){
  console.log("Add a product:");
  inquirer.prompt([
    {
      type: "input",
      message: "Product Name?",
      name: "pname"
    },{
      type: "input",
      message: "Department Name?",
      name: "dname"
    },{
      type: "input",
      message: "Product Price (Two Decimals)?",
      name: "price"
    },{
      type: "input",
      message: "Stock quantity?",
      name: "quant"
    }
  ]).then(function(ans){
    if (ans.pname && ans.dname && ans.price && ans.quant){
      connection.query("INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES (?, ?, ?, ?);", [ans.pname, ans.dname, ans.price, ans.quant], function(err, res){
          if (err) throw err;
          console.log("Successfully added product!");
          runManager();
      });
    } else {
      console.log("Please enter all information.");
      addProduct();
    }
  });
};

