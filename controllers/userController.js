const User = require("../models/userModel");
var bcrypt = require('bcrypt');
var async = require('async');
const saltRounds = 10;

// Render/Display a add user page
exports.register = (req, res) => {
    if (req.user.role != 'admin') {
        res.render( 'error', {message: `Your role cannot perform this action!`, role:req.user.role, username:req.user.username}
        );
    } else {
        res.render('register',{ role:req.user.role, username:req.user.username });
    }
};

// Create and Save a new User
exports.create = async (req, res) => {
    // Validate request
    if (req.user.role != 'admin') {
        res.render( 'error', {message: `Your role cannot perform this action!`, role:req.user.role, username:req.user.username}
        );
    } else if (!req.body) {
        req.flash('error_msg', 'Content can not be empty!');
        res.redirect("/register");
    } else {
        // Create a user and Validate if password and password confirmation matches
        var password1 = req.body.password;
        var password2 = req.body.password2;
        if (password1 == password2) {
            var role = (req.body.role) ? req.body.role : "reviewer";
            const user = new User({
                username: req.body.username,
                password: bcrypt.hashSync(req.body.password, saltRounds),
                role: role,
            });
            // Save User in the database
            await User.create(user, (err, data) => {
                if (err) {
                    req.flash('error_msg', (err.message || err) || "Some error occurred while creating the User.");
                    res.redirect("/register");
                }
                else {
                    req.flash('success_msg', 'User has been added successfully');
                    res.redirect('/admin');
                }
            });

        } else {
            req.flash('error_msg', 'Passwords do not match; Please re-type them');
            res.redirect("/register");
        }
    }
};


// Render a user edit page
exports.profile = async (req,res) => {
    if (req.user.role != 'admin') {
        res.render( 'error', {message: `Your role cannot perform this action!`, role:req.user.role, username:req.user.username}
        );
    } else {
        // var username = JSON.stringify(req.body.username);
        var username = JSON.stringify(req.query.username);
        await User.findByUsername(username, (err, data) => {
            if (err) {
                if (err.kind === "not_found") {
                    res.status(404).send({
                        message: `Not found Account with username ${username}.`
                    });
                } else {
                    res.status(500).send({
                        message: "Error retrieving Account with username " + username
                    });
                }
            } else res.render('userEdit', { data: data, role: req.user.role, username:req.user.username  });
        });  
    }
};

// Render a user profile page
exports.selfprofile = (req,res) => {
    res.render('profile', { role: req.user.role, username: req.user.username  });
};



// Edit a user by username 
exports.edituser = async (req, res) => {
    // Validate request
    if (req.body.username) {
        if (req.user.role != 'admin') {
            res.render( 'error', {message: `Your role cannot perform this action!`, role:req.user.role, username:req.user.username}
            );
        } else if (!req.body) {
            req.flash('error_msg', 'Content can not be empty!');
            res.redirect("/userProfile?username="+req.body.username);
        } else {
            // Edit user and Validate if password and password confirmation matches
            var password1 = req.body.password;
            var password2 = req.body.password2;
            if (password1 == password2) {
                var role = (req.body.role) ? req.body.role : "reviewer";
                // Update User in the database
                User.updateByUsername(
                    req.body.username,
                    bcrypt.hashSync(req.body.password, saltRounds),
                    role,
                    (err, data) => {
                        if (err) {
                            if (err.kind === "not_found") {
                                res.status(404).send({
                                    message: `Not found Account with username ${req.body.username}.`
                                });
                            } else {
                                res.status(500).send({
                                    message: "Error updating Account with username " + req.body.username
                                });
                            }
                        } else {
                            req.flash('success_msg', 'User has been updated successfully!');
                            res.redirect('/admin');
                        }
                    }
                );
            } else {
                req.flash('error_msg', 'Passwords do not match; Please re-type them');
                res.redirect("/userProfile?username="+req.body.username);
            }
        }
    } else {
        if (!req.body) {
            req.flash('error_msg', 'Content can not be empty!');
            res.redirect("/profile");
        } else {
            // Edit user and Validate if password and password confirmation matches
            var password3 = req.body.password;
            var password4 = req.body.password2;
            if (password3 == password4) {
                var user_role = (req.user.role) ? req.user.role : "reviewer";
                // Update User in the database
                User.updateByUsername(
                    req.user.username,
                    bcrypt.hashSync(req.body.password, saltRounds),
                    user_role,
                    (err, data) => {
                        if (err) {
                            if (err.kind === "not_found") {
                                res.status(404).send({
                                    message: `Not found Account with username ${req.user.username}.`
                                });
                            } else {
                                res.status(500).send({
                                    message: "Error updating Account with username " + req.user.username
                                });
                            }
                        } else {
                            req.flash('success_msg', 'User has been updated successfully!');
                            res.redirect("/profile");
                        }
                    }
                );
            } else {
                req.flash('error_msg', 'Passwords do not match; Please re-type them');
                res.redirect("/profile");
            }
        }
    }
};

// Display all the users
exports.getAllUsers = async (req, res) => {
    if (req.user.role != 'admin') {
        res.render( 'error', {message: `Your role cannot perform this action!`, role:req.user.role, username:req.user.username}
        );
    } else {
        await User.getAll((err, data) => {
            if (err)
                res.status(500).send({
                    message:
                        err.message || "Some error occurred while retrieving the Submissions."
                });
            else res.render('admin', { userData: data, username:req.user.username, role:req.user.role });
        });
    }
};

// Delete a user by id
exports.delete = (req, res) => {
    if (req.user.role != 'admin') {
        res.render( 'error', {message: `Your role cannot perform this action!`, role:req.user.role, username:req.user.username}
        );
    } else {
        User.delete(req.body.id, (err, data) => {
            if (err) {
                if (err.kind === "not_found") {
                    res.status(404).send({
                        message: `Not found User with id ${req.body.id}.`
                    });
                } else {
                    res.status(500).send({
                        message: "Could not delete User with id " + req.body.id
                    });
                }
            } else {
                req.flash('success_msg', 'User has been deleted successfully');
                res.redirect('/admin');
            }
        });
    }
};