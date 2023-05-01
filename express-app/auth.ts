const jwt = require('jsonwebtoken');

const TOKEN_SECRET = '95ed2fbb5f7ceec7d2ed179b07d1a7148687a2087e47522468c7a112499ad6fdd6ede7a33e0f6c5319f098f45fab915ae93090be5a479ab289a0adfe7726486f';
const TOKEN_VALIDITY = 86400; // 1 day in seconds

function generateAccessToken(username) {
  return jwt.sign({username: username}, TOKEN_SECRET, { expiresIn: TOKEN_VALIDITY });
}

function authenticateToken(req, res, next) {
    const token = req.cookies['jwt'];
  
    if (token == null)
      next();
  
    jwt.verify(token, TOKEN_SECRET, (err, payload) => {
      console.log(err);
      console.log(payload);
      if(payload) {
        res.logged_in = true;
        req.username = payload['username'];
      }

      next();
    })


  }

module.exports = {
  generateAccessToken: generateAccessToken,
  authenticateToken: authenticateToken,
  TOKEN_VALIDITY: TOKEN_VALIDITY,
}