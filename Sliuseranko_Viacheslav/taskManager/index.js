const clc = require('cli-color');
const express = require('express');
const consolidate = require('consolidate');
const path = require('path');
const mongoose = require('mongoose');
const handlebars = require('handlebars');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

/** порт нашего приложения */
const PORT = 3000;
/** url адресс нашего приложения */
const SERVER_URL = 'http://localhost';

mongoose.connect('mongodb://192.168.99.100:32768/tasks', { useNewUrlParser: true, useUnifiedTopology: true });
const passport = require('./auth');

const Task = require('./models/Task');
const User = require('./models/User');

const app = express();

app.engine( 'hbs', consolidate.handlebars );

app.use( express.json() );
app.use( express.urlencoded( { extended: false } ) );
app.use( express.static( `${ __dirname }/views` ) );

app.set( 'view engine', 'hbs' );
app.set( 'views', path.resolve( __dirname, 'views') );

app.use( session({
    resave: true,
    saveUninitialized: false,
    secret: 'this is secret session key',
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

app.use( passport.initialize );
app.use( passport.session );
app.use('/tasks', passport.mustBeAuthenticated );

/**
 * хелпер отрисовки чекбокса
 * @param task 
 **/
handlebars.registerHelper('checkBox', ({ _id, completed }) => {
    return new handlebars.SafeString( 
        `<input class="btn_check" type="checkbox" data-id="${ _id }" ${ completed ? 'checked' : '' }/>`
    );
});

/** пути для навигационной панели у гостя */
const guetsPaths = [
    { title: 'login', url: '/login' },
    { title: 'register', url: '/register' },
];

/** пути для навигационной панели у пользователя */
const userPaths = [
    { title: 'tasks', url: '/tasks' },
    { title: 'logout', url: '/logout' },
];

/**
 * хелпер отрисовки навигационной панели
 * @param task 
 **/
handlebars.registerHelper('navpanel', ( user ) => {
    const currentNavRoutes = ( user ? userPaths : guetsPaths );
    const links = currentNavRoutes.map( ({ url, title }) => `<a href="${ url }">${ title }</a>&nbsp;`);
    return new handlebars.SafeString(  links.join('') );
});

/** Получаем список всех задач */
app.get('/tasks', async ( req, res ) => {
    const { _id } = req.user;
    const tasks = await Task.find({ user: _id });
    res.render( 'index', { tasks, user: req.user });
});

/** создание новой задачи  */
app.post('/tasks', async ( req, res ) => {
    const { _id } = req.user;
    const task = new Task({ ...req.body, user: _id });  
    await task.validate( async (errors) => {
        if ( !errors ) {
            await task.save();
        }
    });
    res.redirect( '/tasks' );
}); 

/** удаление задачи */
app.delete('/tasks', async ( req, res ) => {
    try {
        const { body: { id } } = req;
        await Task.findByIdAndDelete(id);
        res.send( true );
    } catch( e ) {
        res.send( false );
    }
});

/** Переключение статуса задачи */
app.put('/tasks', async ( req, res ) => {
    try {
        const { body: { id } } = req;
        const task = await Task.findById(id );
        task.set({ completed: !task.completed });
        task.save();
        res.send( task.completed );
    } catch( e ) {
        res.send( false );
    }
});

/** Страница редактирования */
app.get('/tasks/update/:id', async ( req, res ) => {
    const { params: { id } } = req;
    const task = await Task.findById( id );
    res.render( 'update', { task, user: req.user });
});

/** сохранение изменений */
app.post('/tasks/update/:id', async ( req, res ) => {
    const { params: { id } } = req;
    const { body: { title, completed } } = req;
    const task = await Task.findById( id );

    task.set( 'completed', completed );
    task.set( 'title', title );

    await task.validate( async (errors) => {
        if ( !errors ) {
            await task.save();
        }
    });

    res.redirect( '/tasks');
});

app.get('/login', (req, res) => {
    const { query: { error } } = req;
    res.render( 'auth/login', { error, user: req.user } );
});

app.post( '/login', passport.authenticate );

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
});

/** подключаем страницу регистрации */
app.get('/register', ( req, res ) => {
    res.render('auth/register', { user: req.user });
});

/** подключаем страницу регистрации */
app.post('/register', async ( req, res ) => {
    const { body: { repassword, ...userProps } } = req;
    const user = new User( userProps );
    const errors = user.validateSync();

    if ( repassword !== userProps.password ) {
        errors.push( { password: 'not mutch' } );
    } 

    if ( !errors ) {
      await user.save();
      return res.redirect('/login');
    } 
    res.redirect( '/register' );
});

app.listen( 3000, () => console.log(
    clc.yellow(`==================== Server start ====================\n`),
    clc.green(`\t${ SERVER_URL }:${ PORT }`)
));