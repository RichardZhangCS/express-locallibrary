var BookInstance = require('../models/bookinstance');
const { body,validationResult } = require('express-validator');
var Book = require('../models/book');
var async = require('async');
// Display list of all BookInstances.
exports.bookinstance_list = function(req, res) {
    BookInstance.find()
    .populate('book')
    .exec(function (err, list_bookinstances) {
      if (err) { return next(err); }
      // Successful, so render
      res.render('bookinstance_list', { title: 'Book Instance List', bookinstance_list: list_bookinstances });
    });
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = function(req, res) {
    BookInstance.findById(req.params.id)
    .populate('book')
    .exec(function (err, bookinstance) {
        if (err) { return next(err); }
        if (bookinstance==null) {
            var err = new Error('Book copy not found');
            err.status = 404;
            return next(err);
        }
        res.render('bookinstance_detail', { title: 'Copy: '+bookinstance.book.title, bookinstance: bookinstance});
    })
};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = function(req, res, next) {
    Book.find({}, 'title')
    .exec(function(err, books) {
        if (err) { return next(err); }
        res.render('bookinstance_form', {title: 'Create BookInstance', book_list: books});
    });
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
    body('book', 'Book required').trim().isLength({min:1}).escape(),
    body('imprint', 'Imprint required').trim().isLength({min:1}).escape(),
    body('status', 'Status required').trim().isLength({min:1}).escape(),
    body('due_back', 'Due back required').trim().isLength({min:1}).escape(),
    (req, res, next) => {
        var errors = validationResult(req);

        var bookinstance = new BookInstance({
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back
        });

        if (!errors.isEmpty()) {
            Book.find({}, 'title')
                .exec(function(err, books) {
                    if (err) { return next(err); }
                    res.render('bookinstance_form', {title: 'Create BookInstance', bookinstance: bookinstance, book_list: books});
                });
        }
        bookinstance.save(function(err) {
            if (err) {return next(err)}
            res.redirect('/catalog/bookinstances');
        });
    }];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = function(req, res, next) {
    async.parallel({
        bookinstance: function(callback) {
            BookInstance.findById(req.params.id)
                        .populate('book')
                        .exec(callback);     
            },
    }, function(err, result) {
        if (err) { return next(err); }
        if (result.bookinstance==null) {
            var err = new Error('Book Instance Not Found');
            err.status = 404;
            return next(err);
        }
        res.render('bookinstance_delete', {title: 'Delete Book Instance', bookinstance: result.bookinstance});
    });
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = function(req, res, next) {
    BookInstance.findByIdAndRemove(req.body.bookinstanceid, function(err) {
        if (err) {return next(err)};

        res.redirect('/catalog/bookinstances');
    })
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance update GET');
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance update POST');
};