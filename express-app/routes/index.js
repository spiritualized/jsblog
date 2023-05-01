var express = require('express');
var router = express.Router();
var bbcode = require('bbcode');
const date = require('date-and-time')
const escapeHtml = require('escape-html')

const sha512 = require('hash.js/lib/hash/sha/512');
const {BlogPost, User} = require('../database.ts');
const {generateAccessToken, authenticateToken, TOKEN_VALIDITY} = require('../auth.ts')
const { now } = require('mongoose');

router.get('/', authenticateToken, async function(req, res, next) {
  let posts = await BlogPost.find({}).sort({created: -1});

  posts.forEach(post => {
    post.content = bbcode.parse(escapeHtml(post.content));
    post.postedStr = date.format(post.created, 'HH:mm, DD MMM \'YY')
  });

  res.render('index', {logged_in: res.logged_in, posts: posts});
});

router.get('/about', authenticateToken, function(req, res, next) {
  res.render('about', {logged_in: res.logged_in});
});

router.get('/admin', authenticateToken, function(req, res, next) {
  if(!res.logged_in)
    res.redirect('/login')

  res.render('admin', {logged_in: res.logged_in});
});

router.post('/admin', authenticateToken, async (req, res, next) => {
  if(!res.logged_in)
    res.redirect('/login')

  template_params = {
    existingTitle: req.body['title'],
    existingContent: req.body['content'],
  }

  if(req.body['title'].length < 5){
    template_params['error'] = 'Post title must be at least 5 characters long';
    res.render('admin', template_params);
  }

  if(req.body['content'].length < 10) {
    template_params['error'] = 'Post content is too short';
    res.render('admin', template_params);
  }

  // insert the new post
  let currDate = new Date();
  const newPost = new BlogPost({
    title: req.body['title'],
    author: req['username'],
    content: req.body['content'],
    created: currDate,
    modified: currDate,
  });

  newPost.save().then(
    () => console.log(`New post created`), 
    (err) => console.log(err)
  );

  res.redirect('/')
});

router.get('/login', authenticateToken, function(req, res, next) {
  if(res.logged_in)
    res.redirect('/admin')

  res.render('login', {logged_in: res.logged_in});
});

router.post('/login', async (req, res, next) => {

  let username = req.body['username'];
  let password_hash = sha512().update(req.body['password']).digest('hex');

  let records = await User.find({username: username});

  // User exists
  if(records.length) {
    let existing_user = records[0];
    // Incorrect password -> error
    if(existing_user['password_hash'] != password_hash) {
      let error = `Incorrect password for ${existing_user['username']}`;
      console.error(error);
      res.render('login', {error: error});
    }

    // Correct password -> log in
    else {
      console.log(existing_user);
      let token = generateAccessToken(existing_user['username']);
      res.cookie('jwt', token, {maxAge: TOKEN_VALIDITY*1000});
      res.redirect('/admin');
    }
  }

  // User doesn't exist -> create and log in
  else {
    const new_user = new User({
      username: username,
      password_hash: password_hash,
      created: new Date(),
    });

    new_user.save().then(
      () => console.log(`New user ${username} created`), 
      (err) => console.log(err)
    );

    res.render('admin');
  }
});

router.get('/logout', function(req, res, next) {
  res.clearCookie('jwt');
  res.redirect('/login');
});

module.exports = router;
