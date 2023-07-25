require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const PORT = process.env.PORT || 3000;
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");

const homeStartingContent = "Here is the short instruction on how to use the “Daily Journal” website. The main page of the “Daily Journal” is the “Home” page where posts can be published. To publish a post, a user has to visit the “Compose” page, type in the post title into the “Title” field and post text into the “Post” field, and hit the “Publish” button. Then the user will be redirected to the “Home” page where the post gets published. By clicking on the “Read More” link the user gets redirected to the post page where a full post will be displayed. There is also an option of deleting a post by hitting the “Delete Post” button. After that the post will be permanently deleted and a user will be redirected to the “Home” page.";
const aboutContent = "Here on this page, I would like to briefly introduce myself. I’m a new web developer who is passionate about coding and learning new technologies. This is one of my first projects which was made under the guidance and instructions of Angela Yu, my course instructor of the web development bootcamp program. Special thanks to Angela Yu!";
const contactContent = "Feel free to check out my GitHub, LinkedIn acconts or Email me by clicking on the links located at the page footer ⇩⇩⇩";

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//Mongoose connection function
const connectDB = async() => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);  
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

//Creating a new BlogDB inside the MongoDB
//mongoose.connect("mongodb://127.0.0.1:27017/BlogDB", {useNewUrlParser: true});

//Creating a new postSchema
const postSchema = new mongoose.Schema({
  title: String,
  content: String
});
//Creating a Mongoose model
const Post = mongoose.model("Post", postSchema);

app.get("/", async (req, res) => {
  const foundPosts = await Post.find({});
  res.render("home", { startingContent: homeStartingContent, posts: foundPosts });
}); 

app.get("/about", (req, res) => {
  res.render("about", {aboutContent: aboutContent});
});

app.get("/contact", (req, res) => {
  res.render("contact", {contactContent: contactContent});
});

app.get("/compose", (req, res) => {
  res.render("compose");
});

app.post("/compose", async (req, res) => {
  try {
      const post = new Post ({
      title: req.body.postTitle,
      content: req.body.postBody
    });
    await post.save();
    console.log(post + "added to DB successfully");
    res.redirect("/");
  } catch (err) {
    console.log("failed to add post to DB" + err);
  }
});

app.get("/posts/:postId", async (req, res) => {
  const reqPostId = req.params.postId;
  const post = await Post.findOne({_id: reqPostId}) 
  res.render("post", {title: post.title, content: post.content, post: post} )
  }); 


//deleting a post
app.get("/delete/:postId", async (req, res) => {
  try {
   const postId = req.params.postId;
   await Post.findById({ _id: postId });
   res.redirect("/");
  } catch(err) {
    console.log(err);
  }
});
app.post("/delete", async (req, res) => { 
  try {
    const postId = req.body.postId;
    await Post.findByIdAndRemove(postId);
    console.log("Item deleted successfullly");
    res.redirect("/")
  } catch (err) {
    console.log(err);
  }
  });


// app.listen(3000, function() {
//   console.log("Server started on port 3000");
// });

connectDB().then(() =>
{
  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
});

