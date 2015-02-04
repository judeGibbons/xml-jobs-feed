var recruitmentfeeduniquenamespace = (function () {

	//set up variables
	 
	var feedcontainer;
	var feedurl = "http://staffrecruitment.coventry.ac.uk/RSS/UniversityVacancies.xml";
	var feedlimit = 150; // CHANGE TO NUMBER OF JOBS YOU WANT IN FEED
	var frcsListArray = []; 
	var frcArray = [];
	var namestring = "";
	var allFrcsArray = []; //nb this means just research jobs in all frcs
	var selectedFrc = "allresearchjobs";
	var activeArray = [];
	var vacanciesTable = "";
	var selectMenu;
	var testthing;

	//set up the Faculty Research Centre object
	function frcObject(nameid,namestring,frcArray) {
		this.nameid = nameid;
		this.namestring = namestring;
		this.frcArray = frcArray;
		
		frcsListArray.push(this);
	};
	
//ADD NAMES AND SHORT CODES OF THE RESEARCH CENTRES HERE//
	
	//list out FRCs
	var cawr  = new frcObject("cawr",  "Centre for Agroecology, Water and Resilience", []);
	var cabes = new frcObject("cabes", "Centre for Applied Biological and Exercise Sciences", []);
	var cbs   = new frcObject("cbs",   "Centre for Business in Society", []);
	var ccsj  = new frcObject("ccsj",  "Centre for Communities and Social Justice", []);
	var clib  = new frcObject("clib",  "Centre for Low Impact Buildings", []);
	var cpba  = new frcObject("cpba",  "Centre for Research in Psychology, Behaviour and Achievement", []);
	var cteh  = new frcObject("cteh",  "Centre for Technology Enabled Health", []);
	var ctpsr = new frcObject("ctpsr", "Centre for Trust, Peace and Social Relations", []);
	var iame  = new frcObject("iame",  "Institute for Advanced Manufacturing and Engineering", []);
	
//END OF SECTION TO EDIT//	
	
	//attach listener to frc dropdown filter
	function addListenerToFrcSelector() {
		if (document.getElementById("frclocation").addEventListener) {
			document.getElementById("frclocation").addEventListener('change', frcFilter, false);
		} else {
		if (document.getElementById("frclocation").attachEvent) {
			document.getElementById("frclocation").attachEvent('onchange', frcFilter);
			};
		};
	};
	
	//set up frc dropdown filter
	function frcFilter() {
		selectMenu = document.getElementById("frclocation");
		selectedFrc = selectMenu.options[selectMenu.selectedIndex].value;
		createTable(selectedFrc);
	};

	//call functions onload
	window.onload=function() {
		document.getElementById('frclocation').options[0].selected = true;
		rssfeedsetup();
		addListenerToFrcSelector();
	};

	//bring in xml
	function rssfeedsetup() {
		var jobsfeed = new google.feeds.Feed(feedurl+"?t="+new Date().getTime());
		jobsfeed.setResultFormat(google.feeds.Feed.XML_FORMAT);
		jobsfeed.setNumEntries(feedlimit);
		jobsfeed.load(displayfeed);
	};

	//sort on job title (could sort on closing date or salary instead, I have code for this)
	function sortOnTitle(a,b) {
		if (a.title < b.title) {
			return -1;
		};
		if (a.title > b.title) {
			return 1;
		};
		return 0;				
	};

	//make activeArray from one of the frcArrays and push into table rows
	function createTable(selectedFrc) {
		if (selectedFrc == "allresearchjobs") {
			activeArray = allFrcsArray;
		} else {
			for (var m=0, maxm=frcsListArray.length; m<maxm; m++) {
				//console.log(frcsListArray[m].nameid);
				if (selectedFrc == frcsListArray[m].nameid) {
					activeArray = frcsListArray[m].frcArray;
					nameOfFrc = frcsListArray[m].namestring;
				};
			};
		};

		activeArray = activeArray.sort(sortOnTitle);
				
		//console.log(selectedFrc, testthing);

		//push the sorted activeArray into an html table
		feedcontainer = document.getElementById("jobscontainer");
		feedcontainer.innerHTML = "";
		var rssoutput = "";
		for (var k=0, maxk=activeArray.length; k<maxk; k++) {
			rssoutput+="<tr><td><span class='title'><a href='" 
			+ activeArray[k].link + "' target='_blank'>" 
			+ activeArray[k].title + "<\/a><\/span><br \/>" 
			+ activeArray[k].department +"<br \/><span class='strong'>Reference:<\/span> " 
			+ activeArray[k].reference +"<\/td><td>" 
			+ activeArray[k].salary +"<\/td><td>" 
			+ activeArray[k].closingdate +"<\/td><\/tr>"
		};
		vacanciesTable = "";
		if (rssoutput === "") {
			vacanciesTable="<p class='standalonepara nojobs'>There are currently no jobs available in the " + nameOfFrc + ".<\/p>";
		} else {
			vacanciesTable="<table><thead><tr><th>Job title<\/th><th>Salary<\/th><th>Closing date<\/th><\/tr><\/thead><tbody>" + rssoutput + "<\/tbody><\/table>";
		};
		feedcontainer.innerHTML=vacanciesTable;
	};

	//display feed function - parse rss feed
	function displayfeed(result) {
		if (!result.error) {
		    var content = document.getElementById('content'),	
		    items = result.xmlDocument.getElementsByTagName('item'),
			itemArray = [],
			itemsArray = [];
			
			//set up the 'Item' object 
			function itemObject(title,link,department,reference,category,salary,minsalary,closingdate,closingdateObject,description) {
				this.title = title;
				this.link = link;
				this.department = department;
				this.reference = reference;
				this.category = category;
				this.salary = salary;
				this.minsalary = minsalary;
				this.closingdate = closingdate;
				this.closingdateObject = closingdateObject;
				this.description = description;	
			};
				
			//run through this function in order to weed out non-existent or empty child nodes
			var xmlElement;
			function checkElementChildren(xmlElement) {
				if (xmlElement) {
					if (xmlElement.childNodes.length == 0) {
						var elementString = "";
						return (elementString);
					} else {
						for (j=0, maxj=xmlElement.childNodes.length; j<maxj; j++) {
							if (xmlElement.childNodes[j] !== null) {
								elementString = xmlElement.childNodes[j].nodeValue;
								break;
							};
						xmlElement.childNodes[j] = xmlElement.childNodes[j+1];
						};
					return (elementString);
					};
				};
			};

			//ITEM LOOP
		    //take each xml item, convert into array of strings (checking for empty nodes in function above)
		    //and make item a new object, pushing to allFrcsArray and relevant frcArray
		    for (var i=0, maxi=items.length; i<maxi; i++) {
				var item = items[i],
				titleElement = item.getElementsByTagName("title")[0],
				linkElement = item.getElementsByTagName("link")[0];
				if (item.getElementsByTagName("job:reference")[0]) {
					var referenceElement = item.getElementsByTagName("job:reference")[0],
					departmentElement = item.getElementsByTagName("job:location")[0],
					salaryElement = item.getElementsByTagName("job:salary")[0],
					closingdateElement = item.getElementsByTagName("job:closingdate")[0],
					descriptionElement = item.getElementsByTagName("job:description")[0],
					minsalaryElement = item.getElementsByTagName("job:minsalary")[0],
					categoryElement = item.getElementsByTagName("job:category")[0];
				} else {
					var referenceElement = item.getElementsByTagName("reference")[0],
					departmentElement = item.getElementsByTagName("location")[0],
					salaryElement = item.getElementsByTagName("salary")[0],
					closingdateElement = item.getElementsByTagName("closingdate")[0],
					descriptionElement = item.getElementsByTagName("description")[0],
					minsalaryElement = item.getElementsByTagName("minsalary")[0],
					categoryElement = item.getElementsByTagName("category")[0];
				};
				
				var title = checkElementChildren(titleElement),
				link = checkElementChildren(linkElement),
				reference = checkElementChildren(referenceElement),
				department = checkElementChildren(departmentElement),
				salary = checkElementChildren(salaryElement),
				closingdate = checkElementChildren(closingdateElement),
				description = checkElementChildren(descriptionElement),
				minsalary = checkElementChildren(minsalaryElement),
				category = checkElementChildren(categoryElement),
				closingdateObject;

				//making closingdate string better formatted - should separate this presentation from the data bit!
				if (closingdate !== "") {
					closingdateObject = new Date(closingdateElement.childNodes[0].nodeValue);
					closingdate = closingdate.replace(" 00:00:00 GMT","").replace(",","");
				};
				
				var mapDateString = {
					Mon:"Monday", Tue:"Tuesday", Wed:"Wednesday", Thu:"Thursday", Fri:"Friday", Sat:"Saturday", Sun:"Sunday", Jan:"January ", Feb:"February ", Mar:"March ", Apr:"April ", Jun:"June ", Jul:"July ", Aug:"August ", Sep:"September ", Oct:"October ", Nov:"November ", Dec:"December "
				};
				closingdate = closingdate.replace(/Mon|Tue|Wed|Thu|Fri|Sat|Sun|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec/g, function(matched) {
					return mapDateString[matched];
				});
				
				
				//for each item in feed, make object and match to certain frc names
				var newItemObject = new itemObject(title,link,department,reference,category,salary,minsalary,closingdate,closingdateObject,description);		
				if ((newItemObject.category == ("Research"))||(newItemObject.category == ("Research Support"))) {
					allFrcsArray.push(newItemObject);
					for (var l=0, maxl=frcsListArray.length; l<maxl; l++) {
						if (newItemObject.department == frcsListArray[l].namestring) {
							frcsListArray[l].frcArray.push(newItemObject);
							frcsListArray[l].frcArray = frcsListArray[l].frcArray.sort(sortOnTitle);
						};
					};
				};
			}; //END OF ITEM LOOP
			
			createTable(selectedFrc); //only called on windowload
			
		} else {
			alert(result.error.message);
		};
	};
	
})();