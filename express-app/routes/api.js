var express = require('express');

const {BlogPost, User} = require("../database.ts")

var router = express.Router();

/* GET users listing. */
router.get('/posts', async function(req, res, next) {
  let posts = [];
  let db_posts = await BlogPost.find({}).sort({created: -1});
  db_posts.forEach(db_post => {
    posts.push({
      title: db_post.title,
      author: db_post.author,
      created: db_post.created,
      modified: db_post.modified,
      content: db_post.content,
    });
  });
  

  res.send(posts);
});

router.get('/users', async function(req, res, next) {

  let users = [];
  let db_users = await User.find({}).sort({created: -1});
  db_users.forEach(db_user => {
    users.push({
      username: db_user.username,
    });
  });

  res.send(users);
});

module.exports = router;
