const express= require('express');
const router=express.Router();

const{login, merchantRegistration, upload, upl, merchantRegistrationPost,merchantLoginPost,dashboard,addProduct,addProductPost,viewPro,editPage, editPagePost,
    deleteProduct, logout}=require('../controller/mController');

router.get('/login',login);
router.get('/registration',merchantRegistration);
router.post('/registration', upload.single('image'),merchantRegistrationPost);
router.post('/login',merchantLoginPost);
router.get('/dashboard',dashboard);
router.get('/addProduct',addProduct);
router.post('/addProduct',upl.single('image'),addProductPost);
router.get('/viewProduct', viewPro);
router.get('/edit/:pid', editPage);
router.post('/edit/:pid', editPagePost);
router.get('/delete/:pid', deleteProduct);
router.get('/logout', logout);


module.exports=router;
