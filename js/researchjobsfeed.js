var recruitmentfeeduniquenamespace = (function () {
	
	//javascript by Jude Gibbons, Coventry University
	
	var feedurl = "https://staffrecruitment.coventry.ac.uk/RSS/UniversityVacancies.xml";
	var feedlimit = 150; // CHANGE TO NUMBER OF JOBS YOU WANT IN FEED - made 150 to get all of them
	var frcsListArray = []; 
	var frcArray = [];
	var frcTable = "";
	var catsListArray = [];
	var catArray = [];
	var catTable = "";

	//set up the Faculty Research Centre object
	function frcObject(nameid,namestring,frcArray,frcTable) {
		this.nameid = nameid;
		this.namestring = namestring;
		this.frcArray = frcArray;
		this.frcTable = frcTable;

		frcsListArray.push(this);
	};
	
	//set up the categories object [for different categories to research, ie research support]
	function catObject(nameid,namestring,catArray,catTable) {
		this.nameid = nameid;
		this.namestring = namestring;
		this.catArray = catArray;
		this.catTable = catTable;

		catsListArray.push(this);
	};

//ADD NAMES AND SHORT CODES OF THE RESEARCH CENTRES AND ADDITIONAL CATEGORIES HERE//

//NOTE THAT DIVS IN HTML FILE MUST MATCH THESE!!!!!!!!

	//list out FRCs
	var cawr  = new frcObject("cawr",  "Centre for Agroecology, Water and Resilience", [], "");
	var cabes = new frcObject("cabes", "Centre for Applied Biological and Exercise Sciences", [], "");
	var cbs   = new frcObject("cbs",   "Centre for Business in Society", [], "");
	var ccsj  = new frcObject("ccsj",  "Centre for Communities and Social Justice", [], "");
	var clib  = new frcObject("clib",  "Centre for Low Impact Buildings", [], "");
	var cpba  = new frcObject("cpba",  "Centre for Research in Psychology, Behaviour and Achievement", [], "");
	var cteh  = new frcObject("cteh",  "Centre for Technology Enabled Health", [], "");
	var ctpsr = new frcObject("ctpsr", "Centre for Trust, Peace and Social Relations", [], "");
	var iame  = new frcObject("iame",  "Institute for Advanced Manufacturing and Engineering", [], "");
	
	//list out additional categories eg research support
	var ressup = new catObject("ressup", "Research Support", [], "");
	
//END OF SECTION TO EDIT//


	//call functions onload
	window.onload=function() {
		rssfeedsetup();
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
		    //take xml elements and convert them into strings, checking for empty nodes in function above
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

				//reformat closingdate - should separate out
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
							
				if (newItemObject.category == ("Research")||newItemObject.category == ("Research Support")) { //add "Additional Research" if needed
					for (var l=0, maxl=frcsListArray.length; l<maxl; l++) {
						if (newItemObject.department == frcsListArray[l].namestring) {
							frcsListArray[l].frcArray.push(newItemObject);
							frcsListArray[l].frcArray = frcsListArray[l].frcArray.sort(sortOnTitle);
							
							if (newItemObject.category == ("Research Support")) { //add "Additional Research" if needed
								for (var m=0, maxm=catsListArray.length; m<maxm; m++) {
									if (newItemObject.category == catsListArray[m].namestring) {
									catsListArray[m].catArray.push(newItemObject);
									catsListArray[m].catArray = catsListArray[m].catArray.sort(sortOnTitle);
									};
								};
							};
						};
					};
				};
			}; //END OF ITEM LOOP


			//push the sorted variables from the frc arrays into html tables
			for (var n=0, maxn=frcsListArray.length; n<maxn; n++) {
				var frcfeedcontainer = document.getElementById(frcsListArray[n].nameid);
				var frcjobtype = frcsListArray[n].namestring;
				var frcrssoutput = "";
				for (var k=0, maxk=frcsListArray[n].frcArray.length; k<maxk; k++) {
					frcrssoutput+="<tr><td><span class='title'><a href='" 
					+ frcsListArray[n].frcArray[k].link + "' target='_blank'>" 
					+ frcsListArray[n].frcArray[k].title + "<\/a><\/span><br \/>" 
					//+ frcsListArray[n].frcArray[k].department +"<br \/> //no need for this if all presorted
					+ "<span class='strong'>Reference:<\/span> " 
					+ frcsListArray[n].frcArray[k].reference +"<\/td><td>" 
					+ frcsListArray[n].frcArray[k].salary +"<\/td><td>" 
					+ frcsListArray[n].frcArray[k].closingdate +"<\/td><\/tr>"
				};
				if (frcrssoutput === "") {
					frcsListArray[n].frcTable+="<p class='standalonepara nojobs'>There are currently no jobs available in the " + frcjobtype + ".<\/p>";
				} else {
					frcsListArray[n].frcTable+="<table><thead><tr><th>Job title<\/th><th>Salary<\/th><th>Closing date<\/th><\/tr><\/thead><tbody>" + frcrssoutput + "<\/tbody><\/table>";
				};
				frcfeedcontainer.innerHTML=frcsListArray[n].frcTable;
			};

			//push the sorted variables from the category arrays into html tables
			for (var p=0, maxp=catsListArray.length; p<maxp; p++) {
				var catfeedcontainer = document.getElementById(catsListArray[p].nameid);
				var catjobtype = catsListArray[p].namestring;
				var catrssoutput = "";
				for (var q=0, maxq=catsListArray[p].catArray.length; q<maxq; q++) {
					catrssoutput+="<tr><td><span class='title'><a href='" 
					+ catsListArray[p].catArray[q].link + "' target='_blank'>" 
					+ catsListArray[p].catArray[q].title + "<\/a><\/span><br \/>" 
					+ catsListArray[p].catArray[q].department
					+ "<br \/><span class='strong'>Reference:<\/span> " 
					+ catsListArray[p].catArray[q].reference +"<\/td><td>" 
					+ catsListArray[p].catArray[q].salary +"<\/td><td>" 
					+ catsListArray[p].catArray[q].closingdate +"<\/td><\/tr>"
				};

				if (catrssoutput === "") {
					catsListArray[p].catTable+="<p class='standalonepara nojobs'>There are currently no " + catjobtype + " jobs available.<\/p>";
				} else {
					catsListArray[p].catTable+="<table><thead><tr><th>Job title<\/th><th>Salary<\/th><th>Closing date<\/th><\/tr><\/thead><tbody>" + catrssoutput + "<\/tbody><\/table>";
				};
				if (catfeedcontainer) {
					catfeedcontainer.innerHTML=catsListArray[p].catTable;
				};
			};
		} else {
			alert(result.error.message);
		};
	};

})();