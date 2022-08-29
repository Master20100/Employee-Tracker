const inquirer = require('inquirer');
const mysql = require('mysql2');


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


function init() {

    prompt();
}

function show(myQuery) {
    myconnection.query(myQuery, (err, res) => {
        if (err) console.log(err);
        if (myQuery[0] == 'S') { console.table(res) };
        prompt();
    })
}






const intro_question = [{
    type: 'list',
    name: 'introquestions',
    message: 'Please add other team members, otherwise please exit',
    choices: ['View All Employees', 'Add Employee', 'Update Employee Role', 'View All Roles', 'Add Role', 'View All Departments', 'Add Department', 'Update Employee Manager', 'Quit']
}]


function prompt() {
    inquirer.prompt(intro_question)
        //we added async in front of a function here, so that we can use await many times inside that function
        //using myconnection.promise.query
        .then(async answers => {
            switch (answers.introquestions) {
                case 'Quit':
                    console.log("Goodbye");
                    process.exit();

                case 'View All Departments':
                    show(`SELECT * 
                    FROM department;`);
                    break;

                //try
                case 'View All Roles':
                    show(`SELECT role.id,role.title, department.name,role.salary 
            FROM role 
            JOIN department ON role.id = department.id`);
                    break;

                case 'View All Employees':
                    show(`SELECT employee.id,
                    employee.first_name,
                    employee.last_name,
                    role.title,
                    department.name,
                    role.salary,
                    CONCAT(manager.first_name,manager.last_name) AS manager
            FROM employee
            LEFT JOIN role ON employee.role_id = role.id
            LEFT JOIN department ON role.department_id = department.id
            LEFT JOIN employee manager ON employee.manager_id = manager.id;`)
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
                //try
                case 'Add Role':
                    const [departments] = await myconnection.promise().query(`SELECT * FROM department`);
                    const departmentChoices = departments.map(el => ({ name: el.name, value: el.id }))
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
                        choices: departmentChoices
                    }
                    ]).then(
                        answers => {

                            show(`INSERT INTO role(title,salary,department_id)
                                 VALUES("${answers.roleName}","${answers.salary}", "${answers.department}")`)
                            console.log(`Added ${answers.roleName} to the database`);
                        }
                    )

                    break;
                case 'Add Employee': {
                    const [roles] = await myconnection.promise().query(`SELECT *
                        FROM role;`)
                    const roleChoices = roles.map(el => ({ name: el.title, value: el.id }));
                    const [manager] = await myconnection.promise().query(` SELECT *
                        FROM employee;`);
                    let managerList = [{}];
                    managerList = manager.map(el => ({ name: el.first_name + ' ' + el.last_name, value: el.id }));
                    if (managerList.length === 0) { managerList.push({ name: "no manager", value: "0" }) };


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
                        choices: roleChoices
                    },
                    {
                        type: 'list',
                        name: 'manager',
                        message: 'What is the employee\'s manager?',
                        choices: managerList
                    }

                    ]).then(
                        answers => {

                            show(
                                `INSERT INTO employee(first_name,last_name,role_id,manager_id)
                                VALUES ("${answers.employeeFname}", "${answers.employeeLname}",${answers.employeeRole}, 
                                ${answers.manager});`)

                            console.log(answers.employeeFname + ' ' + answers.employeeLname + " has been added");
                        }
                    )
                    break;
                }
                case 'Update Employee Role': {
                    const [roles] = await myconnection.promise().query(`SELECT *
                                FROM role;`);
                    const roleChoices = roles.map(el => ({ name: el.title, value: el.id }));
                    const [manager] = await myconnection.promise().query(` SELECT *
                                FROM employee;`);
                    const managerList = manager.map(el => ({ name: el.first_name + ' ' + el.last_name, value: el.id }))

                    //employee names and their ids
                    inquirer.prompt([{
                        type: 'list',
                        name: 'employee',
                        message: 'Which employee\'s role do you want to update?',
                        choices: managerList
                    }
                        //role title and role id
                    ]).then(answers1 => {
                        inquirer.prompt([{
                            type: 'list',
                            name: 'role',
                            message: 'Which role do you want to update?',
                            choices: roleChoices
                        }

                        ]).then(
                            answers2 => {
                                show(
                                    `UPDATE employee
                                SET role_id = ${answers2.role}
                                WHERE id = ${answers1.employee}
                                `
                                )
                                console.log("role has been updated successfully")
                            }
                        )

                    }

                    )
                    break;
                }

                case 'Update Employee Manager': {
                    const [employeeList] = await myconnection.promise().query(
                        `SELECT  first_name,last_name,id
                        FROM employee;
                        `
                    );

                    const employee = employeeList.map(el => ({ name: el.first_name + ' ' + el.last_name, value: el.id }))

                    inquirer.prompt([{
                        type: 'list',
                        name: 'employee',
                        message: 'Which employee do you want to update?',
                        choices: employee
                    },
                    {

                        type: 'list',
                        name: 'manager',
                        message: 'Which manager do you want to choose?',
                        choices: employee
                    }

                        //role title and role id
                    ]).then(answers => {

                        console.log('manager has been updated');
                        show(`
                        UPDATE employee
                        SET manager_id = ${answers.manager}
                        WHERE id = ${answers.employee};
                        `
                        )
                    }
                    )

                }
            }
        }
        )

}
init();

