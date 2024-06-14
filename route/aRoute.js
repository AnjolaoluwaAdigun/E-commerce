const express= require('express');
const router=express.Router();

const{login, adminRegistration, upload, upl, adminRegistrationPost,adminLoginPost,dashboard,viewMerchant,editPage, editPagePost,
    deleteMerchant, logout}=require('../controller/adminController');

router.get('/adminLogin',login);
router.get('/adminRegistration',adminRegistration);
router.post('/adminRegistration',adminRegistrationPost);
router.post('/adminLogin',adminLoginPost);
router.get('/adminDashboard',dashboard);
router.get('/viewMerchants', viewMerchant);
router.get('/edit/:aid', editPage);
router.post('/edit/aid', editPagePost);
router.get('/delete/:aid', deleteMerchant);
router.get('/logout', logout);


module.exports=router;
