import express from "express";
import session from "express-session";
import pgSession from "connect-pg-simple";
import passport from "passport";
import dotenv from "dotenv";
import auth from "./routes/auth.js"
import profile from "./routes/profile.js"
import PassportSetUp from "./config/passport-setup.js"
import db from "./config/database-setup.js"

dotenv.config();
const PORT = process.env.PORT;
const app = express();

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'))

app.use(session({
    store: new (pgSession(session))({
        pool: db,
        tableName: 'session',
        pruneSessionInterval: 60*60 
    }),
    secret: process.env.SESSION_SECRET,  
    resave: false,  
    saveUninitialized: false, 
    cookie: {
        maxAge: 1000 * 60  *60
    }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', auth);
app.use('/profile', profile);

app.get('/', (req, res) => {
    res.render('home',{user:req.user})
})

app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}/`)
})