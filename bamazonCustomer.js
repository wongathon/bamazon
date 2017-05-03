var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",
  port: "3306",
  user: "root",
  password: "",
  database: "Bamazon"
})

console.log("=====================");
console.log("Welcome to Bamazon!!!");
console.log("=====================");
console.log("Here are the goods: ");
console.log("---------------------");

//print out all products for sale. id, name, prices
connection.query("SELECT * FROM products", function(err, res){
  if (err) throw err;
  for (var i = 0; i < res.length; i++){
    console.log("Product id: " + res[i].item_id + " || Item: " + res[i].product_name + " || Price: " + res[i].price);
  }
});


var customerBuy = function(){

  connection.query("SELECT * from products", function(err, res){
    if (err) throw (err);
  
    inquirer.prompt([
      { //inquirer - id of product to buy
        type: "input",
        message: "ID of item you'd like to purchase?",
        name:"id",
      },{ // - how many units to buy
        type: "input",
        message: "UNITS of item you'd like to purchase?",
        name:"units",
      }
    ]).then(function(r){
      if (r.id && r.units){

        var selectedItem;
        for (var i = 0; i < res.length; i++) {
          if(res[i].item_id === parseInt(r.id)){
            selectedItem = res[i];
          } 
        }

        // after sale, update quantity, ELSE "not enough quant!"
        if (selectedItem.stock_quantity > parseInt(r.units)) {

          var newStock = selectedItem.stock_quantity - parseInt(r.units);
          var revenue = (selectedItem.price*parseInt(r.units)).toFixed(2);
          var totalRev = parseFloat(selectedItem.product_sales) + parseFloat(revenue);

          console.log(totalRev);

          connection.query("UPDATE products SET ? WHERE ?", [{stock_quantity: newStock}, {item_id: r.id }], function(err){
            if (err) throw err;
            console.log("You successfully purchased " +r.units+" of "+selectedItem.product_name+" for $"+revenue+"!!!");
          });

          connection.query("UPDATE products SET ? WHERE ?", [{product_sales: totalRev}, {item_id: r.id}], function(err){
            if (err) throw err;
          });

          //department_name is undefined???
          // connection.query("SELECT total_sales FROM departments WHERE ? = ?", [department_name, selectedItem.department_name], function(err, res){
          //     console.log(res);
          // })

          connection.query("UPDATE departments SET ? WHERE ?", [{total_sales: revenue}, {department_name: selectedItem.department_name}], function(err) {if (err) throw err;
            process.exit();
          });

        } else {
          console.log("Not enough of that item in stock! We only got "+selectedItem.stock_quantity +"...");
          process.exit();
        }

      } else if (r.id) {
        console.log("Please enter a valid number of units!");
      } else if (r.units) {
        console.log("Please enter a valid product ID!");
      };
    });
  });
};


customerBuy();


