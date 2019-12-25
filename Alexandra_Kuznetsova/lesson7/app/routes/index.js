const noteRoutes = require('./note_routes');
const userRoutes = require('./user_routes');
module.exports = function(app, db) {
  userRoutes(app, db),
  noteRoutes(app, db)
};