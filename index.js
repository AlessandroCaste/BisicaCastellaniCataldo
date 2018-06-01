/////////////////////////////////////////////
////////////////// REQUIRES /////////////////
/////////////////////////////////////////////


const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const sqlDbFactory = require("knex");
const _ = require("lodash");
const process = require("process");
const nodemailer = require("nodemailer");


////////////////////////////////////////////////
////////////////// INIT DB /////////////////////
////////////////////////////////////////////////

// get json files that contains data to populate db
let peopleList = require("./other/people.json");
let locationsList = require("./other/locations.json");
let servicesList = require("./other/services.json");


// use it until testing
process.env.TEST = true;

let sqlDb;

/////////////////////////////////////////////////////


// Locally we should launch the app with TEST=true to use SQLlite
// on Heroku TEST is default at false, so PostGres is used
function initSqlDB() {
    // if I'm testing the application
    if (process.env.TEST) {
        console.log("test mode");
        sqlDb = sqlDbFactory({
            debug: true,
            client: "sqlite3",
            connection: {
                filename: "./other/bccdb.sqlite"
            }
        });
        // actual version of the db
    } else {
        console.log("non-test mode");
        sqlDb = sqlDbFactory({
            debug: true,
            client: "pg",
            connection: process.env.DATABASE_URL,
            ssl: true
        });
    }
}


function initPeopleTable() {
    return sqlDb.schema.hasTable("people").then(exists => {
        if (!exists) {
            sqlDb.schema
                .createTable("people", table => {
                    // create the table
                    table.increments("id").primary();
                    table.string("name");
                    table.string("surname");
                    table.string("picture");
                    table.string("profession");
                    table.text("bio");
                    table.string("quote");
                    table.string("servicesId");
                })
                .then(() => {
                    return Promise.all(
                        _.map(peopleList, p => {
                            // insert the row
                            // delete p.basicInfo;
                            return sqlDb("people").insert(p).catch(function(err) {
                                console.log("Error in people extraction");
                                console.log(err);
                                // console.log(err);
                            });
                        })
                    );
                });
        } else {
            return true;
        }
    });
}



function initLocationsTable() {
    return sqlDb.schema.hasTable("locations").then(exists => {
        if (!exists) {
            sqlDb.schema
                .createTable("locations", table => {
                    // create the table
                    table.increments("id").primary();
                    table.string("name");
                    table.string("region");
                    table.string("city");
                    table.string("address");
                    table.string("CAP");
                    table.string("coordinates");
                    table.string("phone");
                    table.string("mail");
                    table.string("quote");
                    table.text("overview");
                    table.string("pictures");
                })
                .then(() => {
                    return Promise.all(
                        _.map(locationsList, p => {
                            // insert the row
                            return sqlDb("locations").insert(p);
                        })
                    );
                });
        } else {
            return true;
        }
    });
}


function initServicesTable() {
    return sqlDb.schema.hasTable("services").then(exists => {
        if (!exists) {
            sqlDb.schema
                .createTable("services", table => {
                    // create the table
                    table.increments("id").primary();
                    table.string("name");
                    table.string("typology");
                    table.string("picture");
                    table.text("overview");
                })
                .then(() => {
                    return Promise.all(
                        _.map(servicesList, p => {
                            // insert the row
                            return sqlDb("services").insert(p);
                        })
                    );
                });
        } else {
            return true;
        }
    });
}


// for each table required, check if already existing
// if not, create and populate
function initDb() {
    initPeopleTable();
    initLocationsTable();
    initServicesTable();

    return true;
}

/////////////////////////////////////////////
////////////////// APP.USE //////////////////
/////////////////////////////////////////////

app.use(express.static(__dirname + "/public"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Register REST entry points

/////////////////////////////////////////////
////////////////// APP.GET //////////////////
/////////////////////////////////////////////


// Name of the tables are:
// people
// locations
// services


// retrieve data about all the doctors
// result returned as a JSON array
app.get("/people", function(req, res) {
    let myQuery = sqlDb("people").orderByRaw('surname, name')
        .then(result => {
            res.send(JSON.stringify(result));
        })
})

// given a doctor id, retrieve all data about that doctor
// result returned as a JSON array with a single element
app.get("/people/:id", function(req, res) {
    let myQuery = sqlDb("people");
    myQuery.where("id", req.params.id)
        .then(result => {
            res.send(JSON.stringify(result));
        })
})

// retrieve data about all the locations
// result returned as a JSON array
app.get("/locations", function(req, res) {
    let myQuery = sqlDb("locations")
        .then(result => {
            res.send(JSON.stringify(result));
        })
})

// given a location id, retrieve all data about that location
// result returned as a JSON array with a single element
app.get("/locations/:id", function(req, res) {
    let myQuery = sqlDb("locations");
    myQuery.where("id", req.params.id)
        .then(result => {
            res.send(JSON.stringify(result));
        })
})

// retrieve data about all the services
// result returned as a JSON array
app.get("/services", function(req, res) {
    let myQuery = sqlDb("services")
        .then(result => {
            res.send(JSON.stringify(result));
        })
})

// given a service id, retrieve all data about that service
// result returned as a JSON array with a single element
app.get("/services/:id", function(req, res) {
    let myQuery = sqlDb("services");
    myQuery.where("id", req.params.id)
        .then(result => {
            res.send(JSON.stringify(result));
        })
})


// given a service id, retrieve data of the doctors working in it
// result returned as a JSON array
app.get("/doctorsbyservice/:id", function(req, res) {
    let myQuery = sqlDb("doctors");
    myQuery.select().where("serviceId", req.params.id)
        .then(result => {
            res.send(JSON.stringify(result));
        })
})


// given a location id, retrieve data of the services located in that location
// result returned as a JSON array
app.get("/servicesbylocation/:id", function(req, res) {
    let myQuery = sqlDb.select().from("services").whereIn("id", function() {
            this.select("serviceId").from("servicesLocations").where("locationId", req.params.id);
        })
        .then(result => {
            res.send(JSON.stringify(result));
        })
})


// given a service id, retrieve data of the locations in which that service exists
// result returned as a JSON array
app.get("/locationsbyservice/:id", function(req, res) {
    let myQuery = sqlDb.select().from("locations").whereIn("id", function() {
            this.select("locationId").from("servicesLocations").where("serviceId", req.params.id);
        })
        .then(result => {
            res.send(JSON.stringify(result));
        })
})

/////////////////////////////////////////////
///////////////// APP.POST //////////////////
/////////////////////////////////////////////

/*  Form data handling. Given the following data:
 *      - name: writer's name
 *      - mail: writer's mail
 *      - subject: subject of the inquery
 *      - message: writer's message
 *
 *      an email will be sent to the writer's mail
 */
app.post('/contactForm', function(req, res) {

    var smtpConfig = {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // use SSL
        auth: {
            user: 'clinic.pms@gmail.com',
            pass: 'megliosucochemaleaccompagnato'
        }
    };
    var transporter = nodemailer.createTransport(smtpConfig);

    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: '"' + req.body.name + '" <clinic.pms@gmail.com>', // sender address
        to: req.body.mail, // list of receivers
        subject: req.body.subject, // Subject line
        html: '<p>Message: ' + req.body.message + '</p>' // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
    });

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('thanks');
});


/////////////////////////////////////////////
/////////////////// INIT ////////////////////
/////////////////////////////////////////////

// instantiate the app

let serverPort = process.env.PORT || 5000;
app.set("port", serverPort);

initSqlDB();
initDb();

/* Start the server on port 3000 */
app.listen(serverPort, function() {
    console.log(`Your app is ready at port ${serverPort}`);
});
