var issp = require("../config/issp_system");

exports.get_stats = (req, res) => {
    if (req.user.role != 'admin') {
        res.render( 'error', {message: `Your role cannot perform this action!`, role:req.user.role, username:req.user.username}
        );
    } else {
        // Check and update the deadlines if it has expired.
        issp.check();
        var deadline = issp.get_deadline();
        var submission_tag = issp.get_submission_tag();
        res.render('system', { title: 'System Variable', deadline: deadline, tag: submission_tag , username: req.user.username, role: req.user.role});
    }
};

exports.set_stats = (req, res) => {
    if (req.user.role != 'admin') {
        res.render( 'error', {message: `Your role cannot perform this action!`, role:req.user.role, username:req.user.username}
        );
    } else {
        const months = ["JAN", "FEB", "MAR","APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        let deadline_date = req.body.deadline.split("-");
        issp.update_stat(deadline_date[0], months[parseInt(deadline_date[1])-1], deadline_date[2], req.body.submission_year, req.body.submission_term, req, res);
        res.redirect('/system'); 
    }
};