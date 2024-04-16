const express = require('express')
const passport = require('passport');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const config = require('./config/db');
const session = require('express-session')
const cors = require('cors');
const account = require('./routes/account');

const app = express();
const PORT = 5000;

app.use(session({
    secret: config.secret,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());
app.use(bodyParser.json());

require('./config/passport')(passport);

async function start(){
    try {
        await mongoose.connect(config.db)
        console.log("Подключение к базе данных установлено")

        app.listen(PORT, () => {
            console.log(`Подключение к порту ${PORT} успешно установлено`);
        })
    } catch (error) {
        console.log(error)
    }
}

start()

app.use('/account', account);