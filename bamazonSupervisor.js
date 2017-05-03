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
  runSupervisor();
});

var runSupervisor = function(){

  console.log("...")
  console.log("=====================");
  console.log("Welcome to Bamazon Supervisor!!!");
  console.log("=====================");
  console.log("Here are your options: ");
  console.log("---------------------");

  inquirer.prompt({
    name: "action",
    type: "rawlist",
    message: "What would you like to do?",
    choices: [
      "View product sales by department", //id's, name, prices, quantity
      "Create New department",
      "Quit"
    ]
  }).then(function(ans) {
    switch (ans.action) {
      case "View product sales by department":
        viewDepartments();
        break;
      case "Create New department":
        newDepartment();
        break;
      case "Quit":
        process.exit();
      default: 
        console.log("No command!");
        break;
    }
  });
};

var viewDepartments = function(){
  connection.query("SELECT * FROM departments", function(err, res){
    if (err) throw err;
    for (var i = 0; i < res.length; i++){
      var profits = res[i].total_sales - res[i].overhead_costs;
      console.log("Department id: " + res[i].department_id + " || Name: " + res[i].department_name + " || Overhead: " + res[i].overhead_costs +" || Total Sales: " + res[i].total_sales + " || Total Profits: "+ profits);
    };
    runSupervisor();
  });
};

var newDepartment = function(){
  console.log("Add a department:");
  inquirer.prompt([
    {
      type: "input",
      message: "Department Name?",
      name: "dname"
    },{
      type: "input",
      message: "Department Overhead costs?",
      name: "doverhead"
    },{
      type: "input",
      message: "Any product sales so far? [if none, press Enter]",
      name: "sales",
      default: 0
    }
  ]).then(function(ans){
    if (ans.dname && ans.doverhead){
      connection.query("INSERT INTO departments (department_name, overhead_costs, total_sales) VALUES (?, ?, ?);", [ans.dname, ans.doverhead, ans.sales], function(err, res){
          if (err) throw err;
          console.log("Successfully added department!");
          runSupervisor();
      });
    } else {
      console.log("Please enter all information.");
      runSupervisor();
    }
  });
};

