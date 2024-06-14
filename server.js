const express=require('express'),
      mongoose=require('mongoose'),
      ejs=require('ejs'),
      session=require('express-session'),
      flash=require('connect-flash'),
      app=express();

      app.set('view engine', 'ejs');
      app.use(express.static('public'));
      app.use(express.urlencoded({extended:true}));

      mongoose.connect('mongodb://127.0.0.1:27017/BBMall');

      app.use(session({
        secret:'mysecretkey',
        resave:true,
        saveUninitialized:true
      }))

      app.use(flash());
      app.use((req,res,next)=>{
            res.locals.message=req.flash('message');
            res.locals.error_msg=req,flash('error_msg');

            next();
        })
      //WE NOW IMPORT OUR ROUTE FILES
      app.use('/',require('./route/uRoute'));
      app.use('/',require('./route/mRoute'));
      app.use('/',require('./route/aRoute'));


      app.listen(3000,()=>console.log("Server Started on port 3000"));