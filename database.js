var mysql = require('mysql');
var dbConfig = require("./config/dbConfig");
var connection = mysql.createConnection({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database
});

// Establish the connection with MySQL using above credentials
connection.connect(function (err) {
    if (err) {
        return console.error('error: ' + err.message);
    }
    else {
        console.log('Database is connected successfully !');
    }
    // Create a table called issp if not exists
    let createIssp = `create table if not exists issp(
                            id int primary key auto_increment,
                            category varchar(255),
                            company_name varchar(255) not null,
                            created_time DATETIME not null,
                            street_address varchar(255) not null,
                            address_line_2 varchar(255),
                            city varchar(255) not null,
                            province varchar(255) not null,
                            postal_code varchar(255) not null,
                            phone varchar(255) not null,
                            website varchar(255),
                            non_profit_organization varchar(25),
                            company_business_profile TEXT not null,
                            prefix varchar(25),
                            first varchar(255) not null,
                            last varchar(255) not null,
                            position varchar(255),
                            personal_phone varchar(255),
                            email varchar(255) not null,
                            project_area varchar(255),
                            project_description TEXT,
                            project_duration TEXT,
                            project_duration_no_preference varchar(25),
                            current_arrangement TEXT,
                            programming_language TEXT,
                            hardware_software_requirements TEXT not null,
                            continuation_project varchar(25),
                            hear_about_ISSP varchar(255),
                            sponsor_commitments varchar(25),
                            privacy_policy varchar(25),
                            assigned_year varchar(25),
                            assigned_term varchar(25)
                        )`;

    // Create a table called accounts if not exists
    let createAccount = `create table if not exists accounts(
                                id int primary key auto_increment,
                                username varchar(255) UNIQUE,
                                password varchar(255),
                                role varchar(25)
                        )`;
    
    // Create a table called feedback if not exists
    let createFeedback = `create table if not exists feedback(
                                id int primary key auto_increment,
                                project_id int,
                                feedback text,
                                feedback_time DATETIME,
                                feedback_user varchar(255),
                                FOREIGN KEY (project_id) REFERENCES issp(id) ON DELETE CASCADE
                        )`;

    // Create Default admin user with password Test1234 if the accounts table is empty
    let createDefaultAccount = `INSERT INTO accounts(username, password, role) SELECT 'admin','$2b$10$TptWsX7yUAwYFRYoOtFiNu3ZMbaonXnxOenMn0z9C9/Ac4FbfyJcK','admin' WHERE NOT EXISTS (SELECT * FROM accounts);`
                                
    // Call and perform the functions defined above
    connection.query(createIssp, function (err, results, fields) {
        if (err) {
            console.log(err.message);
        }
        else{
            connection.query(createAccount, function (err, results, fields) {
                if (err) {
                    console.log(err.message);
                } else{
                    connection.query(createFeedback, function (err, results, fields) {
                        if (err) {
                            console.log(err.message);
                        }
                        connection.query(createDefaultAccount, function (err, results, fields) {
                            if (err) {
                                console.log(err.message);
                            }
                        });
                    });
                }
            });
        }
    });

    // connection.end(function (err) {
    //     if (err) {
    //         return console.log(err.message);
    //     }
    // });
});

module.exports = connection;