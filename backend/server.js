// load required modules

var express=require('express');
var cors = require('cors');
var bodyParser=require('body-parser');
var app = express();
const md5 = require('spark-md5');
const { IamAuthenticator } = require('ibm-cloud-sdk-core');
const { CloudantV1 } = require('@ibm-cloud/cloudant');
const { json } = require('body-parser');
// load local .env if present
require("dotenv").config();

// enable parsing of http request body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());

let cloudant_apikey,cloudant_url;

let cors_config={
  origin: "*",
  methods: "GET,POST",
  preflightContinue: false,
  optionsSuccessStatus: 204
}
// extract the Cloudant API key and URL from the credentials
// !!! note the lower case service name !!!
if(process.env.CE_SERVICES) {
  ce_services=JSON.parse(process.env.CE_SERVICES);
  cloudant_apikey=ce_services['cloudantnosqldb'][0].credentials.apikey;
  cloudant_url=ce_services['cloudantnosqldb'][0].credentials.url;
}
// allow overwriting of Cloudant setup or to specify using environment variables
if (process.env.CLOUDANT_URL) {
  cloudant_url=process.env.CLOUDANT_URL;
}
if (process.env.CLOUDANT_APIKEY) {
  cloudant_apikey=process.env.CLOUDANT_APIKEY;
}

// to overwrite the origin for testing
if (process.env.CORS_ORIGIN) {
  cors_config.origin=process.env.CORS_ORIGIN;
}



// establish IAM-based authentication
const authenticator = new IamAuthenticator({
  apikey: cloudant_apikey,
});

// create a new client
const cloudantClient = CloudantV1.newInstance({authenticator: authenticator, serviceUrl: cloudant_url});


// no idea what stuff above this does


// set the database name
const DB_NAME = 'posts';

// create mydb database if it does not already exist
// cloudantClient.putDatabase({ db: DB_NAME })
//     .then(data => {
//       console.log(DB_NAME + ' database created');
//     })
//     .catch(error => {
//       // ignore if database already exists
//       if (error.status === 412) {
//         console.log(DB_NAME + ' database already exists');
//       } else {
//         console.log('Error occurred when creating ' + DB_NAME +
//         ' database', error.error);
//       }
// });


// add a new post
app.post("/posts", cors(cors_config), function (req, res, next) {

    // check number of posts
    var spaceForPost = false;
  
    await cloudantClient.postAllDocs({
        db: DB_NAME,
        includeDocs: true,
        
    }).then(allPosts => {
        if (allPosts.result.rows.length < 10)
            spaceForPost = true;
    });

    if (!spaceForPost)
        return;

    // REGEX away html tags, then add breaks
    req.body.message = req.body.message.replace(/(<([^>]+)>)/ig, '').replaceAll("\n", "<br>");

    // if resulting string is empty, don't post
    if (req.body.message === '')
        return;
    
    let entry = {
        unixTimestamp: Date.now(),
        message:       req.body.message
    };
    
    return cloudantClient.postDocument({
        db: DB_NAME,
        document: entry
        
    }).then(addedEntry => {
        return res.status(201).json({
            _id:           addedEntry.id,
            unixTimestamp: addedEntry.unixTimestamp,
            message:       addedEntry.message
        });

    }).catch(error => {
        return res.status(500).json({
            message: 'Add post failed.',
            error:   error
        });
    });
});


// retrieve the existing posts
app.get("/posts", cors(cors_config), function (req, res, next) {
    return cloudantClient.postAllDocs({
        db: DB_NAME,
        includeDocs: true,
        
    }).then(allPosts => {
        let entries = { entries: allPosts.result.rows.map((row) => { return {
            unixTimestamp: row.doc.unixTimestamp,
            message:       row.doc.message
        }})};
        return res.json(entries);
        
    }).catch(error => {
        return res.status(500).json({
            message: 'Get posts failed.',
            error: error
        });
    });
});

app.get('/', (req, res) => { res.send('healthy') })

//serve static file (index.html, js, css)
//app.use(express.static(__dirname + '/views'));

var port = process.env.PORT || 8080
app.listen(port, function() {
    console.log("To view your app, open this link in your browser: http://localhost:" + port);
});
