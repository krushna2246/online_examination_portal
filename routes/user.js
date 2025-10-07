var express = require("express");
var exe = require("./connection");
var url=require('url');
var router =express.Router();

function login(req)
{
    if(req.session.user_tbl_id==undefined)
    {
        return false;
    }
    else
    {
        return true;
    }

};


function getDate() {
    var today = new Date();
    var date = (today.getDate() < 10) ? "0" + today.getDate() : today.getDate();
    var month = (today.getMonth() + 1) < 10 ? "0" + (today.getMonth() + 1) : (today.getMonth() + 1);
    var year = today.getFullYear();
    return (year + "-" + month + "-" + date);
}
function getTime() {
    var time = new Date();
    var hours = (time.getHours() < 10) ? "0" + time.getHours() : time.getHours();
    var minutes = (time.getMinutes() < 10) ? "0" + time.getMinutes() : time.getMinutes();
    var seconds = (time.getSeconds() < 10) ? "0" + time.getSeconds() : time.getSeconds();
    return (hours + ":" + minutes + ":" + seconds);
}


router.get("/", async function (req, res) {
    if (req.session.user_tbl_id != undefined) {
        var username = req.session.user_name;
    }
    else {
        var username = undefined;
    }

    var obj = { "username": username,"login":login(req) }
    res.render("user/home.ejs", obj);

});

router.get("/login", function (req, res) {
    if (req.session.user_tbl_id != undefined) {
        var username = req.session.user_name;
    }
    else {
        var username = undefined;
    }

    var obj = { "username": username,"login":login(req) }
    res.render("user/login.ejs", obj);
});


router.post("/register_user", async function (req, res) {
    // var sql=`CREATE TABLE user_tbl(user_tbl_id INT PRIMARY KEY AUTO_INCREMENT , user_name VARCHAR(200) ,mobile VARCHAR(20),password VARCHAR(200))`;

    d = req.body;
    var sql = `INSERT INTO user_tbl(user_name,mobile,password)    
            VALUES('${d.user_name}','${d.mobile}','${d.password}')`;

    await exe(sql);
    res.send(`
        <script>
            alert('Account Created');
            window.location.href='/login';
        </script> 
    `);
});

router.post("/login_now", async function (req, res) {
    var d = req.body;
    var sql = `SELECT * FROM user_tbl WHERE mobile='${d.mobile}' AND password='${d.password}'`;
    var data = await exe(sql);
    if (data.length > 0) {
        req.session.user_tbl_id = data[0].user_tbl_id;
        req.session.user_name = data[0].user_name;
        res.redirect("/");
    }
    else {
        res.send(`
        <script>
            alert('Login Failed');
            window.location.href='/login';
        </script> 
    `);

    }
});


router.get("/join_test", async function (req, res) {
    if (req.session.user_tbl_id != undefined) {
        var username = req.session.user_name;
    }
    else {
        var username = undefined;

    }

    var test_list = await exe("SELECT * FROM test");

    if (username != undefined) {
        var obj = { "username": username, "test_list": test_list,"login":login(req) }
        res.render("user/join_test.ejs", obj);
    }
    else {
        res.send(`
        <script>
            alert('Login Failed');
            window.location.href='/login';
        </script> 
    `);
    }
});

router.get("/start_test/:test_id", async function (req, res) {
    if (req.session.user_tbl_id != undefined) {
        var username = req.session.user_name;
    }
    else {
        var username = undefined;

    }

    var test_list = await exe("SELECT * FROM test");

    if (username != undefined) {
        var user_id = req.session.user_tbl_id;
        var test_id = req.params.test_id;
        var test_start_date = getDate();
        var test_start_time = getTime();
        var test_det = await exe(`SELECT * FROM test WHERE test_id='${test_id}'`);
        var test_total_time = test_det[0]['test_duration'];
        var test_total_marks = test_det[0]['total_marks'];
        var test_total_questions = test_det[0]['no_of_questions'];
        var marks_per_question = test_det[0]['marks_p_que'];
        var obtain_mark = '0';
        var test_submit_time = "";

        // var sql=`CREATE TABLE user_test(user_test_id INT PRIMARY KEY AUTO_INCREMENT,user_id INT, test_id INT,test_start_date VARCHAR(200),test_start_time VARCHAR(20),test_total_time VARCHAR(20),test_total_marks VARCHAR(20),test_total_questions VARCHAR(200),marks_per_question VARCHAR(20),obtain_mark VARCHAR(20),test_submit_time VARCHAR(20),test_status VARCHAR(20))`;

        var sql = `INSERT INTO user_test(user_id, test_id,test_start_date,test_start_time,test_total_time ,test_total_marks,test_total_questions,marks_per_question,obtain_mark,test_submit_time,test_status) VALUES('${user_id}','${test_id}','${test_start_date}','${test_start_time}','${test_total_time}','${test_total_marks}','${test_total_questions}','${marks_per_question}','${obtain_mark}','${test_submit_time}','active')`;

        // console.log(sql);
        var data = await exe(sql);
        // console.log(data);

        var user_test_id = data.insertId;
        var subject_id = test_det[0]['subject_id'];
        var questions = await exe(`SELECT * FROM question_tbl WHERE subject_id='${subject_id}'`);

        for (i = 0; i < test_det[0]['no_of_questions']; i++) {
            if (questions[i] != undefined) {
                var question_id = questions[i]['question_tbl_id'];
                var provided_ans = "";
                var check_ans = "false";
                var attempted = "no";
                var question_start_time = "";

                // var sql=`CREATE TABLE user_test_question (user_test_question_id INT PRIMARY KEY AUTO_INCREMENT,user_test_id INT, user_id INT,question_id INT , test_id INT , provided_ans VARCHAR(10),check_ans VARCHAR(10),attempted VARCHAR(10),question_start_time VARCHAR(20))`;

                var sql = `INSERT INTO user_test_question(user_test_id,user_id,question_id,test_id,provided_ans,check_ans,attempted,question_start_time) VALUES ('${user_test_id}','${user_id}','${question_id}','${test_id}','${provided_ans}','${check_ans}','${attempted}','${question_start_time}')`
                // console.log(sql);
                await exe(sql);
            }
        }
        res.redirect("/test_open/" + user_test_id);
    }
    else {
        res.send(`
    <script>
        alert('Login Failed');
        window.location.href='/login';
    </script> 
`);
    }
});

router.get("/test_open/:user_test_id",async function (req, res) 
{
    var user_test_id=req.params.user_test_id;

    var sql=`SELECT * FROM user_test_question WHERE user_test_id='${user_test_id}' AND attempted='yes'`;

    var attempt_questions=await exe(sql);
    var attempted= attempt_questions.length;

    var sql=`SELECT * FROM user_test_question, question_tbl WHERE user_test_question.question_id=question_tbl_id AND user_test_id='${user_test_id}' AND  attempted='no'`;

    var data=await exe(sql);
    
    
    
    var sql=`SELECT test_total_time,test_total_questions,test_start_time FROM user_test WHERE user_test_id='${user_test_id}'`;
    test_time= await exe(sql);
    // console.log(test_time[0]['test_total_time']);
    // console.log(test_time[0]['test_start_time']);

    var question_start_time = getTime();

    if(data.length>0)
    {

        var sql=`UPDATE user_test_question SET attempted='yes', question_start_time='${question_start_time}' WHERE  user_test_question_id='${data[0]['user_test_question_id']}'`;

        // console.log(data);
        await exe(sql);
        var obj={"questions":data,"que_no":attempted+1};
        res.render("user/test_open.ejs",obj);
    }
    else
    {
        res.redirect("/result/"+user_test_id);
    }

});

router.post("/submit_user_answer",async function(req,res)
{
    sql=`SELECT * FROM question_tbl WHERE question_tbl_id='${req.body.question_id}'`;
    var question_det= await exe(sql);
    if(question_det[0]['correct_ans']==req.body.provided_ans)
    {
        var check_ans=true;
    } else {
        var check_ans="false";
    }

    var provided_ans=req.body.provided_ans;

    var sql=`UPDATE user_test_question SET provided_ans='${provided_ans}', check_ans='${check_ans}' WHERE user_test_question_id='${req.body.user_test_question_id}' `

    await exe(sql);
    res.redirect("/test_open/"+req.body.user_test_id);
});

router.get("/result/:user_test_id",async function(req,res)
{
    sql=`SELECT * FROM user_test WHERE user_test_id='${req.params.user_test_id}'`;
    var test_det= await exe(sql);

    var attempted= await exe(`SELECT count(user_test_question_id) as ttl FROM user_test_question WHERE attempted='yes' AND user_test_id='${req.params.user_test_id}'`);
    
    var correct_ans= await exe(`SELECT count(user_test_question_id) as ttl FROM user_test_question WHERE check_ans='true' AND user_test_id='${req.params.user_test_id}'`);

    var obtain_mark=correct_ans[0]['ttl']*test_det[0]['marks_per_question'];

    var sql = "UPDATE user_test SET obtain_mark = '"+obtain_mark+"' WHERE user_test_id='"+req.params.user_test_id+"'";
    await exe(sql);

    var obj={"total_marks":test_det[0]['test_total_marks'],"obtain_mark":obtain_mark ,"login":login(req)}
    // res.send("Result"+correct_ans[0]['ttl']);
    res.render("user/result.ejs",obj);
});



router.get("/about", function (req, res) 
{
    var obj={"login":login(req)};
    res.render("user/about.ejs",obj);

});
router.get("/courses",function(req,res)
{
    var obj={"login":login(req)};
    res.render("user/courses.ejs",obj);
});

router.get("/contact",function(req,res)
{
    var obj={"login":login(req)};
    res.render("user/contact.ejs",obj);
});

router.get("/logout",function(req,res)
{

    req.session.user_tbl_id =undefined;
    res.redirect("/");
});


module.exports = router;