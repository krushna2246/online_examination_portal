var express = require("express");
var exe = require("./connection");
var router =express.Router();
var url=require('url');


function login(req)
{
    if(req.session.admin_id==undefined)
    {
        return false;
    }
    else
    {
        return true;
    }

};




router.get("/",function(req,res)
{
    if(req.session.admin_id == undefined)
    {
        res.redirect("/admin/login");
    }
    else
    {
        
        var obj = {"login":login(req) }
        res.render("admin/home.ejs",obj);
    }
});

router.get("/add_admin",function(req,res)
{
    if(req.session.admin_id == undefined)
    {
        res.redirect("/admin/login");
    }
    else
    {
        var obj = {"login":login(req) }
        res.render("admin/add_admin.ejs",obj);
    }
});

router.post("/save_admin", async function(req,res)
{
    const today = new Date();
    var time = today.getTime();
    var admin_img=time+req.files.image.name;
    
    req.files.image.mv('public/uploads/admins_photos/'+admin_img);
    
    var sql=`INSERT INTO admin(name,admin_img,email,password) VALUES('${req.body.name}','${admin_img}','${req.body.email}','${req.body.password}')`;
    await exe(sql);
    
    res.redirect("/admin/admin_list");
});

router.get("/admin_list",async function(req,res)
{
    if(req.session.admin_id == undefined)
    {
        res.redirect("/admin/login");
    }
    else{
        var data = await exe (`select * from admin`);   
        
        // console.log(data[0]);
        var obj = {"admin":data,"login":login(req)}
        res.render("admin/admin_list.ejs",obj);
        }
});


router.get("/admin_details/:admin_id",async function(req,res)
{
    var admin_id = req.params.admin_id;
    // res.send("admin_id : "+admin_id);
    var data = await exe (`select * from admin WHERE admin_id ='${admin_id}'`);  
    
    var obj = {"admin":data,"login":login(req)}
    res.render("admin/admin_details.ejs",obj);
});



router.get("/add_subject",function(req,res)
{
    if(req.session.admin_id == undefined)
    {
        res.redirect("/admin/login");
    }
    else{
        var obj = {"login":login(req)}
        res.render('admin/add_subject.ejs',obj);
    }
});

router.post("/save_subject", async function(req,res)
{
    // res.send(req.body);
    // var sql=`CREATE TABLE subject(subject_id INT PRIMARY KEY AUTO_INCREMENT,subject_name VARCHAR(200), year VARCHAR(200))`
    var sql=`INSERT INTO subject(subject_name,year) VALUES('${req.body.subject_name}','${req.body.year}')`
    await exe(sql);
    res.redirect("/admin/add_subject");
});

router.get("/add_question",async function(req,res)
{
    if(req.session.admin_id == undefined)
    {
        res.redirect("/admin/login");
    }
    else{
        var subject=await exe("SELECT * FROM subject");
        var obj={"subject":subject ,"login":login(req)}
        // console.log(obj);
        res.render("admin/add_question.ejs",obj)
    }
});

router.post("/save_question",async function(req,res)
{
    // var sql=`CREATE TABLE question_tbl(question_tbl_id INT PRIMARY KEY AUTO_INCREMENT,question TEXT,option_a TEXT,option_b TEXT,option_c TEXT,option_d TEXT,ans_desc TEXT,correct_ans VARCHAR(5),subject_id INT)`;
    
    var d=req.body;
    var sql=`INSERT INTO question_tbl(question,option_a,option_b,option_c,option_d,ans_desc,correct_ans ,subject_id) VALUES ('${d.question}','${d.option_a}','${d.option_b}','${d.option_c}','${d.option_d}','${d.ans_desc}','${d.correct_ans}','${d.subject_id}')`;
    await exe(sql); 
    // res.send(req.body);
    res.redirect("/admin/add_question");
});

router.get("/question_list", async function(req,res)
{
    if(req.session.admin_id == undefined)
    {
        res.redirect("/admin/login");
    }
    else{
        var urlData=url.parse(req.url,true).query;
        // console.log(urlData);

        if(urlData.subject_id!=undefined)
        {
            var active_tab=urlData.subject_id
            var data=await exe(`SELECT * FROM question_tbl,subject WHERE subject.subject_id=question_tbl.subject_id 
            AND question_tbl.subject_id='${urlData.subject_id}'`);//Join
        }
        else
        {
            var active_tab="All"
            var data=await exe("SELECT * FROM question_tbl,subject WHERE subject.subject_id=question_tbl.subject_id");//Join
        }
        
        var subject=await exe("SELECT * FROM subject");
        var obj={"questions":data,"subject":subject,"active_tab":active_tab ,"login":login(req)}
        res.render("admin/question_list.ejs",obj);
    }
});

router.get("/question_details/:question_id",function(req,res)
{
    res.send(req.params.question_id)
});


router.get("/create_test",async function(req,res)
{
    if(req.session.admin_id == undefined)
    {
        res.redirect("/admin/login");
    }
    else{
        var subject=await exe("SELECT * FROM subject");
        var obj={"subject":subject ,"login":login(req)}
        res.render("admin/create_test.ejs",obj);
    }
});


router.post("/save_test",async function(req,res)
{
    var fname=req.files.test_image.name;
    req.files.test_image.mv('public/uploads/'+fname);

    // var sql=`CREATE TABLE test(test_id INT PRIMARY KEY AUTO_INCREMENT, test_title VARCHAR(100), subject_id INT, no_of_questions INT , marks_p_que INT , total_marks INT , test_duration INT , test_image TEXT)`;

    d=req.body;
    var sql=`INSERT INTO test(test_title ,subject_id ,no_of_questions ,marks_p_que ,total_marks ,
            test_duration ,test_image)
             VALUES 
             ('${d.test_title}','${d.subject_id}','${d.no_of_questions}','${d.marks_p_que}','${d.total_marks}',
             '${d.test_duration}','${fname}')`;
    // res.send(sql);
    await exe(sql);
    res.redirect("/admin/create_test");
});

router.get("/test_list",async function(req,res)
{
    if(req.session.admin_id == undefined)
    {
        res.redirect("/admin/login");
    }
    else{
        var data=await exe("SELECT * FROM test,subject WHERE test.subject_id=subject.subject_id");
        var obj={"test_list":data ,"login":login(req)}
        res.render("admin/test_list.ejs",obj);
    }
});

router.get("/login",function(req,res)
{
    res.render("admin/login.ejs")
});

router.post("/admin_login_process",async function(req,res)
{
    var sql = `SELECT * FROM admin WHERE email = '${req.body.admin_email}' AND password = '${req.body.admin_password}'`;

    var data = await exe(sql);
    if(data.length > 0)
    {
        req.session.admin_id = data[0].admin_id
        res.redirect("/admin");
    }
    else
    {
        res.redirect("/admin");
    }
});


router.get("/logout",function(req,res)
{
    req.session.admin_id =undefined;
    res.redirect("/admin/login");
});

router.get("/profile",function(req,res)
{
    var admin_id = req.session.admin_id;
    res.send("id = "+admin_id);
    
});


router.get("/result",async function(req,res)
{
    if(req.session.admin_id == undefined)
    {
        res.redirect("/admin/login");
    }
    else{
        var result=await exe("SELECT subject_id,obtain_mark,user_name,test_total_marks,test_title FROM user_test,user_tbl,test WHERE user_test.user_id=user_tbl.user_tbl_id && test.test_id=user_test.test_id");
        var obj={"result":result }
        // console.log(obj);
        // res.send(obj);
        res.render("admin/result.ejs",obj);
    }
});



module.exports = router;