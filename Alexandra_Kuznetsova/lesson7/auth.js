
const jwt = require('jsonwebtoken');

module.exports.checkAuthentication = (req, res, next) => {
  if (req.headers.authorization) {
    const [type, token] = req.headers.authorization.split(' ');

    jwt.verify(token, 'super secret key', (err, decoded) => {
      if (err) {
        return res.status(403).send();
      }

      req.user = decoded;

      next();
    });
  } else {
    res.status(403).send();
  }
}
