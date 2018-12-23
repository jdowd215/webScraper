var express = require("express");
var exphbs  = require('express-handlebars');
var mongoose = require("mongoose");
var cheerio = require("cheerio");
var axios = require("axios");
var logger = require("morgan");

var PORT = process.env.PORT || 8000;

//require all models
var db = require("./models");

//initialize Express
var app = express();

//configure middleware
app.use(logger("dev"));
//parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

//connect to Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mwebScraper";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

//handlebars
app.engine("handlebars", exphbs({
    defaultLayout: "main"
}));
app.set("view engine", "handlebars");

//routes
//GET route for scraping the stack overflow website
app.get("/scrape", function(req, res) {
    //grab body of the html with axios
    axios.get("https://www.geekwire.com/").then(function(response) {
        //load body into cheerio and to $ for a shorthand selector
        var $ = cheerio.load(response.data);    
        // An empty array to save the data that we'll scrape
        var results = [];

        $(".entry-title").each(function(i, element) {
            var title = $(element).text();
            var link = $(element).children().attr("href");
  
            // Save these results in an object that we'll push into the results array we defined earlier
            results.push({
            title: title,
            link: link,
            });
            // Create new Post using the result object
            db.Questions.create(results)
                .then(function(dbQuestions) {
                    console.log(dbQuestions);
                })
                .catch(function(err) {
                    console.log(err);
                })
            });
        });
        res.send("Scrape Complete");
        console.log(results);
    }); 

// Route for getting all Questions from the db
app.get("/questions", function(req, res) {
    db.Questions.find({})
        .then(function(dbQuestions) {
            res.json(dbQuestions);
        })
        .catch(function(err) {
            res.json(err);
        });
});

//  Route for grabbing a specific Question by ID, populate with note
app.get("/questions/:id", function(req, res) {
    db.Questions.findOne({_id: req.params.id})
        .populate("note")
        .then(function(dbQuestions) {
        res.json(dbQuestions);
        })
        .catch(function(err) {
        res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/questions/:id", function(req, res) {
    db.Note.create(req.body)
        .then(function(dbNote) {
            return db.Questions.findOneAndUpdate({ _id: req.params.id}, { note: dbNote._id }, { new: true});
        })
        .then(function(dbQuestions) {
            res.json(dbQuestions);
        })
        .catch(function(err) {
            res.json(err);
    });
});

// Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });
  