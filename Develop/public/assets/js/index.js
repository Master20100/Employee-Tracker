const { query } = require('express');
const inquirer = require('inquirer');
const mysql = require('mysql2');
function show(myQuery){
const myconnection = mysql.createConnection({
    host: 'localhost',
    // MySQL username,
    user: 'root',
    // MySQL password
    password: 'P@ssw0rd',
    database: 'employee_tracker'
  },
  console.log(`Connected to the courses_db database.`)
);
myconnection.query(myQuery,function(error,results){console.log(results)})
}
//WHEN I start the application
//THEN I am presented with the following options: view all departments, view all roles, view all employees, add a department, add a role, add an employee, and update an employee role

const intro_question = [{
    type: 'list',
    name: 'introquestions',
    message: 'Please add other team members, otherwise please exit',
    choices: ['view all departments', 'view all roles', 'view all employees','add a department','add a role','add an employee','update an employee role']
}]

// WHEN I choose to view all departments
// THEN I am presented with a formatted table showing department names and department ids
// WHEN I choose to view all roles
// THEN I am presented with the job title, role id, the department that role belongs to, and the salary for that role
// WHEN I choose to view all employees
// THEN I am presented with a formatted table showing employee data, including employee ids, first names, last names, job titles, departments, salaries, and managers that the employees report to


inquirer.prompt(intro_question).then(answers=>{
switch (answers.introquestions){
     case 'view all departments':
        show('select * FROM department');
        break;
     case 'view all roles':
        show('SELECT role.title,role.id,department.name,role.salary FROM role JOIN department ON role.id = department.id');

        //to be continued
    case 'all employees':
        show(` SELECT employee.id,employee.first_name,employee.last_name,role.title,department.name,role.salary,employee.name AS manager
        FROM employee
        JOIN role ON employee.id = role.id
        JOIN department ON employee.id = department.`)
}
})



