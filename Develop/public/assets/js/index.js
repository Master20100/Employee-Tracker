const { query } = require('express');
const inquirer = require('inquirer');
const mysql = require('mysql2');


function show(myQuery) {
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
    myconnection.query(myQuery, function (error, results) {
        console.log(results)
    })
}



const intro_question = [{
    type: 'list',
    name: 'introquestions',
    message: 'Please add other team members, otherwise please exit',
    choices: ['View All Employees', 'Add Employee', 'Update Employee Role', 'View All Roles', 'Add Role', 'View All Departments', 'Add Department', 'Quit']
}]



inquirer.prompt(intro_question).then(answers => {
    switch (answers.introquestions) {
        case 'View All Departments':
            show(`SELECT * 
           FROM department`)
            break;
        case 'View All Roles':
            show(`SELECT role.id,role.title, department.name,role.salary 
            FROM role 
            JOIN department ON role.id = department.id`);
            break;
        case 'View All Employees':
            show(`SELECT employee.id,employee.first_name,employee.last_name,role.title,department.name,role.salary,CONCAT(manager.first_name,manager.last_name) AS manager
        FROM employee
        JOIN role
        ON employee.role_id = role.id
        JOIN department
        ON role.department_id = department.id)
        INNER JOIN employee manager
        ON employee.manager_id = manager.id`)

            break;
        case 'Add Department':
            inquirer.prompt([{
                name: "department_name",
                message: "What is the name of the department?"
            }]).then(answers => {
                show(`INSERT INTO department (name)
                VALUES ("${answers.department_name}"); `)
                console.log(`Added ${answers.department_name} to the database`);
            })
            break;
        case 'Add Role':
            inquirer.prompt([{
                name: "roleName",
                message: "What is the name of the role?"
            },
            {
                name: "salary",
                message: "What is the salary of the role?"
            },
            {
                type: 'list',
                name: "department",
                message: "Which department does the role belong to?",

                //TO BE FIXED
                choices: ['Engineering', 'Finance', 'Legal', 'Sales', 'Service']
            }
            ]).then(
                answers => {
                    const departmentName = show(`SELECT id
                             FROM department
                             WHERE name = ${answers.department}`);

                    show(`INSERT INTO role(title,salary,department_id)
                         VALUES("${answers.roleName}","${answers.salary}", "${departmentName}")`)
                    console.log(`Added ${departmentName} to the database`);
                }
            )
            break;
        case 'Add Employee':
            inquirer.prompt([{
                name: 'employeeFname',
                message: 'What is the employee\'s first name?'
            },
            {
                name: 'employeeLname',
                message: 'What is the employee\'s last name?'
            },
            {
                type: 'list',
                name: 'employeeRole',
                message: 'What is the employee\'s role?',

                //to be fixed
                choices: ['Sales Lead', 'Sales Person', 'Lead Engineer', 'Software Engineer', 'Account Manager', 'Accountant', 'Legal Team Lead', 'Lawyer', 'Customer Service', 'Sales Lead', 'Salesperson', 'Lead Engineer']
            },
            {
                type: 'list',
                name: 'manager',
                message: 'What is the employee\'s manager?',
                //TO BE FIXED ADD NONE
                choices: ['mina', 'nabil']
            }

            ]).then(
                answers => {
                    const roleId = show(`SELECT role.id
                        FROM role
                        WHERE role.title = answers.employeeRole}`)
                    const managerId = show(`
                         SELECT employee.id
                         FROM employee
                         WHERE answers.manager = CONCAT(employee.first_name,employee.last_name)`)
                    show(
                        //To be fixed role id and manager id
                         `INSERT INTO employee(first_name,last_name,role_id,manager_id)
                         VALUES ("${answers.employeeFname}", "${answers.employeeLname}","1", 
                            "2");`)

                    console.log(answers.employeeFname + ' ' + answers.employeeLname + " " + roleId + " " + managerId);
                }
            )
            break;
        case 'Update Employee Role':
            inquirer.prompt([{
                type: 'list',
                name: 'employeeRole',
                message: 'Which employee\'s role do you want to update?',
                choices: [show(`SELECT CONCAT(employee.first_name,employee.last_name)
                FROM employee`)]
            }

            ])
    }
}
)


