const Submission = require("../models/submissionModel");
const Feedback = require("../models/feedbackModel");
var async = require('async');


// Get all the submissions and feedback by year and term
exports.feedbackList = (req, res) => {
    async.parallel([
        Feedback.getAll,
        Submission.get_year_term
    ], function (err, results) {
        if (err)
            res.render('error', { message: "Some error occurred while retrieving the Submissions.", role: req.user.role, username: req.user.username });
        else {
            res.render('feedbackList', { feedbackList: JSON.stringify(results[0]), year_term: JSON.stringify(results[1]), username: req.user.username, role: req.user.role });
        }
    });
};


// Create and Save a new Feedback
exports.submitFeedback = (req, res) => {
    // Validate request
    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
    }
    // Create a feedback
    const feedback = new Feedback({
        feedback: req.body.feedback,
        feedback_time: new Date(),
        feedback_user: req.user.username,
        project_id: req.body.project_id
    });

    // Save Feedback in the database
    Feedback.create(feedback, (err, data) => {
        if (err)
            res.render('error', { message: "Some error occurred while creating the Submission.", role: req.user.role, username: req.user.username });
        else {
            req.flash('success_msg', 'Comment has been posted successfully');
            res.redirect('/submission/feedback?id='+req.body.project_id);
        }
    });
};

// Retrieve all feedback based on submission id
exports.feedback = (req, res) => {
    async.series({
        find_submission: function (callback) {
            // Find submission by id
            Submission.findById(req.query.id, (err, submissionData) => {
                if (err) {
                    if (err.kind === "not_found") {
                        res.render('error', { message: `Not found Submission with id ${req.params.id}.`, role: req.user.role, username: req.user.username });
                    } else {
                        res.render('error', { message: `Error retrieving Submission with id ${req.params.id}.`, role: req.user.role, username: req.user.username });
                    }
                } else {
                    callback(err, submissionData);
                }
            });
        },
        find_feedback: function (callback) {
            // Find feedback by submission id
            Feedback.findAllById(req.query.id, (err, data) => {
                if (err) {
                    res.render('error', { message: "Some error occurred while retrieving the Submissions.", role: req.user.role, username: req.user.username });
                }
                else {
                    callback(err, data);
                }
            });
        }
    }, function (err, results) {
        res.render('feedback', { role: req.user.role, username: req.user.username, returnData: results.find_feedback, feedbackData: results.find_submission });
    });
};


// Update category: year, term, program
exports.updateCategory = (req, res) => {
    // Validate Request
    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
    }
    if (req.user.role != 'admin') {
        req.flash('error_msg', 'Your role cannot perform this action!');
        res.redirect('/submission/feedback?id='+req.body.project_id);
    } else {
        Feedback.category(
            req.body.project_id,
            new Submission(req.body),
            (err, data) => {
                if (err) {
                    if (err.kind === "not_found") {
                        res.render('error', { message: `Not found Submission with id ${req.body.id}.`, role: req.user.role, username: req.user.username });
                    } else {
                        res.render('error', { message: `Error updating Submission with id ${req.body.id}.`, role: req.user.role, username: req.user.username });
                    }
                } else {
                    req.flash('success_msg', 'Project has been updated successfully');
                    res.redirect('/submission/feedback?id='+req.body.project_id);
                }
            }
        );
    }
};
