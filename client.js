if(document.getElementById("searchMovie")){
    document.getElementById("searchMovie").onkeyup=onSearchMovie
}

function createMovieList(movie){
    let result = "";
    movie.map(elem => {
       result += `<a class="movieName" href="movie/${elem.Title}">${elem.Title+" "+elem.Year}</a>`
    });
    return result
}


// search a movie on the homepage

function onSearchMovie(){
    let movieName = document.getElementById("searchMovie").value
    if(movieName.length==0){
        document.getElementById("MovieList").innerHTML = "Enter a movie name"
        return;
    }

    let req = new XMLHttpRequest(); //New XMLhttp request
    req.onreadystatechange = function (){ 
        if(this.readyState == 4 && this.status  == 200){
            data = JSON.parse(req.responseText); //parse the response from the server
            document.getElementById("MovieList").innerHTML = data&&data.movies&& data.movies.length>0 ? createMovieList(data&&data.movies||[]) : "No movies found" ; //create the dropdown menu from the data 

        }
    }
    req.open("GET", `/movies?Title=${movieName}`, false);
    req.setRequestHeader("accept", "application/json" );
    req.send();	    
}
if(document.getElementById("searchButton")){
    document.getElementById("searchButton").onclick=getMovies
}

// Advanced search for the movies
function getMovies(){
    let Title=document.getElementById("Title").value
    let Artist=document.getElementById("Artist").value
    let Genre=document.getElementById("Genre").value
  
    let params={}
    if(Title){
        params.Title=Title
    }
    if(Artist){
        params.Artist=Artist
    }
    if(Genre){
        params.Genre=Genre
    } 
    if((Title.length  == 0) && (Artist.length  == 0) && (Genre.length == 0)){
        alert("Please Fill one of the fields to perform the Search");
        return;
	}
    let req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if(this.readyState==4 && this.status==200){
            document.getElementById("results").innerHTML=null
            movies=JSON.parse(this.response)
            movies && movies.map((obj)=>{
                document.getElementById("results").innerHTML+=`<div><a href='movie/${obj.Title}'>${obj.Title}</a></div>`
            })
		}
	}
	
	//Send a POST request to the server containing the recipe data
	req.open("POST", `/movieAdvancedSearch`);
	req.setRequestHeader("Content-Type", "application/json");
	req.send(JSON.stringify(params));
    
}
if(document.getElementById("addMovieButton")){
    document.getElementById("addMovieButton").onclick=addMovie
}


// Add a movie API POST request with user values
function addMovie(){
    let Title=document.getElementById("Title").value
    let Runtime=document.getElementById("Runtime").value
    let Year=document.getElementById("Year").value
    let Genre=document.getElementById("Genre").value
    let Actors=document.getElementById("Actors").value
    let Director=document.getElementById("Director").value
    let Writer=document.getElementById("Writer").value
    let Plot=document.getElementById("Plot").value
    let Poster=document.getElementById("Poster").value
    let Released=document.getElementById("Released").value
    let Awards=document.getElementById("Awards").value
    let Rated=document.getElementById("Rated").value

    if(!Title || !Runtime || !Year || !Genre || !Actors || !Director || !Writer || !Released){
        alert("Enter all values")
        return
    }
  
    let params={}
    params.Title=Title
    params.Runtime=Runtime
    params.Year=Year
    params.Genre=Genre.split(",")
    params.Actors=Actors.split(",")
    params.Director=Director.split(",")
    params.Writer=Writer.split(",")
    params.Plot=Plot
    params.Poster=Poster
    params.Released=Released
    params.Rated=Rated
    params.Awards=Awards

    let req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if(this.readyState==4 && this.status==200){
            alert("Movie added successfully")
		}
	}
	
	//Send a POST request to the server containing the recipe data
	req.open("POST", `/addMovie`);
	req.setRequestHeader("Content-Type", "application/json");
	req.send(JSON.stringify(params));
    
}


if(document.getElementById("login")&&document.getElementById("signup")){
    document.getElementById("login").onclick=()=>{loginOrSignup("login")}
    document.getElementById("signup").onclick=()=>{loginOrSignup("signup")}
}

// Call login or signup API based on the clicked button

function loginOrSignup(type){
    let username=document.getElementById("username").value
    let password=document.getElementById("password").value

    if(!username || !password  ){
        alert("Enter both username and password")
        return
    }
  
    let params={}
    params.username=username
    params.password=password

    let req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if(this.readyState==4 && this.status==200){
            let response=JSON.parse(this.response||{})
            alert(response.message)
            if(response.error==0){
                if(type=="login"){
                    window.location.href="/profile"
                }
            }
		}
	}
	
	//Send a POST request to the server containing the recipe data
	req.open("POST", `/${type}`);
	req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify(params));
}

if(document.getElementById("logout")){
    document.getElementById("logout").onclick=logout
}

// Call logout API on logout button click

function logout(){
    let req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if(this.readyState==4 && this.status==200){
            let response=JSON.parse(this.response||{})
            if(response.error==0){
                window.location.href="/loginOrSignup"
            }
		}
	}

	req.open("GET", `/logout`);
	req.setRequestHeader("Content-Type", "application/json");
    req.send();
}

if(document.getElementById("reviewForm")){
    document.getElementById("reviewForm").onsubmit=addReview
}

// POST request for adding a review with specified parameters

function addReview(){
    let params={}
    params.reviewScore=document.getElementById("reviewScore").value
    params.reviewSummary=document.getElementById("reviewSummary").value
    params.fullReviewText=document.getElementById("fullReviewText").value

   
    let req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if(this.readyState==4 && this.status==200){
            let response=JSON.parse(this.response||{})
            if(response.error==0){
                alert("Review Added")
                document.getElementById("reviewScore").value=""
                document.getElementById("reviewSummary").value=""
                document.getElementById("fullReviewText").value=""
            }
		}
	}
	
	//Send a POST request to the server containing the recipe data
	req.open("POST", `/addReview`);
	req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify(params));
    
}

if(document.getElementById("addToWatchList")){
    document.getElementById("addToWatchList").onclick=addToWatchList
}

// Adding a movie to watch list of the user

function addToWatchList(){
    let req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if(this.readyState==4 && this.status==200){
            let response=JSON.parse(this.response||{})
            if(response.error==0){
                alert("Movie added to watched list")
            }
		}
	}
	
	//Send a POST request to the server containing the recipe data
	req.open("POST", `/addToWatchList`);
	req.setRequestHeader("Content-Type", "application/json");
    req.send();
}

if(document.getElementsByClassName("removeWatchedMovie")){
    let buttons=document.getElementsByClassName("removeWatchedMovie")||[]
    
    for(let i=0;i<buttons.length;i++){
        buttons[i].onclick=removeWatchedMovie
    }
}

// Remove the movie from the watch list of the user


function removeWatchedMovie(e){
    let req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if(this.readyState==4 && this.status==200){
            let response=JSON.parse(this.response||{})
            if(response.error==0){
                location.reload()
            }
		}
    }

	req.open("POST", `/removeWatchedMovie`);
	req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify({"movie":e.target.name}));
}

if(document.getElementById("followUnfollowUser")){
    document.getElementById("followUnfollowUser").onclick=followUnfollowUser
}

// Follow and Unfollow the user based on the respective request

function followUnfollowUser(){
    let params={}
    params.followUser=document.getElementById("followUnfollowUser").value?false:true
    params.username=document.getElementById("followUnfollowUser").name
    let req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if(this.readyState==4 && this.status==200){
            let response=JSON.parse(this.response||{})
            if(response.error==0){
                location.reload()
            }
		}
    }

	req.open("POST", `/followUnfollowUser`);
	req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify(params));
}

if(document.getElementsByClassName("removeFollowedUser")){
    let buttons=document.getElementsByClassName("removeFollowedUser")||[]
    for(let i=0;i<buttons.length;i++){
        buttons[i].onclick=removeFollowedUser
    }
}

// Removed the followed user from the list

function removeFollowedUser(e){
    let params={}
    params.followUser=!e.target.value || false
    params.username=e.target.name
    let req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if(this.readyState==4 && this.status==200){
            let response=JSON.parse(this.response||{})
            if(response.error==0){
                location.reload()
            }
		}
    }

	req.open("POST", `/followUnfollowUser`);
	req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify(params));
}

if(document.getElementsByClassName("followUnfollowPeople")){
    let buttons=document.getElementsByClassName("followUnfollowPeople")||[]
    for(let i=0;i<buttons.length;i++){
        buttons[i].onclick=followUnfollowPeople
    }
}


// Follow or unfollow any actor, writer or director

function followUnfollowPeople(e){
    let params={}
    params.followFlag=e.target.value?false:true
    params.name=e.target.name
    params.type=window.location.href.split("/")[3]
    let req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if(this.readyState==4 && this.status==200){
            let response=JSON.parse(this.response||{})
            if(response.error==0){
                location.reload()
            }
		}
    }

	req.open("POST", `/followUnfollowPeople`);
	req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify(params));
}
