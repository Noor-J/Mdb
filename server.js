//Create express app
const express = require('express');
let app = express();
var bodyParser = require('body-parser');
const session = require('express-session')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(session({ secret: 'qwertyuiop'}))
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));


//Database variables
let mongo = require('mongodb');
let MongoClient = mongo.MongoClient;
let db;

//View engine
app.set("view engine", "pug");

app.get("/", sendIndex);

app.get("/advancedSearch",(req, res, next)=>{
	res.render("advancedSearch", { loggedin: req.session.loggedin,  username: req.session.username } );
});

app.get("/contribute",(req, res, next)=>{
	res.render("contribute",{ loggedin: req.session.loggedin,  username: req.session.username });
});

// GET request for profile rendering profile page using specified template
app.get("/profile",(req, res, next)=>{
	if(req.session.loggedin){
		let query={}
		query.username=req.session.username
		db.collection("reviews").find(query).toArray((err,data)=>{
			if(err){
				throw err
			}
			db.collection("users").find(query).toArray((err1,data1)=>{
				if(err1){
					throw err1
				}
				// Rendering the page with the following values
				res.render("profile",{
					loggedin: req.session.loggedin, 
					username: req.session.username, 
					reviews: data, 
					watchList: Object.values(data1&&data1[0]&&data1[0].watchList||{}),
					followedUsers: Object.values(data1&&data1[0]&&data1[0].followedUsers||{}),
					notifications: data1&&data1[0]&&data1[0].notifications || [],
					followedPeople: Object.values(data1&&data1[0]&&data1[0].followedPeople || {})
				});
			})
		})	
	}
	else{
		res.status(401).send("Unauthorized")
	}
});

app.get("/loginOrSignup",(req, res, next)=>{
	if(req.session.loggedin){
		res.redirect("/profile");
		return;
	}
	res.render("loginOrSignup");
});
// Signup POST request
app.post("/signup",(req, res, next)=>{
	if(req.session.loggedin){
		res.status(200).send("Already logged in.");
		return;
	}
	let query={}
	query.username = req.body.username;
	query.password = req.body.password;
	db.collection("users").find({ username: query.username }).limit(1).toArray((err,data)=>{
		if(err){
			throw err
		}
		if(!data||data.length==0){
			db.collection("users").insertOne(query).then(result => { res.send({ message: "Signed Up Successfully", error: 0  }); req.session.loggedin=true; req.session.username=query.username; 
				console.log(`Successfully inserted item with _id: ${result.insertedId}`
			)} )
			.catch(err => console.error(`Failed to insert item: ${err}`))
		}
		else{
			res.send({ message: "User already Exists", error: 1  })
			res.end()
		}
		console.log(data)
		res.status(200)
	})
});


// Login POST request
app.post("/login",(req, res, next)=>{
	if(req.session.loggedin){
		res.status(200).send("Already logged in.");
		return;
	}
	let query={}
	query.username = req.body.username;
	query.password = req.body.password;
	db.collection("users").find({ username: query.username }).limit(1).toArray((err,data)=>{
		if(err){
			throw err
		}
		if(data&&data.length>0){
			if(data[0].password==query.password  ){
				req.session.loggedin=true
				req.session.username=query.username
				req.session.followedUsers=data && data[0] && data[0].followedUsers
				req.session.followedPeople=data && data[0] && data[0].followedPeople || {}
				res.send({ message: "Logged In Successfully as '"+ query.username +"'", error: 0  })
				res.end()
			}
			else{
				res.send({ message: "Username or password incorrect", error: 1  })
				res.end()
			}
		}
		else{
			res.send({ message: "Username or password incorrect", error: 1  })
			res.end()
		}
	})
});

// Logout request using GET method

app.get("/logout",(req, res, next)=>{
	req.session.loggedin=false
	req.session.username=null
	res.send({ message: "Logged Out", error: 0  })
	res.end()
});

let movieData = require("./movie-data-2500.json");
let movies = {}; //Stores all of the movies, key=id
movieData.forEach(movie => {
	movies[movie.Title] = movie;
});


const fs = require("fs");
const { resolveSoa } = require('dns');

app.get('/client.js', function (request, response,error) { //if/client.js is requested
	fs.readFile("client.js", function(err, data){
		if(err){
			response.statusCode = 500; //error
			response.end("Error reading file.");
			return;
		}
		response.statusCode = 200;//else
		response.setHeader("Content-Type", "application/javascript"); 
		response.end(data);
	});
})

app.get('/index.css', function (request, response,error) { //if/client.js is requested
	fs.readFile("index.css", function(err, data){
		if(err){
			response.statusCode = 500; //error
			response.end("Error reading file.");
			return;
		}
		response.statusCode = 200;//else
		response.setHeader("Content-Type", "text/css"); 
		response.end(data);
	});
})

app.get('/movie.css', function (request, response,error) { //if/client.js is requested
	fs.readFile("movie.css", function(err, data){
		if(err){
			response.statusCode = 500; //error
			response.end("Error reading file.");
			return;
		}
		response.statusCode = 200;//else
		response.setHeader("Content-Type", "text/css"); 
		response.end(data);
	});
})

app.get('/movies', function (request, response,error) { //homepage
	let query={}
	if(request.query.Title){
		query.Title= { $regex: request.query.Title, $options:'i' }
	}
	db.collection("movies").find(query).toArray((err,data)=>{
		if(err){
			throw err
		}
		data = { "movies": data}

		response.statusCode = 200;
		response.setHeader("Content-Type", "application/JSON"); 
		response.end(JSON.stringify(data));
		return;
	})	
	return;
})

// Get request for a specific movie

app.get(`/movie/:movieName`, function (request, response,error) {
	var movieName = request.params.movieName
	let query={}
	if(movieName){
		query.Title= movieName
	}
	db.collection("movies").find(query).toArray((err,data)=>{
		if(err){
			throw err
		}
		request.session.movieViewedId=JSON.stringify(data && data[0] && data[0]._id)	
		request.session.movieViewedName=data && data[0] && data[0].Title
		let reviewParams={}
		reviewParams.movieId= JSON.stringify(data && data[0] && data[0]._id )
		db.collection("reviews").find(reviewParams).toArray((err,data1)=>{
			if(err){
				throw err
			}
			db.collection("movies").find( { $or:[{Genre:data[0].Genre[0]},{Director:data[0].Director[0]},{Actors:data[0].Actors[0]} ]}  ).limit(5).toArray((err,data2)=>{
				if(err){
					throw err
				}
				data2 && data2.map((obj,key)=>{
					if(obj.Title==(data && data[0] && data[0].Title)){
						data2.splice(key,1)
					}
				})
				response.status(200).render("movie", { ...data[0], loggedin:request.session.loggedin, username: request.session.username, reviews: data1, recommendedMovies: data2||[] } );
			})
		})	
	})	
	return
})

// Function for getting homepage
function sendIndex(req, res, next){
	res.render("index",{ loggedin:req.session.loggedin, username: req.session.username });
}


app.get(`/actor/:actorName`, function (request, response,error) {
	var actorName = request.params.actorName
	let query={}
	if(actorName){
		query.Actors= { $all: [actorName] }
	}
	db.collection("movies").find(query).toArray((err,data)=>{
		if(err){
			throw err
		}
		response.status(200).render("actor", {"data": data, actorName: actorName, loggedin:request.session.loggedin, followedPeople:request.session.followedPeople, username: request.session.username });
	})	
	return;
})

app.get(`/director/:directorName`, function (request, response,error) {
	var directorName = request.params.directorName
	let query={}
	if(directorName){
		query.Director= { $all: [directorName] }
	}
	db.collection("movies").find(query).toArray((err,data)=>{
		if(err){
			throw err
		}
		response.status(200).render("director", {"data": data, directorName: directorName, loggedin:request.session.loggedin, followedPeople:request.session.followedPeople, username: request.session.username });
	})	
	return;
})


// GET request for specific writer
app.get(`/writer/:writerName`, function (request, response,error) {
	var writerName = request.params.writerName
	let query={}
	if(writerName){
		query.Writer= { $all: [writerName] }
	}
	db.collection("movies").find(query).toArray((err,data)=>{
		if(err){
			throw err
		}
		response.status(200).render("writer", {"data": data, writerName: writerName, loggedin:request.session.loggedin, followedPeople:request.session.followedPeople, username: request.session.username });
	})	
	return;
})

// Get request for all movies under a specific genre

app.get(`/genre/:genreType`, function (request, response,error) {
	var genreType = request.params.genreType
	response.statusCode = 200;
	response.setHeader("Content-Type", "text/html"); 
	let query={}
	if(genreType){
		query.Genre= { $all: [genreType] }
	}
	db.collection("movies").find(query).toArray((err,data)=>{
		if(err){
			throw err
		}
		response.status(200).render("genre", {"data": data, genreName: genreType, loggedin:request.session.loggedin, username: request.session.username });
	})	
	
	return;
})

// POST request for advanced search 
app.post('/movieAdvancedSearch', function (request, response,error) { //if/client.js is requested

	let params=request.body||{}
	let query={}
	
	if(params.Title){
		query.Title={$regex: params.Title, $options:'i'}
	}
	if(params.Artist){
		query.Actors= { $all: [params.Artist] }
	}
	if(params.Genre){
		query.Genre=params.Genre
	}
	
	db.collection("movies").find(query).toArray((err,data)=>{
		if(err){
			throw err
		}
		response.send(data)
	})	
})

// Adding a new movie
app.post('/addMovie', function (request, response,error) { 
	let params=request.body||{}
	
	db.collection("movies").insertOne(params, function(err, res) {
		if (err) throw err;
		console.log("1 movie inserted");
		addMovieNotification(request.session.username,params.Title)
	});
	response.status(200)
	response.end()	
})


// Adding a movie notification
function addMovieNotification(username,movieName){
	db.collection("users").find().toArray((err,data)=>{
		if(err){
			throw err
		}
		data && data.map((obj)=>{
			let notifications=obj.notifications || []
			notifications.push(username+" added the movie " + movieName )
			if(obj.username!=username){
				db.collection("users").updateOne({ username: obj.username  },{ $set: {"notifications":notifications}}, function(err, res) {
					if (err){
						throw err;
					} 
				});
			}
		})
	})	
}

// Adding a review to the movie
app.post('/addReview', function (request, response,error) { 
	let params=request.body||{}
	params.username=request.session.username
	params.movieId=request.session.movieViewedId
	params.movieName=request.session.movieViewedName
	db.collection("reviews").insertOne(params, function(err, res) {
		if (err){
			throw err;
		} 
		response.status(200)
		response.send({ error: 0})
		response.end()	
	});
	
})

// GET request for a specific review
app.get(`/review/:reviewid`, function (request, response,error) {
	var reviewid = request.params.reviewid
	let query={}
	if(reviewid){
		query._id= mongo.ObjectID(reviewid)
	}
	db.collection("reviews").find(query).toArray((err,data)=>{
		if(err){
			throw err
		}
		response.status(200).render("review", { ...data[0], loggedin:request.session.loggedin, usernameToShow: request.session.username } );
	})	
	return
})


// Adding movie to watch list
app.post('/addToWatchList', function (request, response,error) { 
	
	db.collection("users").find({ username: request.session.username }).toArray((err,data)=>{
		if(err){
			throw err
		}
		let watchList=data && data[0] && data[0].watchList || {}
		watchList[request.session.movieViewedId]={ "movieId": request.session.movieViewedId, "movieName": request.session.movieViewedName}
		db.collection("users").updateOne({ "username": request.session.username  },{ $set: {"watchList":watchList}}, function(err, res) {
			if (err){
				throw err;
			} 
			response.status(200)
			response.send({ error: 0})
			response.end()	
		});
	})	
	
})


// Remove movie for watch list
app.post('/removeWatchedMovie', function (request, response,error) { 
	
	db.collection("users").find({ username: request.session.username }).toArray((err,data)=>{
		if(err){
			throw err
		}
		let watchList=data && data[0] && data[0].watchList || {}
		delete watchList[request.body.movie]
		db.collection("users").updateOne({ "username": request.session.username  },{ $set: {"watchList":watchList}}, function(err, res) {
			if (err){
				throw err;
			} 
			response.status(200)
			response.send({ error: 0})
			response.end()	
		});
	})	
	
})


// Get request for specific username
app.get('/user/:username', function (request, response,error) { 
	let query={}
	query.username=request.params.username
	db.collection("reviews").find(query).toArray((err,data)=>{
		if(err){
			throw err
		}
		db.collection("users").find(query).toArray((err1,data1)=>{
			if(err1){
				throw err1
			}
			let followedUsers=request.session.followedUsers || {}
			let followedUser=followedUsers[request.params.username]?true:false
			let otherUserProfile=query.username==request.session.username?null:query.username
			response.render("profile",{ 
				loggedin: request.session.loggedin,  
				username: request.session.username, 
				otherUserProfile: otherUserProfile, 
				followedUser: followedUser, 
				reviews: data, 
				watchList: Object.values(data1&&data1[0]&&data1[0].watchList||{}),
				followedUsers: Object.values(data1&&data1[0]&&data1[0].followedUsers||{}),
				notifications: [],
				followedPeople: Object.values(data1&&data1[0]&&data1[0].followedPeople || {})
			});
		})
	})	
})

// Follow or unfollow a user
app.post('/followUnfollowUser', function (request, response,error) { 
	let query={}
	query.username=request.session.username
	db.collection("users").find(query).toArray((err,data)=>{
		if(err){
			throw err
		}
		let followedUsers=data && data[0] && data[0].followedUsers || {}
		if(request.body.followUser){
			followedUsers[request.body.username]=request.body.username
			addUserNotification(request.body.username,request.session.username)
		}
		else{
			delete followedUsers[request.body.username]
		}
		request.session.followedUsers=followedUsers
		db.collection("users").updateOne({ "username": request.session.username  },{ $set: {"followedUsers":followedUsers}}, function(err, res) {
			if (err){
				throw err;
			} 
			response.status(200)
			response.send({ error: 0})
			response.end()	
		});
	})	
})


// Follow or unfollow an actor, writer or director
app.post('/followUnfollowPeople', function (request, response,error) { 
	let query={}
	query.username=request.session.username
	db.collection("users").find(query).toArray((err,data)=>{
		if(err){
			throw err
		}
		let followedPeople=data && data[0] && data[0].followedPeople || {}
		if(request.body.followFlag){
			followedPeople[request.body.name]={ "name": request.body.name, type: request.body.type }
		}
		else{
			delete followedPeople[request.body.name]
		}
		request.session.followedPeople=followedPeople
		db.collection("users").updateOne({ "username": request.session.username  },{ $set: {"followedPeople":followedPeople}}, function(err, res) {
			if (err){
				throw err;
			} 
			response.status(200)
			response.send({ error: 0})
			response.end()	
		});
	})	
})


// Adding a new user followed notification
function addUserNotification(username,follower){
	db.collection("users").find({ username: username }).toArray((err,data)=>{
		if(err){
			throw err
		}
		let notifications=data && data[0] && data[0].notifications || []
		notifications.push(follower+" started following you.")
		db.collection("users").updateOne({ username: username  },{ $set: {"notifications":notifications}}, function(err, res) {
			if (err){
				throw err;
			} 
		});
	})	
}

// GET request for a users list
app.get('/users', function (request, response,error) { 
	let query={}
	db.collection("users").find({},{ username: 1 }).toArray((err,data)=>{
		if(err){
			throw err
		}
		response.render("users",{ 
			loggedin: request.session.loggedin,  
			username: request.session.username, 
			users: data||[],
			followedUsers: request.session.followedUsers||{} 
		});
	})	
})






// Initialize database connection
MongoClient.connect("mongodb+srv://new-user:<password>@cluster0.n2uo2.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", function(err, client) {
  if(err) throw err;

  //Get the t8 database
  db = client.db('project');

  // Start server once Mongo is initialized
  app.listen( process.env.PORT || 3000);
  console.log("Listening on port 3000");
});
