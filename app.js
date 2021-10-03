require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const bcrypt = require("bcrypt");
//const md5 = require("md5");
//const encrypt = require("mongoose-encryption");

const saltRounds = 10;
const app = express();
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine','ejs');

mongoose.connect('mongodb://localhost:27017/usersDB');

const userSchema = new mongoose.Schema({
    username: String,
    password: String
});



//userSchema.plugin(encrypt,{ secret: process.env.SECRET, encryptedFields: ["password"]});

const User = mongoose.model("User", userSchema);

app.get("/",function(req,res){
    res.render("home");
});

app.get("/login",function(req,res){
    res.render("login");
});

app.get("/register",function(req,res){
    res.render("register");
});

app.post("/register",function(req,res){
    
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        const userDoc = new User({
            username: req.body.username,
            password: hash
        });
    
        userDoc.save(function(err){
            if(err){
                console.log(err);
            }else{
                res.render("secrets");
            }
        });
    });
    
});

app.post("/login",function(req,res){
    const username = req.body.username;
    const password = req.body.password;

    

    User.findOne({username: username},function(err,result){
        if(err){
            console.log(err);
        }else{
            if(result){
                bcrypt.compare(password, result.password, function(err, result) {
                    if(result === true){
                        res.render("secrets");
                    }else{
                        res.render("login");
                    }
                });
               
            } else {
                res.render("login");
            }
        }
    })
})










app.listen(process.env.PORT || 3000,function(){
    console.log("Server Started successfully.");
});