let jwt = require('jsonwebtoken');
// const config = require('./config.js');

let token = (req, res, next) => {
  var token = req.headers['x-access-token'];
  if (!token)
    return res.status(403).send({ error: 'No token provided.' });

  jwt.verify(token, 'mohitkadel', function(err, decoded) {
    if (err)
      return res.status(500).send({ error: 'Failed to authenticate token.' });

    // if everything good, save to request for use in other routes
    req.id = decoded.userId;
    next();
  });
};

module.exports = token;