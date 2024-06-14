const mongoose= require('mongoose'),
      bcrypt=require('bcryptjs'),
      multer=require('multer'),
      fs=require('fs'),
      path=require('path'),
      Merchant= require('../models/merchant'),
      Product=require('../models/product');
      Admin=require('../models/admin');
        

      const login=(req,res)=>{
        res.render("adminLogin")
      }
      const adminRegistration= (req,res)=>{
        res.render("adminRegistration")
      }
      const adminRegistrationPost = (req, res) => {
        const { username, pass1, pass2 } = req.body;
        let errors = [];
    
        // Console log to debug incoming form data
        console.log(req.body);
    
        // Check if all fields are provided
        if (!username || !pass1 || !pass2) {
            errors.push({ msg: "Please ensure all fields are filled" });
        }
    
        // Check if passwords match
        if (pass1 !== pass2) {
            errors.push({ msg: "Passwords do not match" });
        }
    
        // Check password length
        if (pass1 && pass1.length < 6) {
            errors.push({ msg: "Password should be at least 6 characters" });
        }
    
        // Render errors if any
        if (errors.length > 0) {
            return res.render("adminRegistration", { errors, username, pass1, pass2 });
        }
    
        // Check if username already exists
        Admin.findOne({ username: username })
            .then(result => {
                if (result) {
                    errors.push({ msg: "Username already exists" });
                    return res.render("adminRegistration", { errors, username, pass1, pass2 });
                }
    
                // Encrypt password and save new admin
                bcrypt.hash(pass1, 10, (err, hash) => {
                    if (err) {
                        req.flash('error_msg', "Could not encrypt the password");
                        return res.redirect('/adminRegistration');
                    }
    
                    const newAdmin = new Admin({ username, password: hash });
                    newAdmin.save()
                        .then(() => {
                            req.flash('message', 'Registration Successful. You can now login');
                            res.redirect('/adminLogin');
                        })
                        .catch(err => {
                            req.flash('error_msg', "Could not save into the Database");
                            res.redirect('/adminRegistration');
                        });
                });
            })
            .catch(err => {
                req.flash('error_msg', "Database error");
                res.redirect('/adminRegistration');
            });
    };
    
      const adminLoginPost= (req,res)=>{
        const{username,password}=req.body;

        Admin.findOne({username:username})
        .then((result)=>{
          if(!result){
            req.flash('error_msg',"This Username does not exist");
            res.redirect('/adminLogin');
          }else{
            bcrypt.compare(password,result.password,(err,isVerified)=>{
              if(err){
                req.flash('error_msg', "Something Appears Wrong "+ err);
                res.redirect('/adminLogin');
              }
              if(isVerified){
                //Establish SESSION Variables
                req.session.admin_id= result._id;
                req.session.username=result.username;

                //redirect merchant to dashboard page
                res.redirect('/adminDashboard')
              } else{
                req.flash('error_msg', "Invalid Password");
                res.redirect('/adminLogin');
              }
            })
          }
        })
        .catch((err)=>{
          req.flash('error_msg', "There was a problem selecting from DB");
          res.redirect('/adminLogin');
        })
      }

      const dashboard=(req,res)=>{
        //IF OUR SESSION VARIABLES ARE NOT SET
        if(!req.session.admin_id && !req.session.username){
          res.redirect('/adminLogin');

        }else{
          const aid=req.session.admin_id;
          const uname=req.session.username;

          res.render('adminDashboard',{aid, uname})
        }
      }
      
      const viewMerchant = (req, res) => {

				if(!req.session.admin_id && !req.session.username) {
				req.flash('error_msg', "Please login to access our admin privileges");
				res.redirect('/adminLogin');
			   } else {
					const aid = req.session.admin_id;
					const uname = req.session.username;

					Merchant.find({username:uname})
					.then((results) => {
							res.render('viewMerchants', {aid,uname,results})
					})
					.catch((err) => {
							req.flash('error_msg', 'Could not select from DB:' +err);
							res.redirect('/viewMerchants');
					})
			}
	}


	const editPage = (req, res) => {
				if(!req.session.admin_id && !req.session.username) {
					req.flash('error_msg', 'Please login to access admin priviledges');
					res.redirect('/adminLogin');
				} else {
					const aid = req.session.admin_id;
					const uname = req.session.username;

					Merchant.findOne({_id:req.params.mid})
					.then((record) => {
						res.render('admin_edit_page', {record, aid, uname});
					})
					.catch((err) => {
						req.flash('error_msg', 'Could not Select From DB');
						res.redirect('/viewMerchants');
					})
				}
	}

	const editPagePost = (req, res) => {
			if(!req.session.admin_id && !req.session.username) {
					req.flash('error_msg', 'Please login to access admin priviledges');
					res.redirect('/adminLogin');
				} else {

						const{email,phone} = req.body;
						const mid = req.params.mid;

					Product.findByIdAndUpdate(mid, {$set: {email,phone}})

					.then(() => {
						req.flash('message', "Merchant Successfully Updated");
						res.redirect('/viewMerchant');
					})
					.catch((err) => {
						req.flash('error_msg', 'Could not Update Merchant');
						res.redirect('/edit/:mid');
					})
				}
	}


	const deleteMerchant = (req, res) => {
			if(!req.session.admin_id && !req.session.username) {
					req.flash('error_msg', 'Please login to access admin priviledges');
					res.redirect('/adminLogin');
				} else {
						const mid = req.params.mid;

						Merchant.findByIdAndDelete(mid)
						.then(() => {
							req.flash('message', 'Merchant Successfully Deleted');
							res.redirect('/viewMerchant');
						})
						.catch((err) => {
							req.flash('error_msg', 'Could not delete merchant');
							res.redirect('/viewMerchant')
						})
				}
	}
	const logout = (req, res) => {
			if(!req.session.merchant_id && !req.session.username) {
					req.flash('error_msg', 'Please login to access app');
					res.redirect('/adminLogin');
				} else {

						req.session.destroy();
						res.redirect('/adminLogin');
				}
	}
      
    
      module.exports= {login, adminRegistration,adminRegistrationPost, adminLoginPost,dashboard, viewMerchant,editPage, editPagePost, deleteMerchant, logout}