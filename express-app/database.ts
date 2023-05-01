//  MongoDB

const mongoose = require("mongoose");

mongoose.connect(
    process.env.MONGODB_URL || "mongodb://localhost:27017/jsblog", 
    {
      useNewUrlParser: true, 
      useUnifiedTopology: true
    }
)
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

// create a schema
const blogPostSchema = new mongoose.Schema({
  title: String,
  author: String,
  created: Date,
  modified: Date,
  content: String,
});

const userSchema = new mongoose.Schema({
    username: String,
    created: Date,
    password_hash: String,
})

// create a model with blogPostSchema
const BlogPost = mongoose.model('BlogPost', blogPostSchema);
const User = mongoose.model('User', userSchema);

module.exports = {
    BlogPost: BlogPost,
    User: User,
}