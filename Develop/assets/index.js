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
        if(err)console.log(err);
        if (myQuery[0] == 'S') { console.log(res) };
        prompt();
    })
}
function showReturn(myQuery) {
    myconnection.query(myQuery, (err, res) => {
    if(err)console.log(err);
     return res;
})
}


//  function show1(myQuery) {
//     // return 
//     myconnection.query(myQuery,(err,res)=>{        
//     }
//     )
// }
//  function show2(myQuery) {
//     // return 
//     myconnection.query(myQuery, function (err, result, fields) {
//         // if any error while executing above query, throw error
//         if (err) throw err;
//         // if there is no error, you have the result
//         // iterate for all the rows in result
//         let x = []
//         Object.keys(result).forEach(function(key) {
//           var row = result[key];
//           x.push(row.name);
//         });
//         console.log(x);
//         return x;
//       });
//     };



const intro_question = [{
    type: 'list',
    name: 'introquestions',
    message: 'Please add other team members, otherwise please exit',
    choices: ['View All Employees', 'Add Employee', 'Update Employee Role', 'View All Roles', 'Add Role', 'View All Departments', 'Add Department', 'Quit']
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
                    //await to be used only with promise objects.
                    //asynchronous functions are based on either cb functions or promise object
                    //myconnection is async, but it is not based on promises. 
                    //myconnection.promise().query is async based on promises, so we dont need this callback function
                    //(err,res)=>{return res} and will be using either async/await or then
                // const departmentChoices =  await myconnection.promise().query(`SELECT * FROM department`);
                // console.log(departmentChoices);
                //myconnection.promise since based on promises, we can use await, however to use await, will have to put it inside 
                //async function.
                //it does return an array of arrays, the first array is the table we would like to retrieve
                const [departments] =  await myconnection.promise().query(`SELECT * FROM department`);
                const departmentChoices = departments.map(el => ({name: el.name, value: el.id}))
                    console.log(departmentChoices);
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
                                console.log(`Added ${answers.department} to the database`);
                            }
                        )
                    
                    break;      
                    case 'Add Employee':
                        const [roles] = await myconnection.promise().query(`SELECT *
                        FROM role;`)
                        const roleChoices = roles.map(el => ({name: el.title, value: el.id}));
                        const [manager] = await myconnection.promise().query(` SELECT *
                        FROM employee;`);
                        const managerList = manager.map(el => ({name: el.first_name+' '+el.last_name, value: el.id}))
                        
                
                        console.log(managerList);
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
                            case 'Update Employee Role':{
                                const [roles] = await myconnection.promise().query(`SELECT *
                                FROM role;`)
                                const roleChoices = roles.map(el => ({name: el.title, value: el.id}));
                                const [manager] = await myconnection.promise().query(` SELECT *
                                FROM employee;`);
                                const managerList = manager.map(el => ({name: el.first_name+' '+el.last_name, value: el.id}))
                               
//employee names and their ids
                                inquirer.prompt([{
                                    type: 'list',
                                    name: 'employee',
                                    message: 'Which employee\'s role do you want to update?',
                                    choices: managerList
                                                                }
                                //role title and role id
                            ]).then(answers1=>{
                                inquirer.prompt([{
                                    type: 'list',
                                    name: 'role',
                                    message: 'Which role do you want to update?',
                                    choices: roleChoices
                                                                }
                                
                            ]).then(
                                answers2=>{show(
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
                            
                            
                        }

                        
                    }
                    )
                    
                }
                
                
init();



                // async function x() {
                //     const result =  await myconnection.promise().query(`SELECT * FROM department`);
                // console.table(result[0]);
                // }

                

                // const departmentChoices =  (async()=>(await myconnection.promise().query(`SELECT * FROM department`)))();
                // console.log(departmentChoices);
                
                
                // prompt();

                // function x() {
                //     return new Promise(resolve => {
                //         myconnection.query(`SELECT name FROM department`,(err,res)=>{
                //             console.log(res);
                //             resolve(

                                
                //             );
                //             })    

                //     });
                //   }
                  
                //   async function y() {
                //     const msg = await x();
                //     console.log('Message:', msg);
                //   } 
                
                //    y();

                // init();
                // let results =  show(`
                // SELECT *
                // FROM department;
                // `);
                // console.log(results);
                // myconnection.query(`select * from department`, (err,res)=>console.log(res));
                // show(`select * from department`, (err,res)=>console.log(res));
                
                
                
                // myconnection.query('select * from department;',(err,res)=>console.log(res));
                
                
                
                
                
                
                
                
                
                //                 const roleSql = `SELECT name, id FROM department`; 
            
                //   myconnection.query(roleSql, (err, data) => {
                //     if (err) throw err; 
                
                //     const dept = data.map(({ name, id }) => ({ name: name, value: id }));
               












                      // addRole = () => {
                    //     inquirer.prompt([
                    //       {
                    //         type: 'input', 
                    //         name: 'role',
                    //         message: "What role do you want to add?",
                    //         validate: addRole => {
                    //           if (addRole) {
                    //               return true;
                    //           } else {
                    //               console.log('Please enter a role');
                    //               return false;
                    //           }
                    //         }
                    //       },
                    //       {
                    //         type: 'input', 
                    //         name: 'salary',
                    //         message: "What is the salary of this role?",
                    //         validate: addSalary => {
                    //           if (isNAN(addSalary)) {
                    //               return true;
                    //           } else {
                    //               console.log('Please enter a salary');
                    //               return false;
                    //           }
                    //         }
                    //       }
                    //     ])
                    //       .then(answer => {
                    //         const params = [answer.role, answer.salary];
                      
                    //         // grab dept from department table
                    //         const roleSql = `SELECT name, id FROM department`; 
                      
                    //         myconnection.promise().query(roleSql, (err, data) => {
                    //           if (err) throw err; 
                          
                    //           const dept = data.map(({ name, id }) => ({ name: name, value: id }));
                      
                    //           inquirer.prompt([
                    //           {
                    //             type: 'list', 
                    //             name: 'dept',
                    //             message: "What department is this role in?",
                    //             choices: dept
                    //           }
                    //           ])
                    //             .then(deptChoice => {
                    //               const dept = deptChoice.dept;
                    //               params.push(dept);
                      
                    //               const sql = `INSERT INTO role (title, salary, department_id)
                    //                           VALUES (?, ?, ?)`;
                      
                    //               myconnection.query(sql, params, (err, result) => {
                    //                 if (err) throw err;
                    //                 console.log('Added' + answer.role + " to roles!"); 
                      
                    //                 showRoles();
                    //          });
                    //        });
                    //      });
                    //    });
                    //   };
                      
                  