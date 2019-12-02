var express = require("express"),
    methodOverride = require("method-override"),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    expressSanitizer = require("express-sanitizer"),
    app = express(),
    PORT = 3000;


mongoose.connect("mongodb://localhost/blog_app", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
mongoose.set('useFindAndModify', false);

//===============APP CONFIG================================
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer());
app.use(methodOverride("_method"));



//==============MONGOOSE MODEL CONFIG=======================
var blogSchema = mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {
        type: Date,
        default: Date.now
    }
})

var Blog = mongoose.model("Blog", blogSchema);

// Blog.create({
//     title: "Test Dog",
//     image: "https://images.unsplash.com/photo-1519944950314-64a254cb3ae5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
//     body: "HELLO THIS IS A BLOG"

// })

//==================RESTFull ROUTES===========================
// INDEX ROUTE
app.get("/blogs", (req, res) => {
    Blog.find({}, (err, blogs) => {
        if (err) {
            console.log("=====AN ERROR OCCURES======");
            console.log(err);
        } else {
            res.render("index", { blogs: blogs });
        }
    })
});

app.get("/", (req, res) => {
    res.redirect('/blogs');
});
//NEW ROUTE
app.get("/blogs/new", (req, res) => {
    res.render("new");
});

// CREATE ROUTE
app.post("/blogs", (req, res) => {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, (err, newBlog) => {
        if (err) {
            res.render('new');
        } else {
            res.redirect("/blogs");
            console.log(newBlog);
        }
    });
});

// SHOW ROUTE
app.get("/blogs/:id", (req, res) => {
    Blog.findById(req.params.id, (err, foundBlog) => {
        if (err) {
            res.redirect("/blogs");
        } else {

            res.render("show", { blog: foundBlog });
        }
    });
});

//EDIT
app.get("/blogs/:id/edit", (req, res) => {
    Blog.findById(req.params.id, (err, foundBlog) => {
        if (err) {
            res.redirect("/blogs");
        } else {

            res.render("edit", { blog: foundBlog });
        }
    });
})

//UPDATE
app.put("/blogs/:id", (req, res) => {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findOneAndUpdate({ _id: req.params.id }, req.body.blog, (err, updatedBlog) => {
        if (err) {
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs/" + req.params.id)
                //console.log(updatedBlog);
            console.log(req.body.blog)
        }
    })
});

//DELETE ROUTE
app.delete("/blogs/:id", (req, res) => {
    //destroy blog
    Blog.findByIdAndRemove(req.params.id, (err) => {
            if (err) {
                console.log(err);
                res.redirect("/blogs")
            } else {
                res.redirect("/blogs")
            }
        })
        //redirect
});

app.listen(PORT, () => {
    console.log("blogApp server listening on PORT:" + PORT);
})