const passport = require('passport');
const User = require('../models/User');
const Strategy = require('passport-local').Strategy;
const jwt = require('jsonwebtoken');
/** не разобрался как использовать jwt стратегию в паспорте, делал по примерам
    и получал ошибку авторизации
    
    const { Strategy, ExtractJwt } = require('passport-jwt');
*/

const { store } = require('../store');

passport.use( 
    new Strategy({ usernameField: 'email' }, async ( email, password, done ) => {
    const user = await User.findOne({ email });

    if ( !user ) {
        return done( null, false );
    }

    if ( !user.validatePassword( password ) ) {
        return done( null, false );
    }

    const plainUser = JSON.parse( JSON.stringify( user ) );
    delete plainUser.password;

    const token = jwt.sign( plainUser, 'secret key' );
    const authUser = { ...plainUser, token };

    store.setState({ 
        [ store.ACTIVE_USER ]: authUser
    });

    return done( null, authUser );
}));

passport.serializeUser(( user, done ) => {
    done( null, user._id );
});

passport.deserializeUser(async ( id, done ) => {
    const user = await User.findById( id );
    const plainUser = JSON.parse( JSON.stringify( user ) );
    delete plainUser.password;

    done( null, plainUser );
});

module.exports = {
    initialize: passport.initialize(),
    authenticate: passport.authenticate('local', {
        successRedirect: '/tasks',
        failureRedirect: '/login?error=1',
    }),
    mustBeAuthenticated: ( req, res, next ) => {
        if ( !req.user ) {
            res.redirect('/login');
        } 
        next();
    },
    checkAuthentication: ( req, res, next ) => {
        const { headers: { authorization } } = req;
        const activeUser = store.get( store.ACTIVE_USER );

        if ( authorization || activeUser ) {
            let token = null;
            if ( authorization ) {
                const [ type, authToken ] = authorization.split(' ');
                token = authToken;
            } else {
                token = activeUser.token;
            }
            
            jwt.verify( token, 'secret key', ( err, decoded ) => {
                if ( err ) {
                    return res.status( 403 );
                }
                req.user = decoded;
                next();
            });
        } else {
            res.status( 403 );
            next();
        }
    }
};