/////////////////////////////////////////////
////////////////// REQUIRES /////////////////
/////////////////////////////////////////////


const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const sqlDbFactory = require("knex");
const _ = require("lodash");
const process = require("process");


////////////////////////////////////////////////
////////////////// INIT DB /////////////////////
////////////////////////////////////////////////

// get json files that contains data to populate db
let peopleList = require("./other/people.json");
let locationsList = require("./other/locations.json");
let servicesList = require("./other/services.json");
let servicesLocationsList = require("./other/serviceslocations.json");
let servicesPeopleList = require("./other/servicespeople.json");
let locationSlideList = require("./other/locationslide.json");
let whoweareList = require("./other/whoweare.json");

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

function initWhoweareTable(){
        return sqlDb.schema.hasTable("whoweare").then(exists => {
            if (!exists) {
                sqlDb.schema
                    .createTable("whoweare", table => {
                        // create the table
                        table.string("picture");
                        table.string("text");
                        table.string("quote");
                        table.string("quoteAuthor");
                    })
                    .then(() => {
                        return Promise.all(
                            _.map(whoweareList, p => {
                                // insert the row
                                // delete p.basicInfo;
                                return sqlDb("whoweare").insert(p).catch(function(err) {
                                    console.log("Error in whoweare extraction");
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
};


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
                    table.string("picture");
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

function initServicesLocationsTable() {
    return sqlDb.schema.hasTable("serviceslocations").then(exists => {
        if (!exists) {
            sqlDb.schema
                .createTable("serviceslocations", table => {
                    // create the table
                    table.integer("serviceId");
                    table.integer("locationId");
                })
                .then(() => {
                    return Promise.all(
                        _.map(servicesLocationsList, p => {
                            // insert the row
                            return sqlDb("serviceslocations").insert(p);
                        })
                    );
                });
        } else {
            return true;
        }
    });
}

function initServicesPeopleTable() {
    return sqlDb.schema.hasTable("servicespeople").then(exists => {
        if (!exists) {
            sqlDb.schema
                .createTable("servicespeople", table => {
                    // create the table
                    table.integer("serviceId");
                    table.integer("personId");
                })
                .then(() => {
                    return Promise.all(
                        _.map(servicesPeopleList, p => {
                            // insert the row
                            return sqlDb("servicespeople").insert(p);
                        })
                    );
                });
        } else {
            return true;
        }
    });
}


function initlocationSlideTable(){    
    return sqlDb.schema.hasTable("locationSlide").then(exists =>{
        if(!exists){
            sqlDb.schema
                .createTable("locationSlide",table => {
                    //create the table
                    table.string("name");
                    table.string("header");
                    table.string("description");
                    table.string("source");
                })
                .then(()=>{
                    return Promise.all(
                        _.map(locationSlideList, p=> {
                            return sqlDb("locationSlide").insert(p);
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
    initServicesLocationsTable();
    initServicesPeopleTable();
    initlocationSlideTable();
    initWhoweareTable();
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
// servicesLocations
// servicesPeople
// locationSlide
// whoweare
// All data is returned in JSON format


////////////////// PEOPLE //////////////////

// Return data about workers

app.get("/people", function(req, res) {
    let myQuery = sqlDb("people").orderByRaw('surname, name')
        .then(result => {
            res.send(JSON.stringify(result));
        })
})

// Return data about workers ordered by surname and  name

app.get("/people?sort=desc", function(req, res) {
    let myQuery = sqlDb("people").orderByRaw('surname, name')
        .then(result => {
            res.send(JSON.stringify(result));
        })
})

// Returns data about a specific worker based on her id 

app.get("/people/:id", function(req, res) {
    let myQuery = sqlDb("people");
    myQuery.where("id", req.params.id)
        .then(result => {
            res.send(JSON.stringify(result));
        })
})

// Return a worker's services given its id

app.get("/people/:id/services", function(req, res) {
    let myQuery = sqlDb("servicesPeople");
    myQuery.select().where("personId", req.params.id).innerJoin("services","servicesPeople.serviceId","services.id")
        .then(result => {
            res.send(JSON.stringify(result));
        })
})

////////////////// LOCATIONS //////////////////

// Returns general data about locations. Used for preview thumbnails 

app.get("/locations", function(req, res) {
    let myQuery = sqlDb("locations");
    myQuery.select('id','name','region','city','address','phone','mail','picture')
        .then(result => {
            res.send(JSON.stringify(result));
        })
})

// Return data about a specific location based on its id 

app.get("/locations/:id", function(req, res) {
    let myQuery = sqlDb("locations");
    myQuery.where("id", req.params.id)
        .then(result => {
            res.send(JSON.stringify(result));
        })
})

// Return a locations carousel data given its id

app.get("/locations/:id/Slide", function(req, res) {
    let myQuery = sqlDb("locations");
    myQuery.select('locationSlide.name','header','description','source').where("id", req.params.id).innerJoin("locationSlide","locations.name","locationSlide.name")
        .then(result => {
            res.send(JSON.stringify(result));
            console.log(JSON.stringify(result));
        })
})

// Return a locations services given its id

app.get("/locations/:id/services", function(req, res) {
    let myQuery = sqlDb("servicesLocations");
    myQuery.select().where("locationId", req.params.id).innerJoin("services","servicesLocations.serviceId","services.id")
        .then(result => {
            res.send(JSON.stringify(result));
        })
})

////////////////// SERVICES //////////////////

// Return data about services 

app.get("/services", function(req, res) {
    let myQuery = sqlDb("services")
        .then(result => {
            res.send(JSON.stringify(result));
        })
})

// Return data about a specific service based on its id 

app.get("/services/:id", function(req, res) {
    let myQuery = sqlDb("services");
    myQuery.where("id", req.params.id)
        .then(result => {
            res.send(JSON.stringify(result));
        })
})

// Return workers' data by service given a service id

app.get("/services/:id/people", function(req, res) {
    let myQuery = sqlDb("servicespeople");
    myQuery.select().where("serviceId", req.params.id).innerJoin("people","servicespeople.personId","people.id")
        .then(result => {
            res.send(JSON.stringify(result));
        })
})


// Return a locations data given service id

app.get("/services/:id/locations", function(req, res) {
    let myQuery = sqlDb("serviceslocations");
    myQuery.select().where("serviceId", req.params.id).innerJoin("locations","serviceslocations.locationId","locations.id")
        .then(result => {
            res.send(JSON.stringify(result));
        })
})

////////////////// WHOWEARE //////////////////

// Return all info required for the page whoweare
app.get("/whoweare", function(req, res) {
    let myQuery = sqlDb("whoweare")
        .then(result => {
            res.send(JSON.stringify(result));
        })
})

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
