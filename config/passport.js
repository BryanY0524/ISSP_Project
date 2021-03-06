var LocalStrategy = require('passport-local').Strategy;
var mysql = require('mysql');
var dbConfig = require("./dbConfig");
var bcrypt = require('bcrypt');

const saltRounds = 10;

var connection = mysql.createConnection({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database
});

// expose this function to our app using module.exports
module.exports = function(passport) {

	// =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
		done(null, user);
    });

    // used to deserialize the user
    passport.deserializeUser(function(user, done) {
		connection.query("select * from accounts where username = '"+user.username+"'",function(err,rows){	
			done(err, rows[0]);
		});
    });
	

 	// =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
	// by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        // local strategy uses username and password
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) {
        // Validate if password and password confirmation matches
        let password1 = req.body.password;
        let password2 = req.body.password2;
        if (password1 !== password2){
            return done(null, false, req.flash('error_msg', 'passwords do not match'));
        }

        //encrypt
		// find a user whose username is the same as the forms username
		// we are checking to see if the user trying to login already exists
        connection.query("select * from accounts where username = '"+username.toLowerCase()+"'",function(err,rows){
			if (err)
                return done(err);
			 if (rows.length) {
                return done(null, false, req.flash('error_msg', 'username is already taken'));
            } else {
				// if there is no user with that username
                // create the user
                bcrypt.hash(password1, saltRounds, function (err,   hash) {
                    var insertQuery = "INSERT INTO accounts ( username, password, role ) values ('" + username.toLowerCase() +"','"+ hash + "', 'reviewer')";
					console.log(insertQuery);
				    connection.query(insertQuery,function(err,rows){

				return done(null, req.flash('success_msg', 'Register Completed, Please Log in'));
				});	
                });

            }	
		});
    }));

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) { // callback with username and password from our form

         connection.query("SELECT * FROM accounts WHERE username = '" + username.toLowerCase() + "'",function(err,rows){
			if (err)
                return done(err);
			 if (!rows.length) {
                return done(null, false); 
            } 
            bcrypt.compare(password, rows[0].password, function (err, result) {
                if (result == false){
                    // if the user is found but the password is wrong
                    return done(null, false); 
                } else if(result == true){
                    // all is well, return successful user	
                    return done(null, rows[0]);	
                } 
            });
		});
		


    }));

};