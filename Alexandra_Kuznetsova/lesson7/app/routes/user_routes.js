const User = require('../../models/user');
const jwt = require('jsonwebtoken');

module.exports = function(app, db) {

  // регистрация пользователя
  app.post('/register', async (req, res) => {
    const { repassword, ...restBody } = req.body;
    if (restBody.password === repassword) {
      const user = new User(restBody);
      await user.save()
      .then(() => {
        res.status(201).send();
      })
      .catch((err) => {
        if ( err.message.search('password') != -1 ) {
          res.status(400).json({ message: 'Password failed validation'});
        } else if ( err.message.search('email') != -1 ) {
          if ( err.message.search('duplicate') != -1 ) {
            res.status(400).json({ message: 'User email is already registered'});
          } else {
            res.status(400).json({ message: 'Email failed validation'});
          }
        } else {
          console.error(err);
        }
      });
    } else {
      res.status(400).json({ message: 'Passwords don\'t match' });
    }  
  });

  // аутентификация пользователя
  app.post('/auth', async (req, res) => {
    const { username, password } = req.body;
  
    const user = await User.findOne({ email: username });
  
    if (!user) {
      return res.status(401).json({ message: 'User doesn\'t exist' });
    }
  
    if (!user.validatePassword(password)) {
      return res.status(401).json({ message: 'Wrong password' });
    }
  
    const plainUser = JSON.parse(JSON.stringify(user));
    delete plainUser.password;
  
    res.status(200).json({
      ...plainUser,
      token: jwt.sign(plainUser, 'super secret key'),
    });
  });

}