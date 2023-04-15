const Genre = require("../models/genre");
const Book = require("../models/book");
const async = require("async");
const { body, validationResult } = require("express-validator");

exports.genre_list = (req, res, next) => {
  Genre.find().sort({name:1}).exec(function (err, list_genre){
    if (err) return next(err);
    res.render("genre_list",{title:"Genre list", genre_list:list_genre});
  })
};

// Display detail page for a specific Genre.
exports.genre_detail = (req, res, next) => {
  async.parallel(
    {
      genre(callback) {
        Genre.findById(req.params.id).exec(callback);
      },

      genre_books(callback) {
        Book.find({ genre: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.genre == null) {
        // No results.
        const err = new Error("Genre not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render
      res.render("genre_detail", {
        title: "Genre Detail",
        genre: results.genre,
        genre_books: results.genre_books,
      });
    }
  );
};

// Display Genre create form on GET.
exports.genre_create_get = (req, res, next) => {
  res.render("genre_form", { title: "Create Genre", genre:undefined, errors:undefined });
};

// Handle Genre create on POST.
exports.genre_create_post = [
  // Validate and sanitize the name field.
  body("name", "Genre name required").trim().isLength({ min: 1 }).escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a genre object with escaped and trimmed data.
    const genre = new Genre({ name: req.body.name });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("genre_form", {
        title: "Create Genre",
        genre,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.
      // Check if Genre with same name already exists.
      Genre.findOne({ name: req.body.name }).exec((err, found_genre) => {
        if (err) {
          return next(err);
        }

        if (found_genre) {
          // Genre exists, redirect to its detail page.
          res.redirect(found_genre.url);
        } else {
          genre.save((err) => {
            if (err) {
              return next(err);
            }
            // Genre saved. Redirect to genre detail page.
            res.redirect(genre.url);
          });
        }
      });
    }
  },
];

exports.genre_delete_get = (req, res, next) => {
  async.parallel(
    {
      genre(callback) {
        Genre.findById(req.params.id).exec(callback);
      },
      genres_books(callback) {
        Book.find({genre:req.params.id}).exec(callback);
      },
    },
    (err, results) => {
      if(err) {
        return next(err);
      }
      if (results.genre == null){
        res.redirect("/catalog/genres");
      }
      res.render("genre_delete", {
        title: "Delete genre",
        genre: results.genre,
        genres_books:results.genres_books,
      });
    }
  );
};

exports.genre_delete_post = (req, res, next) => {
  async.parallel(
    {
      genre(callback){
        Genre.findById(req.body.genreid).exec(callback);
      },
      genres_books(callback){
        Book.find({genre:req.body.genreid}).exec(callback);
      },
    },
    (err, results) => {
      if (err){
        return next(err);
      }
      if (results.genres_books.length>0){
        res.render("genre_delete", {
          title: "Delete genre",
          genre: results.genre,
          genres_books:results.genres_books,
        });
        return;  
      }
      Genre.findByIdAndRemove(req.body.genreid, (err) => {
        if (err) {
          return next(err);
        }
        res.redirect("/catalog/genres");
      })
    }
  )
};

exports.genre_update_get = (req, res, next) => {
  Genre.findById(req.params.id).exec((err, results) => {
    if (err) {
      return next(err);
    }
    if (results == null) {
      const err = new Error ("Genre not found");
      err.status = 404;
      return next(err);
    }
    res.render("genre_form", {
      title: "Update genre",
      genre: results,
      errors: undefined,
    })
  })
};

exports.genre_update_post = [
  body("name", "Name must be defined")
    .trim()
    .isLength({min:1})
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    const genre = new Genre({
      name: req.body.name,
      _id: req.params.id
    })
    if (!errors.isEmpty()) {
      res.render("book_form", {
        title:"Update genre",
        genre,
        errors: errors.array(),
      })
      return
    }
    Genre.findByIdAndUpdate(req.params.id, genre, {}, (err, updated) => {
      if (err) {
        return next(err);
      }
      res.redirect(updated.url);
    })
  }
]