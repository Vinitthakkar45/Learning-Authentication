import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";
import dotenv from "dotenv"
dotenv.config();

const { Client } = pg;
const db = new Client({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE
});
db.connect();

const app = express();
const port = process.env.PORT;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie:{
      maxAge: 1000 * 60 * 60
    }
  }));

app.use(passport.initialize());
app.use(passport.session());

app.get("/secrets", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("secrets.ejs")
  }
  else {
    res.redirect("/login")
  }
})

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.post("/register", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const pass = await db.query("select password from users_local where email= $1", [email]);
  if (pass.rows[0]) { res.send("User Already Exists"); return; }

  bcrypt.hash(password, 10, async (err, hash) => {
    if (err) console.log("Error hashing the password: ", err);
    else {
      const result=await db.query("Insert into users_local (email,password) values ($1,$2) Returning *", [email, hash]);
      const user=result.rows[0];
      req.login(user, (err)=>{
        if (err) {
          console.log("Error logging in:", err);
          return res.redirect("/login");
        }
        return res.redirect("/secrets");      
      })
    }
  });
});

app.post("/login",  (req, res, next) => {
  req.body.username = req.body.email;next();},
    passport.authenticate("local", {
      successRedirect: "/secrets",
      failureRedirect: "/login"
    })
);

passport.use(
  new Strategy(async function verify(email, password, cb) {
    const user = await db.query("select * from users_local where email= $1", [email]);
    if (!user.rows[0]) return (null, "User Not Found");

    const passs = user.rows[0].password;
    bcrypt.compare(password, passs, async (err, result) => {
      if (err) return cb(err);
      if (result) return cb(null, user);
      else return cb(null, false);
    })
  }
  ));

passport.serializeUser((user, cb) => {
  cb(null, user);
})

passport.deserializeUser((user, cb) => {
  cb(null, user);
})

app.listen(port, () => {
  console.log(`Server running on port http://localhost:${port}`);
}); 