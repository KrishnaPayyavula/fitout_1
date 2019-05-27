
////importing
var express = require('express');
var session = require('express-session'); //To Access Session data on each Req/res..
var dirpath = require('path');
// var degndata = require('./designerData');
var parser = require('body-parser');
var forceSSL = require('express-force-ssl');
var http = require('http');
var https = require('https');
var fs = require('fs');
var useHttp = require('./useHttp');
var db_script = require('./Database/database.js');
// var filesaver = require('file-saver');
//Routerscript
// var routerfile = require('./main_router');
var app = express();

//Mongo_instances

var assert = require('assert');
const MongoClient = require('mongodb').MongoClient;

const auth = require('util').format;

var app = express();

// Connection URL
//const url = 'mongodb://krishna:6666@172.20.8.103:27017?authMechanism=SCRAM-SHA-1&authSource=admin';
const url = 'mongodb://172.20.8.117:27017';
// const url = 'mongodb://0.0.0.0:27017';
//const url = 'mongodb://admin:passme123@0.0.0.0:27017?authMechanism=SCRAM-SHA-1&authSource=admin';
var options = {
    useNewUrlParser: true,
    numberOfRetries: 3,
    reconnectInterval: 4 * 1000,
    raw: false,
    forceServerObjectId: true,

};
//Port Declaration..
var port = process.env.PORT || 8082;
var mongo_client, test_db, user_db, runresults_db, projects_db, userDetails;
MongoClient.connect(url, options, function(err, client) {
    assert.equal(null, err);
    mongo_client = client;
    // console.log('Connection Error:', client);
    test_db = client.db('test_db');
    user_db = client.db('user_database');
    runresults_db = client.db('run_results');
    projects_db = client.db('projects');
    app.listen(port, function(err) {
        assert.equal(null, err);
        console.log('App is listening On PORT:', port);
    });

});




//HTTPS server
// var ssl_options = {
//     key: fs.readFileSync(__dirname + '/Security/private.key'),
//     cert: fs.readFileSync(__dirname + '/Security/certificate.crt'),
//     ca: fs.readFileSync(__dirname + '/Security/ca_bundle.crt')
// };

// var server = http.createServer(app);
// var secureServer = https.createServer(ssl_options, app);


// secureServer.listen(443);
// server.listen(80);

app.set('trust proxy', 1); //for the secure proxy
// initialize express-session to allow us track the logged-in user across sessions.
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {
        path: '/',
        secure: true,
        maxAge: null
    }
}));
var oneYear = 31557600000;
//To Use Source folder as static
app.use(express.static(__dirname + '/Source'));
app.use(express.static(__dirname + '/node_modules'));
// initialize body-parser to parse incoming parameters requests to req.body
app.use(parser.urlencoded({
    extended: true
}));


//Variable Declarations...cls
var Username = '',
    password = '',
    User_ID = '',
    role = '',
    nodeSession = '',
    thisDoc = '',
    ses_data = {},
    win_data = {},
    data = {},
    db_data = {},
    Rev_ID,
    clientIp = [];

//Request..
/*
app.use(function(req, res, next) {
    // console.log("@@@@@@", req.path);
    if (req.path == '/' || req.path == '/login') {
        next();
    } else {
        ipadrs = getClientIp(req);
        indexOfIp = clientIp.indexOf(ipadrs);
        if (indexOfIp < 0) {
            console.log("login required!!");
            res.redirect('/');
        } else {
            next();
        }
    }

});*/

// app.get('/to_dashboard', forceSSL, function(req, res) {
    app.get('/to_dashboard', function(req, res) {
    console.log("Now u r in dashboard window");
    path = dirpath.join(__dirname + '/Source/html/dashboard.html');
    db_script.log_window_Data(user_db, Username, 'Dashboard', function(err, response) {

    });
    res.sendFile(path);
});
// app.get('/to_projects', forceSSL, function(req, res) {
    app.get('/to_projects', function(req, res) {
    console.log("Now u r in designer window");
    path = dirpath.join(__dirname + '/Source/html/projects.html');
    db_script.log_window_Data(user_db, Username, 'Design', function(err, response) {

    });
    res.sendFile(path);
});

// app.get('/to_config', forceSSL, function(req, res) {
    app.get('/to_config', function(req, res) {
    console.log("Now u r in Configuration window");
    path = dirpath.join(__dirname + '/Source/html/config.html');

    db_script.log_window_Data(user_db, Username, 'Config', function(err, response) {

    });
    res.sendFile(path);
});
// app.get('/to_analytics', forceSSL, function(req, res) {
    app.get('/to_analytics', function(req, res) {
    console.log("Now u r in Analytics window");
    path = dirpath.join(__dirname + '/Source/html/Analytics.html');

    db_script.log_window_Data(user_db, Username, 'Analytics', function(err, response) {

    });
    res.sendFile(path);
});
// app.get('/to_runner', useHttp, function(req, res) {
    app.get('/to_runner', function(req, res) {
    console.log("Now u r in Runner window");
    path = dirpath.join(__dirname + '/Source/html/runner.html');

    db_script.log_window_Data(user_db, Username, 'Runner', function(err, response) {

    });
    res.sendFile(path);
});
// app.get('/to_runresult', forceSSL, function(req, res) {
    app.get('/to_runresult', function(req, res) {
    console.log("Now u r in Run result window");
    path = dirpath.join(__dirname + '/Source/html/runresult.html');
    db_script.log_window_Data(user_db, Username, 'Run result', function(err, response) {

    });
    // console.log(path);
    res.sendFile(path);
});

var projectdb; //contains the project database object

app.post('/test', function(req, res) {
    resp = [Username, role];
    res.send(resp);
});

// Mongo_handler for the login_check 
app.post('/login_check', function(req, res) {
    console.log(req.body.username);
    console.log(req.body.password);
    Username = req.body.username;
    password = req.body.password;
    db_script.check_login(user_db, Username, password, function(err, log_data) {
        // console.log("response from databse" + log_data);
        if (log_data[0] == 'Approved') {
            console.log("approved");
            // console.log("approved", log_data);
            projectdb = log_data[2];
            User_ID = log_data[3];
            // console.log("approved!!!!!!!!!!", projectdb);
            role = log_data[1];
            userDetails = log_data[4];
            db_script.log_data(user_db, Username, 'login', role, function(err, result) {
                if (err) {
                    console.log(err);
                }
            });
            res.send('Approved');
        } else if (log_data[0] == 'Not Approved') {
            console.log("Access Denied");
            res.send('notApproved');
        }
    });
});
//End of Mongo Handler

// function getClientIp(request) {
//     // console.log("i am in getclientip function");
//     var cIp;
//     var forwardedIpsStr = request.header('x-forwarded-for');
//     if (forwardedIpsStr) {
//         var forwardedIps = forwardedIpsStr.split(',');
//         cIp = forwardedIps[0];
//     }
//     if (!cIp) {
//         cIp = request.connection.remoteAddress;
//     }
//     cIp = cIp.split(':');
//     cIp = cIp.pop();
//     // console.log("getclientip function end");
//     return cIp;
// }

// app.get('/logOut', forceSSL, function(req, res) {
    app.get('/logOut', function(req, res) {
    // console.log("In logged OUT");
    db_script.log_data(user_db, Username, 'logout', data, function(err, result) {
        assert.equal(err, null);
        if (result == 'saved') {
            console.log(Username + " was Logged out!!");
            res.redirect('/');
        }
    });
    Username = role = '';
});


// app.get('/', forceSSL, function(req, res) {
    app.get('/', function(req, res) {
    path = dirpath.join(__dirname + '/Source/html/login.html');
    res.sendFile(path);
});
// Get Database details..
//__Mongo_S__
app.post('/testrun', function(req, res) {
    // console.log("works in app.js");
    var trun_array = [];
    var trun_data = {};
    test_db.collection('test_run_db').find({}).toArray(function(err, doc) {
        // console.log("Data From MongoDB::", doc);
        doc.forEach(function(data) {
            // console.log("/testrun :->", data._id);
            trun_data[data._id] = data.Test_Run_Data;
            trun_array.push(trun_data);
            trun_data = {};
        });
        // console.log(JSON.stringify(trun_array));
        // trun_array = JSON.stringify(trun_array);

        // console.log("????????????????????????", trun_array);
        res.send(trun_array);
    });
});
//__End __Mongo
//Mongo Handler for getting TestCase Details
app.post('/TCDetails', function(req, res) {
    var doc_id = req.body.docname;
    console.log(doc_id);
    test_db.collection('test_run_db').aggregate([{ $match: /** * query - The query in MQL. */ { _id: doc_id } }, { $project: /** * specifications - The fields to *   include or exclude. */ { 'Test_Run_Data.testplans': 1 } }, { $unwind: /** * path - Path to the array field. * includeArrayIndex - Optional name for index. * preserveNullAndEmptyArrays - Optional *   toggle to unwind null and empty values. */ { path: '$Test_Run_Data.testplans', } }, { $lookup: /** * from - The target collection. * localField - The local join field. * foreignField - The target join field. * as - The name for the results. */ { from: 'test_plan', localField: 'Test_Run_Data.testplans', foreignField: '_id', as: 'TC_List' } }, { $unwind: /** * path - Path to the array field. * includeArrayIndex - Optional name for index. * preserveNullAndEmptyArrays - Optional *   toggle to unwind null and empty values. */ { path: '$TC_List', } }, { $unwind: /** * path - Path to the array field. * includeArrayIndex - Optional name for index. * preserveNullAndEmptyArrays - Optional *   toggle to unwind null and empty values. */ { path: '$TC_List.Test_Plan_Data.testcases', } }, { $lookup: /** * from - The target collection. * localField - The local join field. * foreignField - The target join field. * as - The name for the results. */ { from: 'test_case', localField: 'TC_List.Test_Plan_Data.testcases', foreignField: '_id', as: 'TC_Details' } }, { $unwind: /** * path - Path to the array field. * includeArrayIndex - Optional name for index. * preserveNullAndEmptyArrays - Optional *   toggle to unwind null and empty values. */ { path: '$TC_Details', } }, { $project: /** * specifications - The fields to *   include or exclude. */ { '_id': 0, 'TC_Details.Test_Case_Data': 1, 'TC_Details._id': 1, 'TC_Details.type': 1 } }], function(err, cur) {
        if (err) throw err;
        cur.toArray(function(err, doc) {
            if (err) throw err;
            // console.log("DOC AT HERE::=>>", doc);
            res.send(JSON.stringify(doc));
        });
    });
});
//End of Mongo Handler for getting TestCase Details
//check in database for existing user for login
// -------------------handler for get the testsuite name inside the designer page----------------
//Mongo Handler for the /loadDocs 
app.post('/loaddocs', function(req, res) {
    dbName = req.body.db_Name;
    console.log("load request hit", dbName);
    var testplannames = [],
        testcasenames = [],
        testrunnames = [];
    if (dbName == 'testplan') {
        console.log(":::->I am in tplan");
        test_db.collection('test_plan').find({}).toArray(function(err, doc) {
            if (err) throw err;
            doc.forEach(function(data) {
                // console.log("doc data:", data);
                testplannames.push(data);
            });
            res.send(testplannames);
        });

    } else if (dbName == 'testcase') {
        console.log(":::->I am in tcase");
        test_db.collection('test_case').find({}).toArray(function(err, doc) {
            if (err) throw err;
            doc.forEach(function(data) {
                // console.log("doc data:", data);
                testcasenames.push(data);
            });
            res.send(testcasenames);
        });
    } else if (dbName == 'testrun') {
        console.log(":::->I am in trun");
        test_db.collection('test_run_db').find({}).toArray(function(err, doc) {
            if (err) throw err;
            doc.forEach(function(data) {
                // console.log("doc data:", data);
                testrunnames.push(data);
            });
            res.send(testrunnames);
        });
    }
});
//End of mongo Handler for the loaddocs 
//__mongo_S_______________________________Krishna
app.post('/checkexistance', function(req, res) {
    db = req.body.dbname;
    if (db == 'test_run') {
        db = 'test_run_db';
    }
    _document = req.body.documentname;
    console.log("@ check existance handler::->", db, _document);
    test_db.collection(db).findOne({ _id: _document }, function(err, result) {
        if (err) throw err;
        console.log('Existance Result::->', result);
        if (result == null) {
            res.send('proceed');
        } else {
            res.send('exists');
        }
    });
});

app.post('/save', function(req, res) {
    var docname;
    var db, projectdbName;
    // console.log("save request hit", req.body);
    
    docdata = req.body.data;
    projectdbName = req.body.project;
    // console.log("doc!!!!!!!!!!!", docdata);
    if (docdata.type == 'testplan') {
        db = 'test_plan';
        docname = docdata.Test_Plan_Data.Test_Plan_Name;
        docdata._id = docname;
    } else if (docdata.type == 'testcase') {
        db = 'test_case';
        docname = docdata.Test_Case_Data.Test_Case_Name;
        docdata._id = docname;
    } else if (docdata.type == 'testsuite') {
        db = 'test_suite';
        docname = docdata.Test_Suite_Data.Test_Suite_Name;
        docdata._id = docname;
    }

    console.log("docname fffffff: ", docname);
    test_db.collection(db).findOneAndReplace({ _id: docname }, docdata, { upsert: true, returnOriginal: false }, function(err, inserted) {
        if (err) throw err;
        console.log('Inserted in TR/TP/TC:', inserted.insertedId);
        db_script.saveprojectdata(projects_db, projectdbName,docname, docdata.type + 's', "add");
        result = docname + " saved";
        // console.log("docname is ", docname);
        if (docdata.type == 'testsuite') {
            var log_query = { "_id": Username };
            var log_update = { '$addToSet': {} };
            log_update['$addToSet']['Recent_Creation'] = docname;
            console.log("Query::->", log_query, log_update);
            user_db.collection('log_history').updateOne(log_query, log_update, { upsert: true }, function(err, doc) {
                if (err) throw err;
                console.log("Saving Data::->", doc.modifiedCount);
            });
        }
        res.send([result, req.body.type]);
    });
});

//__mongo_End___________


// ---------handler for get the all testcases linked to the testsuite via testplans--------

app.post('/getdoc', function(req, res) {
    console.log("Hitted teh /getDoc Hadnler::::::::");
    var rBody = req.body;
    var db_name = rBody.dbname;
    var doc_name = rBody.docname;
    console.log('Details of /getDOc', rBody, db_name, doc_name);
    if (db_name == "TEST PLANS") {
        test_db.collection('test_plan').findOne({ _id: doc_name }, function(err, doc) {
            if (err) throw err;
            // console.log("Result Doc in /getdoc::::", doc);
            res.send(doc);
        });
    }
});


//Mongo Handler for the /deldoc  for deleting the TR/TP/TC and at the same time deleting the TR/TP/TC from the version array
app.post('/deldoc', function(req, res) {
    console.log("/deldoc::->", req.body);
    var rBody = req.body;
    var dbname = rBody.dbname;
    var docname = rBody.docname;

    if (dbname == "Test Plans") {
        test_db.collection('test_plan').deleteOne({ _id: docname }, function(err, doc) {
            assert.equal(null, err);
            assert.equal(1, doc.deletedCount);
            res.send(doc);
        });

    } else if (dbname == "Test Cases") {
        test_db.collection('test_case').deleteOne({ _id: docname }, function(err, doc) {
            assert.equal(null, err);
            assert.equal(1, doc.deletedCount);
            res.send(doc);
        });
    } else if (dbname == "Test Suites") {
        test_db.collection('test_suite').deleteOne({ _id: docname }, function(err, doc) {
            assert.equal(null, err);
            assert.equal(1, doc.deletedCount);
            res.send(doc);
        });
    }
    db_script.saveprojectdata(projects_db, rBody.project, rBody.docname, (dbname.toLowerCase()).replace(" ", ""), "remove");
});
//End ofMongo Handler for the /deldoc  for deleting the TR/TP/TC and at the same time deleting the TR/TP/TC from the version array

// ------------------------------handler for fetch user recent log_history details - -----------------//
//__Mongo__handler_for history
app.post('/history', function(req, res) {
    var usrname = Username;
    // console.log("Current User@@", usrname);
    var data;
    db_script.getlog(user_db, usrname, function(err, resp) {
        if (err) throw err;
        res.send(resp);
    });

});
//****Edit data from db****
//Start of Mongo Handler for the update Event
app.post('/update', function(req, res) {
    var edbname = req.body.edbname;
    var edocname = req.body.edocname;
    console.log("Hitted the update operator and details of  edbname and edocname ::", edbname, typeof(edocname));
    if (edbname == "Test Plans") {
        test_db.collection('test_plan').findOne({ _id: edocname }, function(err, doc) {
            if (err) throw err;
            // console.log("Document", doc);
            res.send(JSON.stringify(doc));
        });
    } else if (edbname == "Test Cases") {
        test_db.collection('test_case').findOne({ _id: edocname }, function(err, doc) {
            if (err) throw err;
            // console.log("Document", JSON.stringify(doc));
            res.send(JSON.stringify(doc));
        });
    } else if (edbname == "Test Suites") {
        test_db.collection('test_suite').findOne({ _id: edocname }, function(err, doc) {
            if (err) throw err;
            // console.log("Document", JSON.stringify(doc));
            res.send(JSON.stringify(doc));
        });
    }
});

//End of Mongo Handler for the update Event

/*Tree view data for test design page from db*/
//MongoHandler for the treeview function
app.post('/treeview', function(req, res) {
    // console.log('^%$%^^%#$%^#%^#%^%^^#$^');
    var testdocument = {};
    // db_script.case_tree(function(err, tc_name) {
    //     // console.log("TEST CASE NAME : ", tc_name);
    //     testdocument.tc = tc_name;
    //     db_script.plan_tree(function(err, tp_name) {
    //         // console.log("TEST PLAN NAME : ", tp_name);
    //         testdocument.tp = tp_name;
    //         db_script.run_tree(function(err, tr_name) {
    //             // console.log("TEST RUN NAME : ", tr_name);
    //             testdocument.tr = tr_name;
    //             res.send(testdocument);
    //             // console.log("Testdoc from db_script : ", testdocument);
    //         });
    //     });
    // });
    db_script.loadVersion(projects_db, projectdb, function(versionData) {
        // console.log("project data in app.js", versionData);

        // console.log("after loadVersion fun in app.js::->>>", versionData); used console
        res.send(versionData);
    });
});
app.post('/import',function(req,res){
    // console.log("from import ",req.body);
    importdata = req.body
    db_script.importdatatoDB(test_db,importdata,function(resfromdb){
        console.log("import response in appjs",resfromdb);
        res.send(resfromdb);
    })
});
// MongoHandler for the treeview function
/*chart data from db*/

// app.post('/chartdata', function(req, res) {
//     var chtdbname = req.body.chtdbname;
//     var chtdocname = req.body.chtdocname;
//     // console.log("dbname", chtdbname);
//     chartdb.get(chtdocname, function(err, doc) {
//         // console.log("document", doc)
//         res.send(doc);
//     });
// });
/*********************handler for get the run id ************************ */

//-----------start Mongo 
//Now it is being used for execution changed by Magesh @ 03May19
app.post('/getrunid', function(req, res) {
    runresults_db.collection('results_dolby').findOneAndUpdate({ _id: "RunId" }, { $inc: { currentrunid: 1 } }, function(err, doc) {
        if (err) throw err;
        console.log('>>>>>>>>>>', doc.value);
        res.send(doc.value);
    });
});
app.post('/getrunDetails',function(req,res){
  var runID  = req.body.run_id;
  // var runID = '45';
  runresults_db.collection('results_dolby').findOne({_id:"result1"},function(err,doc){
    // console.log("run details____****___",doc.runresults[runID]);
    if(doc.runresults[runID] !== undefined){
      res.send(doc.runresults[runID]);
    }
  })
 });
/*  handler for gettinf current user ID */
//start of Mongo_Handler for the getuserid
app.post('/getuserid', function(req, res) {
    user_db.collection('userID').findOneAndUpdate({ _id: "userId" }, { $inc: { currentID: 1 } }, { upsert: true }, function(err, doc) {
        if (err) throw err;
        console.log("After $inc ::->", doc);
        res.send(doc.value);
    });
});
//End of Mongo_Handler for the getuserid

/* Start Mongo Handling of userlist data saving by krishna*/
app.post('/saveuserlist', function(req, res) {
    // console.log("received res.body..", req.body);
    keyarr = Object.keys(req.body);
    var useridkey = keyarr[0];
    var save_Field = req.body[useridkey];
    save_Field.project = [];
    // console.log("data from client :", save_Field);
    var query = { "_id": 'userData' };
    var update = { '$set': {} };
    update['$set']['userList.' + useridkey] = save_Field;
    // console.log("Query::->", query, update);
    user_db.collection('userData').updateOne(query, update, { upsert: true }, function(err, doc) {
        if (err) throw err;
        console.log("Saving Data::->", doc.modifiedCount);
        res.send("Done");
    });
});
/* End Mongo Handling of userlist data saving by krishna*/

app.post('/updateuser', function(req, res) {
    console.log(req.body.global_index);
    // console.log(req.body);
    userid = req.body.global_index;
    var query = { "_id": 'userData' };
    var update = { '$set': {} };
    if (req.body.type == "edit") {
        update['$set']['userList.' + userid + '.userName'] = req.body.userName;
        update['$set']['userList.' + userid + '.role'] = req.body.role;
        update['$set']['userList.' + userid + '.email'] = req.body.email;
        // console.log("Query::->", query, update);
        // doc.userList[userid].userName = req.body.userName;
        // doc.userList[userid].role = req.body.role;
        // doc.userList[userid].email = req.body.email;
        user_db.collection('userData').updateOne(query, update, function(err, doc) {
            if (err) throw err;
            // console.log('Responce after Edit::->', doc.modifiedCount);
            res.send("edit");
        });
    } else if (req.body.type == "password") {
        update['$set']['userList.' + userid + '.passWord'] = req.body.passWord;
        // console.log("Query::->", query, update);
        // doc.userList[userid].passWord = req.body.passWord;
        user_db.collection('userData').updateOne(query, update, function(err, doc) {
            if (err) throw err;
            console.log('Responce after passwordUpdate::->', doc.modifiedCount);
            res.send("password");
        });
    }
});

/*  saverunresult */
//--------------start Mongo 
app.post('/saverunresult', function(req, res) {
    var storedata = {};
    var runresultdata = {};
    keyarr = Object.keys(req.body);
    // console.log("data from client :", req.body);
    var runidkey = keyarr[0];
    var exe_data = '';
    exe_data = req.body[runidkey].rundata;
    // console.log("Doc to store in Log_Page::->", exe_data, typeof(exe_data));
    var query = { "_id": 'result1' };
    var update = { '$set': {} };
    update['$set']['runresults.' + runidkey] = req.body[runidkey];
    console.log("Query::->", query, update);
    runresults_db.collection('results').updateOne(query, update, { upsert: true }, function(err, doc) {
        if (err) throw err;
        console.log("Responce after Saving the runresult::->", doc.modifiedCount);
        res.send('done');
    });

    var log_query = { "_id": Username };
    var log_update = { '$addToSet': {} };
    log_update['$addToSet']['Recent_Execution'] = req.body[runidkey].rundata;
    // console.log("Query::->", query, update);
    user_db.collection('log_history').updateOne(log_query, log_update, { upsert: true }, function(err, doc) {
        if (err) throw err;
        console.log("Saved Data in Log_History Data::->", doc.modifiedCount);
    });

});
//-------------End Mongo Handler  saverunresult


//Start of Mongo handler for load Project or Version 
app.post('/load_prjct_vrsn', function(req, res) {
    dbName = req.body.dbName;
    docName = req.body.docName;
    dbName = dbName.toLowerCase();
    console.log('load_prjct_vrsn handler details:::', dbName, docName);
    projects_db.collection('Project_Details').find({ _id: dbName }).toArray(function(err, docs) {
        if (err) throw err;
        // console.log("Total Project _Details::", docs);
        if (docName == 'Project_details') {
            res.send(docs);
        } else {
            docs.forEach(function(doc) {
                // console.log("Hitted:::in forEach")
                for (vname in doc.versions) {
                    if (docName == doc.versions[vname]._id) {
                        // console.log("Hitted the Inner loopsss", doc.versions[vname]);
                        res.send(doc.versions[vname]);
                    }
                }
            });
        }
    });
});

//End  of Mongo handler for load Project or Version 

//start of Mongo_Handler for the delete_version 
app.post('/delete_vrsn', function(req, res) {
    versionname = req.body.docName;
    dbName = req.body.dbName;
    dbName = dbName.toLowerCase();
    var query = {};
    var update = { '$unset': {} };
    query['_id'] = dbName;
    update['$unset']['versions.' + versionname] = '';
    console.log("Query::->", query, update);
    projects_db.collection('Project_Details').updateOne(query, update, function(err, doc) {
        if (err) throw err;
        // console.log("*********", doc);
        assert.equal(1, doc.result.nModified);
        console.log("version list updated successfully");
        res.send("deleted");
    });
});
//End of Mongo_Handler for the delete_version 

/********************* handler for get the runid data to draw ta bar graph *************************/
//Start of Mongo_Handler for the getRunIDData 
app.post('/getruniddata', function(req, res) {
    runresults_db.collection('results_dolby').findOne({ _id: 'result1' }, function(err, doc) {
        if (err) throw err;
        // console.log("RunId:::->", doc);
        res.send(doc);
    });

});
//End of Mongo_Handler for the getRunIDData 




//Mongo Handler for the loadproject and projecttr

app.post('/loadproject', function(req, res) {
    dbName = req.body.db_Name;
    version = req.body.version;
    project_name = req.body.projectname;
    console.log("/LoadProject ::->", dbName, version);
    db_script.loadProjectdata(test_db, projects_db, project_name, dbName, version, res);
});
app.post('/projecttr', function(req, res) {
    db_script.loadprojectTr(projectdb);
});

//End of Mongo Handler for the loadproject and projecttr

/* validating the userName with existing database */

//Start of Mongo Handler for the /validateUser
app.post('/validateUser', function(req, res) {

    console.log(req.body);
    var userName = req.body.userName;
    user_db.collection('userData').findOne({ _id: 'userData' }, function(err, doc) {
        if (err) throw err;
        status = false;
        var usrLst = doc.userList;
        var usrIdArry = Object.keys(doc.userList);
        console.log(usrIdArry);
        for (id in usrIdArry) {
            if (userName == (usrLst[usrIdArry[id]]).userName) {
                // console.log("*************", (usrLst[usrIdArry[id]]).userName);
                status = true;
                break;
            }
        }
        if (status) {
            res.send("exists");
        } else {
            res.send("not-exists");
        }
    });
});
//End of Mongo Handler for the /validateUser

/* handler to delete the user data from the database*/
//Start of Mongo Handler for the /deleteUser
app.post('/deleteUser', function(req, res) {
    var delIndex = parseInt(req.body.delIndex);
    console.log("deleteIndex::->", delIndex);
    var query = {};
    var update = { '$unset': {} };
    query['_id'] = 'userData';
    update['$unset']['userList.' + delIndex] = '';
    // console.log("@ /deleteUser::->",query, update);
    user_db.collection('userData').updateOne(query, update, function(err, doc) {
        if (err) throw err;
        assert.equal(1, doc.result.nModified);
        res.send("deleted");
    });

});
//End of Mongo Handler for the /deleteUser

/* Handler for get userdetails  - config page modified by Krishna */

//start of mongo_Handler for the userDetails
app.post('/userdetails', function(req, res) {
    user_db.collection('userData').findOne({ _id: 'userData' }, function(err, doc) {
        if (err) throw err;
        tmp = [doc, Username];
        res.send(tmp);
        console.log("Login by::->", Username);
    });
});
//End of mongo_Handler for the userdetails


/* Get run details for productivity chart in analytics*/

//Mongo Handler for the /rundata in producctivity charts in analytics
app.post('/rundata', function(req, res) {
    runresults_db.collection('results').findOne({ _id: 'result1' }, function(err, result) {
        if (err) throw err;
        // console.log("DatA :::", result);
        tmp = [result, userDetails];
        res.send(tmp);
        // res.send(result);
    });
});
// End of Mongo Handler for the /rundata in producctivity charts in analytics


// Start of mongo_handler for the /saveproject
app.post('/saveproject', function(req, res) {
    var pjdetails = req.body.projectDetails;
    console.log(pjdetails);
    var pjname = pjdetails.project_name;
    var pjcrtr = pjdetails.createdby;
    var pjdesr = pjdetails.description;
    projects_db.collection('Project_Details').distinct('_id', function(err, result) {
        if (err) throw err;
        console.log("Result @ DISTINCT :", result);
        console.log('One:', result.includes(pjname));
        if (result.includes(pjname) == true) {
            res.send("exists");
        } else if (result.includes(pjname) == false) {
            projects_db.collection('Project_Details').insertOne({ "_id": pjname, project_name: pjname, createdby: pjcrtr, createdon: new Date().toString(), configuration: pjdetails.configuration, description: pjdesr, versions: {} }, function(err, doc) {
                if (err) throw err;
                console.log("Inserted ID: ", doc.insertedId);
                var query = { "_id": 'userData' };
                var update_projects = { '$addToSet': {} };
                update_projects['$addToSet']['userList.' + User_ID + '.project'] = pjname;
                user_db.collection('userData').updateOne(query, update_projects, function(err, doc) {
                    if (err) throw err;
                    console.log('Responce adding project to user::->', doc.modifiedCount);
                    projectdb.push(pjname);
                    res.send("created");
                });
            });

        }
    });
});
//End of Project field for the /saveproject

//Saving Version Details to DB
// Mongo_Handler for Saving Version Detials to the Particular Project Document
app.post("/saveversion", function(req, res) {
    var versiondetails = req.body.versionDetails;
    console.log("VersioN Details", versiondetails);
    versiondetails.testcases = [];
    versiondetails.testplans = [];
    versiondetails.testruns = [];
    var type = versiondetails.typeof;
    var crntVId = versiondetails._id;
    var versionData = {};
    var crntDBName = versiondetails.crntdbname.toLowerCase();
    projects_db.collection('Project_Details').findOne({ _id: crntDBName }, function(err, result) {
        if (err) throw err;
        // console.log("Result from Single PROJECT", result);
        var keys = Object.keys(result.versions);
        console.log("Keys @::", keys);
        if (keys.includes(crntVId) == true) {
            console.log('Hitted True :');
            res.send("exists");
        } else if (keys.includes(crntVId) == false) {
            console.log('Hitted false :');
            if (result.versions != undefined) {
                versionData = result.versions;
            }
            // console.log("VersionDaata from DB:", versionData);
            versionData[crntVId] = versiondetails;
            // console.log("Version Details:::::", versionData);
            projects_db.collection("Project_Details").findOneAndReplace({ _id: crntDBName }, { $set: { 'versions': versionData } }, { upsert: true, returnOriginal: false }, function(err, result) {
                if (err) throw err;
                // console.log("Responce after Saving_Version:", result.updatedExisting);
            });
            res.send(type);
        }
    });
});
//End of Mongo_Handler for saving the version details to the particular project Document

app.get('/test', function(req, res) {
    // var mongoName = 'adi';
    // var versionName = 'DBA';
    // var query = {};
    // var update = { '$unset': {} };
    // query['_id'] = mongoName;
    // update['$unset']['versions.' + versionName] = '';
    // console.log(query, update);
    // projects_db.collection('Project_Details').updateOne(query, update, function(err, doc) {
    //     if (err) throw err;
    //     // console.log("*********", doc);
    //     assert.equal(1, doc.result.nModified);
    // });

    test_db.collection('test_run_db').aggregate([{ $match: /** * query - The query in MQL. */ { _id: 'Demo' } }, { $project: /** * specifications - The fields to *   include or exclude. */ { 'Test_Run_Data.testplans': 1 } }, { $unwind: /** * path - Path to the array field. * includeArrayIndex - Optional name for index. * preserveNullAndEmptyArrays - Optional *   toggle to unwind null and empty values. */ { path: '$Test_Run_Data.testplans', } }, { $lookup: /** * from - The target collection. * localField - The local join field. * foreignField - The target join field. * as - The name for the results. */ { from: 'test_plan', localField: 'Test_Run_Data.testplans', foreignField: '_id', as: 'TC_List' } }, { $unwind: /** * path - Path to the array field. * includeArrayIndex - Optional name for index. * preserveNullAndEmptyArrays - Optional *   toggle to unwind null and empty values. */ { path: '$TC_List', } }, { $unwind: /** * path - Path to the array field. * includeArrayIndex - Optional name for index. * preserveNullAndEmptyArrays - Optional *   toggle to unwind null and empty values. */ { path: '$TC_List.Test_Plan_Data.testcases', } }, { $lookup: /** * from - The target collection. * localField - The local join field. * foreignField - The target join field. * as - The name for the results. */ { from: 'test_case', localField: 'TC_List.Test_Plan_Data.testcases', foreignField: '_id', as: 'TC_Details' } }, { $unwind: /** * path - Path to the array field. * includeArrayIndex - Optional name for index. * preserveNullAndEmptyArrays - Optional *   toggle to unwind null and empty values. */ { path: '$TC_Details', } }, { $project: /** * specifications - The fields to *   include or exclude. */ { '_id': 1, 'TC_List._id': 1, 'TC_Details': 1 } }], function(err, cur) {
        if (err) throw err;
        cur.toArray(function(errrr, documents) {
            if (errrr) throw errrr;
            console.log(documents);
        });
    });

});
// Added by sathish @23/04/2019
app.post('/executiontreeview',function(req,res){
    // console.log("@line901 ^^^_____________^^",projectdb);
    db_script.loadexecutionTree(test_db,projects_db,projectdb,function(executiontreeData,_testCaseMetaInfo){
        res.send([executiontreeData,_testCaseMetaInfo]);
    })
});


//Updated Version of Drag Handler Modified by Venkat @ 09 May 2019
app.post("/dragHandler", async (req,res)=>{
  var reqFrom = req.body.from;
  var ReqName = req.body.name;
  var _dragCases=req.body._cases

  if(_dragCases.length != 0){
    switch (reqFrom) {
      case "Project":
        let pro_suite = await projects_db
          .collection("Project_Details_Dolby")
          .findOne({ _id: ReqName });
        console.log("prO---->", pro_suite);
        let suite_names = pro_suite.testsuites;
        let project_details = [];
        for (let suite__name of suite_names) {
          try {
            await test_db
              .collection("test_suite")
              .aggregate(
                [
                  { $match:  {  _id: suite__name  } },  
                  { $unwind: {  path: "$Test_Suite_Data.testplans"} }, 
                  { $project: {  "planName":"$Test_Suite_Data.testplans",  } }, 
                  { $lookup: {  from: 'test_plan',  localField: 'planName',  foreignField: '_id',  as: 'projectDetails'} }, 
                  { $unwind: {  path: "$projectDetails"} }, 
                  { $project: {  "caseName":"$projectDetails.Test_Plan_Data.testcases",  "planName":"$projectDetails._id"} }, 
                  { $unwind: {  path: "$caseName"} }, { $match: {  "caseName":{"$in":_dragCases}} }, 
                  { $lookup: {  from: 'test_case_dolby',  localField: 'caseName',  foreignField: '_id',  as: 'caseDetails'} }, 
                  { $unwind: {  path: "$caseDetails",} }
                ],
                  async (err, doc) => {
                  if (err) throw err;
  
                  _suiteData = await doc.toArray();
                  console.log("***********",_suiteData.length)
                  _suiteData.forEach((doc)=>{
                    project_details.push(doc)
                  })
                  // project_details[suite__name] = _suiteData;
                }
              );
          } catch (error) {
            console.log("Error @@:->", error);
          }
        }
        // console.log("Project Details ********::->", project_details);
        res.send(project_details);
        break;
      case "Test_Suite":
       test_db
        .collection("test_suite")
        .aggregate(
       
          [
            { $match:  {  _id: ReqName  } },  
            { $unwind: {  path: "$Test_Suite_Data.testplans"} }, 
            { $project: {  "planName":"$Test_Suite_Data.testplans",  } }, 
            { $lookup: {  from: 'test_plan',  localField: 'planName',  foreignField: '_id',  as: 'projectDetails'} }, 
            { $unwind: {  path: "$projectDetails"} }, 
            { $project: {  "caseName":"$projectDetails.Test_Plan_Data.testcases",  "planName":"$projectDetails._id"} }, 
            { $unwind: {  path: "$caseName"} }, { $match: {  "caseName":{"$in":_dragCases}} }, 
            { $lookup: {  from: 'test_case_dolby',  localField: 'caseName',  foreignField: '_id',  as: 'caseDetails'} }, 
            { $unwind: {  path: "$caseDetails",} }],
          async (err, doc) => {
            if (err) throw err;
  
            let suite_details = await doc.toArray();

            // console.log("Suite Details ***********", suite_details);
            res.send(suite_details);
            // project_details[suite__name] = _suiteData;
          }
        );
        break;
      case "Test_Plan":
         test_db
           .collection("test_plan")
           .aggregate(
            [
              { $match: /** * query - The query in MQL. */{  '_id':ReqName} }, 
              { $unwind: {  path: "$Test_Plan_Data.testcases"  } }, 
              { $project: {  "caseName":"$Test_Plan_Data.testcases"} }, 
              { $lookup: {  from: 'test_case_dolby',  localField: 'caseName',  foreignField: '_id',  as: 'caseDetails'} }, 
              { $unwind: {  path: "$caseDetails",} }],
             async (err, doc) => {
               if (err) throw err;
               let plan_details = await doc.toArray();
            //    console.log("Plan Details ***********", plan_details);
               res.send(plan_details);
             }
           );
        break;
      case "Test_Case":
            test_db.collection("test_case_dolby").findOne({_id:ReqName},(err,doc)=>{
              if(err) throw err;
            //   console.log("Case Details **********",doc);
              res.send([doc]);
            })
            
        break;
      default:
        break;
    }
  }else{

  }
  // console.log("_Cases to Drag ", _dragCases)
  
})



//To get appropriate data respective to the on drag request and done BY VENKAT @ 03Apr2019..
// app.post("/dragHandler", async (req,res)=>{
//     var reqFrom = req.body.from;
//     var ReqName = req.body.name;
//     var _dragCases=req.body._cases
//     console.log("_Cases to Drag ", _dragCases)
//     switch (reqFrom) {
//       case "Project":
//         let pro_suite = await projects_db
//           .collection("Project_Details_Dolby")
//           .findOne({ _id: ReqName });
//         console.log("prO---->", pro_suite);
//         let suite_names = pro_suite.testsuites;
//         let project_details = [];
//         for (let suite__name of suite_names) {
//           try {
//             await test_db
//               .collection("test_suite")
//               .aggregate(
//                 [
//                   {
//                     $match: /** * query - The query in MQL. */ {
//                       _id: suite__name
//                     }
//                   },
//                   {
//                     $project: /** * specifications - The fields to *   include or exclude. */ {
//                       "Test_Suite_Data.testplans": 1
//                     }
//                   },
//                   {
//                     $unwind: /** * path - Path to the array field. * includeArrayIndex - Optional name for index. * preserveNullAndEmptyArrays - Optional *   toggle to unwind null and empty values. */ {
//                       path: "$Test_Suite_Data.testplans"
//                     }
//                   },
//                   {
//                     $lookup: /** * from - The target collection. * localField - The local join field. * foreignField - The target join field. * as - The name for the results. */ {
//                       from: "test_plan",
//                       localField: "Test_Suite_Data.testplans",
//                       foreignField: "_id",
//                       as: "_testplans"
//                     }
//                   },
//                   {
//                     $unwind: /** * path - Path to the array field. * includeArrayIndex - Optional name for index. * preserveNullAndEmptyArrays - Optional *   toggle to unwind null and empty values. */ {
//                       path: "$_testplans",
//                       includeArrayIndex: "_testplans[0]"
//                     }
//                   },
//                   {
//                     $unwind: /** * path - Path to the array field. * includeArrayIndex - Optional name for index. * preserveNullAndEmptyArrays - Optional *   toggle to unwind null and empty values. */ {
//                       path: "$_testplans.Test_Plan_Data.testcases"
//                     }
//                   },
//                   {
//                     $lookup: /** * from - The target collection. * localField - The local join field. * foreignField - The target join field. * as - The name for the results. */ {
//                       from: "test_case_dolby",
//                       localField:
//                         "_testplans.Test_Plan_Data.testcases",
//                       foreignField: "_id",
//                       as: "_testcase"
//                     }
//                   },
//                   {
//                     $unwind: /** * path - Path to the array field. * includeArrayIndex - Optional name for index. * preserveNullAndEmptyArrays - Optional *   toggle to unwind null and empty values. */ {
//                       path: "$_testcase",
//                       includeArrayIndex: "_testcase[0]"
//                     }
//                   },
//                   {
//                     $project: /** * specifications - The fields to *   include or exclude. */ {
//                       _id: 1,
//                       "Test_Suite_Data.testplans": 1,
//                       _testcase: 1
//                     }
//                   }
//                 ],
//                 async (err, doc) => {
//                   if (err) throw err;

//                   _suiteData = await doc.toArray();
//                   console.log("***********",_suiteData.length)
//                   _suiteData.forEach((doc)=>{
//                     project_details.push(doc)
//                   })
//                   // project_details[suite__name] = _suiteData;
//                 }
//               );
//           } catch (error) {
//             console.log("Error @@:->", error);
//           }
//         }
//         // console.log("Project Details::->", project_details);
//         res.send(project_details);
//         break;
//       case "Test_Suite":
//       await test_db
//         .collection("test_suite")
//         .aggregate(
//           [
//             {
//               $match: /** * query - The query in MQL. */ { _id: ReqName }
//             },
//             {
//               $project: /** * specifications - The fields to *   include or exclude. */ {
//                 "Test_Suite_Data.testplans": 1
//               }
//             },
//             {
//               $unwind: /** * path - Path to the array field. * includeArrayIndex - Optional name for index. * preserveNullAndEmptyArrays - Optional *   toggle to unwind null and empty values. */ {
//                 path: "$Test_Suite_Data.testplans"
//               }
//             },
//             {
//               $lookup: /** * from - The target collection. * localField - The local join field. * foreignField - The target join field. * as - The name for the results. */ {
//                 from: "test_plan",
//                 localField: "Test_Suite_Data.testplans",
//                 foreignField: "_id",
//                 as: "_testplans"
//               }
//             },
//             {
//               $unwind: /** * path - Path to the array field. * includeArrayIndex - Optional name for index. * preserveNullAndEmptyArrays - Optional *   toggle to unwind null and empty values. */ {
//                 path: "$_testplans",
//                 includeArrayIndex: "_testplans[0]"
//               }
//             },
//             {
//               $unwind: /** * path - Path to the array field. * includeArrayIndex - Optional name for index. * preserveNullAndEmptyArrays - Optional *   toggle to unwind null and empty values. */ {
//                 path: "$_testplans.Test_Plan_Data.testcases"
//               }
//             },
//             {
//               $lookup: /** * from - The target collection. * localField - The local join field. * foreignField - The target join field. * as - The name for the results. */ {
//                 from: "test_case_dolby",
//                 localField: "_testplans.Test_Plan_Data.testcases",
//                 foreignField: "_id",
//                 as: "_testcase"
//               }
//             },
//             {
//               $unwind: /** * path - Path to the array field. * includeArrayIndex - Optional name for index. * preserveNullAndEmptyArrays - Optional *   toggle to unwind null and empty values. */ {
//                 path: "$_testcase",
//                 includeArrayIndex: "_testcase[0]"
//               }
//             },
//             {
//               $project: /** * specifications - The fields to *   include or exclude. */ {
//                 _id: 1,
//                 "Test_Suite_Data.testplans": 1,
//                 _testcase: 1
//               }
//             }
//           ],
//           async (err, doc) => {
//             if (err) throw err;

//             let suite_details = await doc.toArray();
//             console.log("***********", suite_details);
//             res.send(suite_details);
//             // project_details[suite__name] = _suiteData;
//           }
//         );
//         break;
//       case "Test_Plan":
//          test_db
//            .collection("test_plan")
//            .aggregate(
//              [
//                {
//                  $match: /** * query - The query in MQL. */ {
//                    _id: ReqName
//                  }
//                },
//                {
//                  $project: /** * specifications - The fields to *   include or exclude. */ {
//                    _id: 1,
//                    "Test_Plan_Data.testcases": 1
//                  }
//                },
//                {
//                  $unwind: /** * path - Path to the array field. * includeArrayIndex - Optional name for index. * preserveNullAndEmptyArrays - Optional *   toggle to unwind null and empty values. */ {
//                    path: "$Test_Plan_Data.testcases"
//                  }
//                },
//                {
//                  $lookup: /** * from - The target collection. * localField - The local join field. * foreignField - The target join field. * as - The name for the results. */ {
//                    from: "test_case_dolby",
//                    localField: "Test_Plan_Data.testcases",
//                    foreignField: "_id",
//                    as: "_testcases"
//                  }
//                },
//                {
//                  $unwind: /** * path - Path to the array field. * includeArrayIndex - Optional name for index. * preserveNullAndEmptyArrays - Optional *   toggle to unwind null and empty values. */ {
//                    path: "$_testcases"
//                  }
//                },
//                {
//                  $project: /** * specifications - The fields to *   include or exclude. */ {
//                    _id: 1,
//                    _testcases: 1
//                  }
//                }
//              ],
//              async (err, doc) => {
//                if (err) throw err;
//                let plan_details = await doc.toArray();
//                console.log("Plan Details ***********", plan_details);
//                res.send(plan_details);
//              }
//            );
//         break;
//       case "Test_Case":
//             test_db.collection("test_case_dolby").findOne({_id:ReqName},(err,doc)=>{
//               if(err) throw err;
//               console.log("Case__doc &**********",doc);
//               res.send([doc]);
//             })
            
//         break;
//       default:
//         break;
//     }
// })
// Added ny Magesh @24/04/2019 for retriving data such as Tsuites,Tplans,TCases from mongodb
app.post('/getSuites',function(req,res){
    // console.log("get suites of",req.body);
    projects_db.collection('Project_Details_Dolby').findOne({_id : req.body.name},function(err,result){
        if(err){console.log("error coming *** ",err);}
        var suitelist = result.testsuites.filter(el=>el!==null);
        test_db.collection('test_suite').find({"_id":{"$in":suitelist}}).toArray((err,doc)=>{
            if(err) throw err;
            // console.log("DOc::->",doc)
            res.send(doc);
        })
        // res.send(suitelist);
    })
});
app.post('/getPlans',function(req,res){
    // console.log("get plans of",req.body.name);
    test_db.collection('test_suite').findOne({_id : req.body.name},function(err,result){
        if(err){console.log("error coming *** ",err);}
        // console.log("suite details_____________",result.Test_Suite_Data.testplans);
        planlist = result.Test_Suite_Data.testplans;
        test_db.collection('test_plan').find({"_id":{"$in":planlist}}).toArray((err,doc)=>{
            if(err) throw err;
            console.log("plan DOc::->",doc)
            res.send(doc);
        })
        // res.send(suitelist);
    })
});
app.post('/getCases',function(req,res){
    // console.log("get cases of",req.body.name);
    test_db.collection('test_plan').findOne({_id : req.body.name},function(err,result){
        if(err){console.log("error coming *** ",err);}
        // console.log("plan details_____________",result.Test_Plan_Data.testcases);
        caselist = result.Test_Plan_Data.testcases;
        test_db.collection('test_case_dolby').find({"_id":{"$in":caselist}}).toArray((err,doc)=>{
            if(err) throw err;
            console.log("cases DOc::->",doc)
            res.send(doc);
        })
        // res.send(suitelist);
    })
});
app.post('/getCaseDetail',function(req,res){
    console.log("Get Details of case__",req.body.name);
    test_db.collection('test_case_dolby').findOne({_id : req.body.name},function(err,result){
        if(err)throw err;
        console.log("case Details___________-___",result);
        res.send(result)
    });
});
// Drag and drop aggregation done by Venkat @ 02May2019
app.post("/Practice", (req, res) => {
  // projects_db.collection('Project_Details_Dolby').aggregate([{$match:{_i        d:'adi'}},{$project:{'testcases':1}}],(err,doc)=>{
  // if(err) throw err;
  // doc.toArray((err,d)=>{
  // if(err) throw err
  // console.log("Docs in the Practice::=>",d[0].testcases)
  // })

  // })
  console.log("___Request___",req.body);
  var ReqFrom = req.body.from;
  var ReqName = req.body.name;
  switch (ReqFrom) {
    case "project":
      let caseNames = [];
      projects_db
        .collection("Project_Details_Dolby")
        .aggregate(
          [{ $match: { _id: ReqName } }, { $project: { testcases: 1 } }],
          (err, doc) => {
            let details_array = [];
            if (err) throw err;
            doc.toArray((err, d) => {
              if (err) throw err;
              console.log("Docs in the Practice::=>", d[0]);
              caseNames = d[0];
              var case_details = [];

              function loop(i) {
                if (i < caseNames.testcases.length) {
                  test_db
                    .collection("test_case_dolby")
                    .findOne({ _id: caseNames.testcases[i] }, (err, doc) => {
                      if (err) throw err;
                      console.log("caseDetails", doc);
                      if (doc !== null) {
                        details_array.push(doc);
                      }
                      loop(i + 1);
                    });
                } else {
                  console.log("TestCases:->", details_array);
                  res.send(details_array);
                }
              }
              loop(0);

              // d[0].testcases.forEach(TestCase=>{
              // console.log("Test_case:=>",TestCase)
              // test_db.collection('test_case').findOne({_i        d:TestCase},(err,doc)=>{
              // if(err) throw err
              // console.log("Doc",doc)
              // })

              // // .toArray((e,d)=>{
              // // if(e) throw e
              // // console.log("Test_case_Details:=>",d)
              // // case_details.push(d[0])
              // // console.log("Test_case_Details:=>",case_details)
              // // })

              // })

              // let caseLength=d[0].testcases.length-1
              // for (let Case of d[0].testcases){
              // // console.log("CaseLength and I Value",i,caseLength)
              // test_db.collection('test_case').findOne({_i        d:Case},(err,doc)=>{
              // if(err) throw err
              // console.log("Doc",doc)
              // details_array.push(doc)

              // })

              // }
              // console.log("Total Details:->",details_array)
            });
          }
        );

      break;
    case "test_suite":
      let data_testSuite = test_db
        .collection("test_suite")
        .aggregate([
          { $match: /** * query - The query in MQL. */ { _id: ReqName } },
          {
            $project: /** * specifications - The fields to * include or exclude. */ {
              "Test_Suite_Data.testcases": 1
            }
          },
          {
            $unwind: /** * path - Path to the array field. * includeArrayIndex - Optional name for index. * preserveNullAndEmptyArrays - Optional * toggle to unwind null and empty values. */ {
              path: "$Test_Suite_Data.testcases"
            }
          },
          {
            $lookup: /** * from - The target collection. * localField - The local join field. * foreignField - The target join field. * as - The name for the results. */ {
              from: "test_case_dolby",
              localField: "Test_Suite_Data.testcases",
              foreignField: "_id",
              as: "Test_Case_Data"
            }
          },
          {
            $project: /** * specifications - The fields to * include or exclude. */ {
              Test_Case_Data: 1
            }
          }
        ]);

        data_testSuite.toArray((err, data) => {
        if (err) throw err;
        console.log("Data in the Test Suite:->", data);
        res.send(data);
      });
      break;
    case "test_plan":
      let dat_testPlan = test_db
        .collection("test_plan")
        .aggregate([
          { $match: /** * query - The query in MQL. */ { _id: ReqName } },
          {
            $project: /** * specifications - The fields to * include or exclude. */ {
              "Test_Plan_Data.testcases": 1
            }
          },
          {
            $unwind: /** * path - Path to the array field. * includeArrayIndex - Optional name for index. * preserveNullAndEmptyArrays - Optional * toggle to unwind null and empty values. */ {
              path: "$Test_Plan_Data.testcases"
            }
          },
          {
            $lookup: /** * from - The target collection. * localField - The local join field. * foreignField - The target join field. * as - The name for the results. */ {
              from: "test_case_dolby",
              localField: "Test_Plan_Data.testcases",
              foreignField: "_id",
              as: "Test_Case_Data"
            }
          },
          {
            $project: /** * specifications - The fields to * include or exclude. */ {
              Test_Case_Data: 1
            }
          }
        ]);
        
        dat_testPlan.toArray((err, data) => {
        if (err) throw err;
        // console.log("Data in the test plan", data);
       
        res.send(data);
      });
      break;
    case "test_case":
      test_db.collection("test_case_dolby").findOne({ _id: ReqName }, (err, doc) => {
        if (err) throw err;
        console.log("Data from the case", doc);
        // var temp = new Array(JSON.stringify(doc));
        res.send(doc);
      });
      break;
    default:
      break;
  }
});


app.post("/getErrorLog",(req,res)=>{
  console.log("Request Data::->",req.body.outputType,req.body.caseName)
  let type_=req.body.outputType.length
  let caseName_=req.body.caseName
  console.log(type_)
  
  // Common Work Path
  let loc_="D:/Dolby/kit/Dolby_Digital_Plus_Decoder_Imp/Test_Tools/work"
  // let data_=fs.readFileSync(loc_,"utf8")
  //     console.log("Data_",data_)
  //     res.send(data_)


  console.log("Data",type_ == 15)
  if(type_ == 15){
      loc_=loc_+"/"+req.body.caseName+"/"+"stdout.txt"
      // loc_=loc_.concat('/',req.body.caseName)
      fs.stat(loc_,(err,sta)=>{
        if(err){
         
          res.send(["No standerd output log found in the directory",req.body.outputType])
        }else{
          let data_=fs.readFileSync(loc_,"utf8")
          console.log("Data_",data_)
          res.send([data_,req.body.outputType])
        }
        
      })
      // loc_=loc_.concat('/','standard_out.txt')     

      
  }else if(type_ === 14){
    loc_=loc_+"/"+req.body.caseName+"/"+"stderr.txt"
     
    fs.stat(loc_,(err,sta)=>{
      if(err){
        res.send(["No standerd error log found in the directory ",req.body.outputType])
      }else{
        console.log("Final path",loc_)
        let data_=fs.readFileSync(loc_,"utf8")
        console.log("Data_",data_)
        res.send([data_,req.body.outputType])
      }
    })
    
  } 

})

app.get('/getTestConfig',(req,res)=>{
    projects_db.collection('Project_Config').find({}).toArray((err,doc)=>{
        if(err) throw err;

        console.log("Proget COnfig Data::->",doc);
        res.send(doc)
    })
})


app.post('/saveConfig',(req,res)=>{
    
    // console.log("Data in the DB",req.body.data);
    var update = { '$set': req.body.data };
    projects_db.collection('Project_Config').updateOne({'_id':req.body._id},update,{upsert:true},(err,doc)=>{
        if(err){
            console.log("Error in Inserting Config Data::->",err)
        }else{
            // console.log("Data Inserted",doc);
            res.send("Inserted")
            
        }
    })
})

app.post('/deleteConfig',(req,res)=>{
    console.log("Config to be Deleted ::->",req.body._id);
    
    projects_db.collection('Project_Config').deleteOne({'_id':req.body._id},(err,doc)=>{
        if(err){
            console.log("Error in Deleting the Config..");
        }else{
            console.log("Deleted Data",doc.result)
            // console.log("Config Deleted");
            res.send("Deleted")
        }
    })
})




// This is the handler for the test execution details
app.get('/getTestExeDetails',(req,res)=>{
        projects_db.collection("Test_Execution_Config").findOne({_id:"test_exe_config"},(err,doc)=>{
            if(err) throw err;
            res.send(doc)
        })
})

app.post('/saveTE',(req,res)=>{
    projects_db.collection("Test_Execution_Config").findOneAndUpdate({_id:"test_exe_config"},{'$set':req.body.setData},{upsert:true, returnOriginal : false },(err,doc)=>{
        if(err) throw err;
        // console.log("Data Updated::->",doc)
        res.send(['Updated',doc.value])
    })
})






// app.get("/insertTest",(req,res)=>{
//     test_db.collection('ids').insertOne({_id:"test_plan","krishna":"chennai"},(err,doc)=>{
//         if(err){
//             console.log("err:->",err.code)
//         }
//         console.log("dic::->",doc);
//     })
// })

// route for handling 404 requests(unavailable routes)
app.use(function(req, res, next) {
    path = dirpath.join(__dirname + '/Source/elements/404page.html');
    res.sendFile(path);
    res.status(404).sendFile(path);
});

//Port Accessing ..
// app.listen(port, function() {
//     console.log("App running on port", port);
// });
