//A Dictionary with things to win points for and their point value
var get_points = {
"Join the chapter. Welcome!": [1, "B"],
"Complete a SMART Goal": [3, "B"],
"Attend a Study Group": [1, "A"],
"Get an A/A+ on Test or Paper": [2, "A"],
"Mentor a Brother in Academics": [1, "SM"],
"Write a Column for Alumni Newsletter": [4, "B"],
"Win Category at End of Semester Awards": [2, "B"],
"Organize a Development or Brotherhood Event": [4, "B"],
"Participate in a Development or Brotherhood Event": [1, "B"],
"Join an IM Team": [3, "SB"],
"Plan a Social Event": [4, "B"],
"Attend a Social Event": [1, 'B'],
"Participate in a Social Event as a Sober Brother": [3, 'B'],
"Connect with a Professional in Your Field": [1, "P"],
"Attend Exec Meeting": [1, 'B'],
"Attend AVC Meeting": [1, 'B'],
"Help with Monday Meeting Dinner": [1, 'B'],
"Reach out to SigEp Alumni": [2, "P"],
"Apply to SigEp National Program": [2, "SM"],
"Attend SigEp National Program": [3, "SM"],
"Participate in Voluntary House Improvement": [2, "B"],
"Become Leader of Other Campus Organization": [3, "P"],
"Become Member of Other Campus Organization": [1, "P"],
"Lead Sound Body Event or Workout": [3, "SB"],
"Attend SigEp Sound Body Event or Workout": [1, "SB"],
"Lead Sound Mind Event": [3, "SM"],
"Attned SigEp Sound Mind Event": [1, 'SM'],
"Raise $100 for Philanthropy": [2, "PH"],
"Bring PNM to SigEp Event": [2, "B"],
"Participate in Community Service Event": [1, "PH"],
"Begin New Personal Fitness Program": [2, "SB"],
"Attend Gym Twice": [1, "SB"],
"Complete Event/Requirement for Development Challenge": [2, "B"],
"Attend Office Hours, Be Introduced to Professor": [1, "A"],
"Purchase Items for House": [1, "B"],
"Hold Voluntary Chair Position": [2, "B"],
"Hold Elected Chair Position": [4, "B"],
"Hold Executive Position": [6, "B"]
};
	


//List of Valid Classes, I could have probably made this a local variable but I thought I might want to use it again
var classes = ["SIGMA", "PHI", "EPSILON", "BROTHERMENTOR"]

//A list of brothers which is updated on startup, to prevent having to make multiple calls to server for the same data
var brothers = []

//The api code for the server. Try not to Give it to people, though I'm going to generate a new one before we go live anyway.
var api = "ynsqwgeAbfLKlHS5G6-_7tFJFmMgstuZ";

// Gets Destination URL from class and name, a.k.a, stops me from having to have nasty urls in code. Here, and in the rest of the code, I use
// 'level' instead of 'class' to refer to development class because class is a reserved name in JS.
function get_url(level, name){
	if (name === undefined)
	{return "https://api.mongolab.com/api/1/databases/pointsdata/collections/"+level+"?apiKey="+api}
	else
	{return "https://api.mongolab.com/api/1/databases/pointsdata/collections/"+level+"/"+name+"?apiKey="+api}
}

// Generic Talk-To-Server Function. Because I don't understand javascript that well, the GET and POST commands are done totally differently
// from one another because I know each method will work and I don't want to deal with simplifying a system that already works, but ideally
// they could be unified. tts retrieves info from the level-name place if no payload is specified. If a payload is specified, tts posts the // // payload there. todo is the function which is called on confirmation of request finishing. 
function tts(level, name, todo, payload)
{	
	if (payload === undefined) 
		{var command = "GET"}
	else 
		{var command = "POST"}
	if (payload === undefined)
    	{
			var address = get_url(level, name);
			var request = new XMLHttpRequest();
		    request.open(command, address);
			request.send();
			request.onreadystatechange = todo;
					}
	else
		{
			var address = get_url(level);
			$.ajax({ url: address,
		  	data: JSON.stringify(payload),
		  	type: "POST",
		  	contentType: "application/json"});
		}
}
	
//Formats Inputted Name to Server-Friendly Name.
function format_name(name)
{
	name = name.replace(/\s+/g, '')
	return name.toUpperCase();
}

//Checks to make sure New Brother is Valid when registering.
function check_sub(name, level)
{			
	if ($.inArray(level, classes) == -1)
		{return "C"}
	if ($.inArray(name, brothers) != -1)
		{return "N"}
	else
		{return true}
}

//Updates the local list of brother names with the one stored on the server.
function getlist()
{
	function cs()
	{
		if (this.readyState == 4)
		{
			var names = $.parseJSON(this.response);
			var L = names["list"];
			brothers = L
		}
	}		
	tts("ServerData", "Names", cs);
}


//Sends New Brothers to Server upon registration. This is a rather involved function, talk to me if you have questions.
function subm()
{
	var name = gebi("rname").value;
	var email = gebi("remail").value;
	var level = gebi("rclass").value;
	name = format_name(name);
	level = format_name(level);
	var ret = check_sub(name, level);
	if (ret == true)
	{
		tts("ServerData", name, function(){}, {"_id": name, "class": level});
		tts(level, name, function(){}, {"_id": name, "email": email, "class": level, "points": 0, "tags": [], "submissions": []});
		tts("ServerData", "Names", function(){
			if (this.readyState == 4) {
				var names = $.parseJSON(this.response);
				var L = names["list"]
				L[L.length] = name;
				tts("ServerData", "Names", function(){}, names);
			}});
		name = "";
		email = "";
		level = "";
		openregister();
	}
	if (ret == "C")
	{
		level = "Invalid Class";
		gebi("rclass").style.backgroundColor = "red";
	}
	else
	{
		gebi("rname").value = "Name already Taken";
		gebi("rname").style.backgroundColor = "red"
	}
	getlist();
}
		
//Fetches brother's dictionary from info inputted on site. It then calls popup_info on the dictionary to display the submission history for   // that brother.
function findb()
{
	var name = "Aidan Clark";
	name = format_name(name);
	function getbro()
	{
		if (this.readyState == 4)
			{
				function popup()
				{
					if (this.readyState == 4)
						{popup_info(this.response)}
				}
				tts($.parseJSON(this.response)["class"], name, popup);
			}
	}
	tts("ServerData", name, getbro);
}

// Fetches brother from name. Similar to above, except the name is passed in as a variable instead of gotten from data on the page, and what 
// you do with the brother once he is retrived is not set but specified by the func variable. 
function findbi(name, func)
{
	name = format_name(name);
	function getbro()
	{
		if (this.readyState == 4)
			{
				tts($.parseJSON(this.response)["class"], name, func);
			}
	}
	tts("ServerData", name, getbro);
}

//Loads the pop up for points information. A helper function to load the table and popup of brother's points submission history. 
function popup_info(brother)
{
	var javab = $.parseJSON(brother);
	$("PPT").text(parseInt(javab["points"]));
	//var table = gebi("itable");
	//var subs = javab["submissions"];
	//for (i = 0; i < subs.length; i++){
		//var indi = subs[i];
		//var row = table.insertRow(i);
		//var c1 = row.insertCell(0);
		//c1.innerHTML = indi[0];
		//var c2 = row.insertCell(1);
		//c2.innerHTML = indi[1];}
}


//Updates the text on the site to reflect the point value of the chosen option when submitting new points. 
function update_value()
{
	var x = gebi("number");
	var opt = gebi("opt");
	x.textContent = get_points[opt.value];
}

//Sends Points to the Server upon completion of the submission form. Also an involved function. 
function send_points()
{
	var name = gebi("unform").value;
	var type = gebi("opt").value;
	var points = gebi("number").textContent;	
	var descript = gebi("details").value;
	var subtime =  new Date();
	function sendpoints()
	{
		if (this.readyState == 4)
		{
			var brother = $.parseJSON(this.response);
			var newsub = [type, descript, points, subtime];
			brother["submissions"][brother["submissions"].length] = newsub;
			brother["points"] = parseInt(brother["points"]) + parseInt(points);
			tts(brother["class"], name, function(){}, brother);
			function classpointsupdate()
			{
				if (this.readyState == 4)
				{
					x = $.parseJSON(this.response);
					x["points"] = parseInt(x["points"]) + parseInt(points);
					tts(brother["class"], brother["class"], function(){}, x);
				}
			}
			tts(brother["class"], brother["class"], classpointsupdate);
			function update_new()
			{
				if (this.readyState == 4)
				{
					var rec = $.parseJSON(this.response);
					var R = rec["recent"];
					var valz = name + " submitted " + type + " on " + subtime.toUTCString();
					rec["recent"] = [valz, rec["recent"][0], rec["recent"][1]];
					tts("ServerData", "recents", function(){}, rec);
				}
			}
			tts("ServerData", "recents", update_new);
		}
	}
	findbi(name, sendpoints);
	opensubmission();
}

//Updates the Total Point Counters for Each Class on the webpage.
function uptotals()
{
	tts("SIGMA", "SIGMA", function(){
		if (this.readyState == 4) 
			{var x = $.parseJSON(this.response)["points"];sym.$("SigPoints").html(x);}})
	tts("PHI", "PHI", function(){
		if (this.readyState == 4) 
			{var x = $.parseJSON(this.response)["points"];sym.$("PhiPoints").html(x);}})
	tts("EPSILON", "EPSILON", function(){
		if (this.readyState == 4) 
			{var x = $.parseJSON(this.response)["points"]; sym.$("EpPoints").html(x);}})
	//$(gebi("bmp")).append($.parseJSON(tts("BrotherMentor", "BrotherMentor").response)["points"]); (Haven't implemented BM)
}



//Load Popup Window by Name and load Background Dimmer
function load_popup(popup)
{
	var x = gebi(popup);
	if (x.style.display == "inline")
		{x.style.display = "none";}
	else
		{x.style.display = "inline";}
	var x = gebi("expandableoverlay");
	if (x.style.display == "inline")
		{x.style.display = "none";}
	else
		{x.style.display = "inline";}
	uptotals();
}

//Opens the <div> for registering a new brother
function openregister()
{
	load_popup("expandable");
	gebi("rname").value = "";
	gebi("remail").value = "";
	gebi("rclass").value = "";
	gebi("rname").style.backgroundColor = "white";
	gebi("rclass").style.backgroundColor = "white";
}

//Opens the <div> for getting points data
function openinfoget()
{
	load_popup("infoget");
}


//Opens the info table <div>
function openinfotable()
{
	load_popup("infotable");
	var table = gebi("itable");
	table.innerHTML = "";
}


//Opens the submission <div>
function opensubmission()
{
	update_value();
	load_popup("submissiontable");
	gebi("details").value = "";
	
}

//Closes all Popup windows
function closeall()
{
	var pos = [["submissiontable", opensubmission], ["infotable", openinfotable], ["infoget", openinfoget], ["expandable", openregister]];
	for (i = 0; i < pos.length; i++)
	{
		if (gebi(pos[i][0]).style.display == "inline")
			{pos[i][1]();}
	}
		
		
}

//getElementbyId shorthand
function gebi(element)
{
	return document.getElementById(element);
}

//Updates Live Feed
function live_feed()
{
	function list()
	{
		if (this.readyState == 4)
		{
			var rec = $.parseJSON(this.response);
			rec = rec["recent"]
			if (rec.length == 0)
				{gebi("one").textContent = "No recent points submissions."}
			else
			{
				gebi("one").textContent = rec[0];
				gebi("two").textContent = rec[1];
				gebi("three").textContent = rec[2];
			}
				
		}
	}
	tts("ServerData", "recents", list);	
}

function five(){return 9};
