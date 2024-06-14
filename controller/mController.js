const mongoose= require('mongoose'),
      bcrypt=require('bcryptjs'),
      multer=require('multer'),
      fs=require('fs'),
      path=require('path'),
      nodemailer= require('nodemailer'),
      Merchant= require('../models/merchant'),
      Product=require('../models/product');
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "anjolaaaa@gmail.com",
            pass: "ykvpryafrvtbexvp"
        }
    })

      //For the merchant signing up
      let storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null,__dirname+'/uploads/')
        },
        filename: (req, file, cb) => {
            cb(null, file.fieldname + '-' + Date.now())
        }
    });
     
        let upload = multer({ storage: storage });


    //image upload for products
    let st = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, './public/images/')
        },
        filename: (req, file, cb) => {
            cb(null, file.fieldname + '-' + Date.now())
        }
    });
     
        let upl = multer({ storage: st });
        

      const login=(req,res)=>{
        res.render("login")
      }
      const merchantRegistration= (req,res)=>{
        res.render("registration")
      }
      const merchantRegistrationPost= (req,res)=>{
        // console.log(req.body);
        // res.send("Processing");
        const{fn,ln,phone,email,cacStatus, username,pass1,pass2}=req.body;
        let errors= [];
        if(!fn || !ln || !phone || !email || !cacStatus || !username || !pass1 || !pass2){
          errors.push({msg:"Please ensure all fields are filled"});
        }
        if(pass1 !== pass2){
          errors.push({msg:"Passwords do not match"});
        }
        if(pass1.length<6){
          errors.push({msg:"Password should be at least 6 characters"});
        }
        if(errors.length>0){
          res.render("registration", {errors, fn, ln, email, phone, cacStatus, username, pass1, pass2})
        }
        else{
          //No 2 users with the same email/username
          Merchant.findOne({email:email, username:username})
          .then((result)=>{
            if(result){
              errors.push({msg:"Usename/Email already exists"});
              res.render("registration", {errors, fn, ln, email, phone, cacStatus, username, pass1, pass2})
            } else{
              //LFGGGG
              //Encryption time
              bcrypt.hash(pass1, 10, (error, hash)=>{
                const newMerchant=new Merchant({
                  fn, ln, email, cacStatus, phone, username, password:hash,
                  image:{
                    data:fs.readFileSync(path.join(__dirname + '/uploads/' +req.file.filename)),
                    contentType:'image/png'
                  }
                })
                try{
                  newMerchant.save();
                  req.flash('message', 'Registration Sucessful. You can now login');
                  res.redirect('/login')
                }
                catch(err){
                  req.flash('error_msg', "Could not save into the Database")

                }
                let msg = "Dear " + fn+ " " +ln + ", your registration is successful";
    const mailOption = {
        from: "anjolaaaa@gmail.com",
        to:email,
        subject: "Registration Successful",
        text: msg
  }

  transporter.sendMail(mailOption, (error, info) => {
    if(error) {
        console.log(error);
    }else {
        console.log("Email sent: " + info.response);
    }
  });
              })
            }
          })
          .catch((err)=>{
            res.send("There's a problem");
            console.log(err);
          })
        }
      }
      const merchantLoginPost= (req,res)=>{
        const{username,password}=req.body;

        Merchant.findOne({username:username})
        .then((result)=>{
          if(!result){
            req.flash('error_msg',"This Username does not exist");
            res.redirect('/login');
          }else{
            bcrypt.compare(password,result.password,(err,isVerified)=>{
              if(err){
                req.flash('error_msg', "Something Appears Wrong "+ err);
                res.redirect('/login');
              }
              if(isVerified){
                //Establish SESSION Variables
                req.session.merchant_id= result._id;
                req.session.username=result.username;

                //redirect merchant to dashboard page
                res.redirect('/dashboard')
              } else{
                req.flash('error_msg', "Invalid Password");
                res.redirect('/login');
              }
            })
          }
        })
        .catch((err)=>{
          req.flash('error_msg', "There was a problem selecting from DB");
          res.redirect('/login');
        })
      }

      const dashboard=(req,res)=>{
        //IF OUR SESSION VARIABLES ARE NOT SET
        if(!req.session.merchant_id && !req.session.username){
          res.redirect('/login');

        }else{
          const mid=req.session.merchant_id;
          const uname=req.session.username;

          res.render('dashboard',{mid, uname})
        }
      }
      const addProduct=(req,res)=>{
        if(!req.session.merchant_id && !req.session.username){
          res.redirect('/login');

        }else{
          const mid=req.session.merchant_id;
          const uname=req.session.username;

          res.render('add_product',{mid, uname})
        }
      }
      const addProductPost=(req,res)=>{
        const{productName, description,price,category,brand}=req.body;
        let errors= [];
        if(!productName|| !description || !price || !category || !brand){
          errors.push({msg:"Some fields are missing. Please fill all fields"});
        }
        if(errors.length>0){
          res.render('add_product',{errors,productName,description,price,category,brand,username:req.session.username})
        }else{
          const nProduct= new Product({
            productName,description,category,price,brand,username:req.session.username,image:{
              data:fs.readFileSync(path.join('./public/images/' + req.file.filename)),
              contentType:'image/png'
            }
          })
          try{
            nProduct.save();
            req.flash('message',"Product Successfully Added to DB");
            res.redirect('/addProduct');
          }
          catch(err){
            req.flash('error_msg','Could not save to DB: '+err);
            res.redirect('/addProduct');
          }
        }
      }
      const viewPro = (req, res) => {

				if(!req.session.merchant_id && !req.session.username) {
				req.flash('error_msg', "Please login to access our platform");
				res.redirect('/login');
			   } else {
					const mid = req.session.merchant_id;
					const uname = req.session.username;

					Product.find({username:uname})
					.then((results) => {
							res.render('view_product', {mid,uname,results})
					})
					.catch((err) => {
							req.flash('error_msg', 'Could not select from DB:' +err);
							res.redirect('/viewProduct');
					})
			}
	}


	const editPage = (req, res) => {
				if(!req.session.merchant_id && !req.session.username) {
					req.flash('error_msg', 'Please login to access app');
					res.redirect('/login');
				} else {
					const mid = req.session.merchant_id;
					const uname = req.session.username;

					Product.findOne({_id:req.params.pid})
					.then((record) => {
						res.render('edit_page', {record, mid, uname});
					})
					.catch((err) => {
						req.flash('error_msg', 'Could not Select From DB');
						res.redirect('/viewProduct');
					})
				}
	}

	const editPagePost = (req, res) => {
			if(!req.session.merchant_id && !req.session.username) {
					req.flash('error_msg', 'Please login to access app');
					res.redirect('/login');
				} else {

						const{productName, description, price} = req.body;
						const pid = req.params.pid;

					Product.findByIdAndUpdate(pid, {$set: {productName, description, price}})

					.then(() => {
						req.flash('message', "Product Successfully Updated");
						res.redirect('/viewProduct');
					})
					.catch((err) => {
						req.flash('error_msg', 'Could not Update Product');
						res.redirect('/edit/:pid');
					})
				}
	}


	const deleteProduct = (req, res) => {
			if(!req.session.merchant_id && !req.session.username) {
					req.flash('error_msg', 'Please login to access app');
					res.redirect('/login');
				} else {
						const pid = req.params.pid;

						Product.findByIdAndDelete(pid)
						.then(() => {
							req.flash('message', 'Product Successfully Deleted');
							res.redirect('/viewProduct');
						})
						.catch((err) => {
							req.flash('error_msg', 'Could not delete product');
							res.redirect('/viewProduct')
						})
				}
	}
	const logout = (req, res) => {
			if(!req.session.merchant_id && !req.session.username) {
					req.flash('error_msg', 'Please login to access app');
					res.redirect('/login');
				} else {

						req.session.destroy();
						res.redirect('/login');
				}
	}
      
    
      module.exports= ({login, merchantRegistration,upload,upl, merchantRegistrationPost, merchantLoginPost,dashboard,addProduct,addProductPost, viewPro,
        editPage, editPagePost, deleteProduct, logout})