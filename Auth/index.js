import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import session from "express-session";
import passport from "passport";
import {Strategy} from "passport-local";

const {Client} =pg;
const db = new Client({
  user: 'postgres',
  password: 'Jay@69jalaram',
  host: 'localhost',
  port: 5432,
  database: 'Authentication',
});
db.connect();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
  session({
    secret:"mysecret",
    resave: false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());

app.get("/secrets",(req,res)=>{
  if(req.isAuthenticated()){
    res.render("secrets.ejs")
  }
  else{
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
  const email=req.body.username;
  const password=req.body.password;
  const pass= await db.query("select password from users where email= $1",[email]);
  if(pass.rows[0]){res.send("User Already Exists");return;}

  bcrypt.hash(password,10,async(err,hash)=>{
    if(err)console.log("Error hashing the password: ",err);
    else{
      await db.query("Insert into users (email,password) values ($1,$2)",[email,hash]);
      res.render("secrets.ejs");
    }
  });
});

app.post("/login", async (req, res) => {
  const email=req.body.username;
  const password=req.body.password;

  const pass= await db.query("select password from users where email= $1",[email]);
  if(!pass.rows[0]){res.send("User Not Found");return;}
  const passs=pass.rows[0].password;
  
  bcrypt.compare(password,passs, async (err,result)=>{
    if(result)res.render("secrets.ejs");
    else res.send("Invaild Password!");
  })
});

// app.use(new Strategy(function verify(username)))

app.listen(port, () => {
  console.log(`Server running on port http://localhost:${port}`);
});
