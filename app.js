require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require('passport-local-mongoose'); //used to hash and salt passwords and to store data to mongoose DB
const e = require('express');

const app = express();
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine','ejs');
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost:27017/usersDB');

const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/",function(req,res){
    res.render("home");
});

app.get("/login",function(req,res){
    res.render("login");
});

app.get("/register",function(req,res){
    res.render("register");
});

app.get("/secrets",function(req,res){
    if(req.isAuthenticated()){
        res.render("secrets");
    }else{
        res.redirect("/login");
    }
});

app.get("/logout",function(req,res){
    req.logOut();
    res.redirect("/");
});

app.post("/register",function(req,res){
    User.register({username: req.body.username}, req.body.password, function(err,user){
        if(err){
            console.log(err);
            res.redirect("/register");
        }else{
            auth = passport.authenticate("local");
            auth(req, res, function(){
                res.redirect("/secrets");
            });
        }
    });
    
});

app.post("/login",function(req,res){
    const userDoc = new User({
        username: req.body.username,
        password: req.body.password
    });
    req.logIn(userDoc,function(err){
        if(err){
            console.log(err);
        }else{
            const auth = passport.authenticate("local");
            auth(req, res, function(){
                res.redirect("/secrets");  
            });
        }
    });
});





app.listen(process.env.PORT || 3000,function(){
    console.log("Server Started successfully.");
});