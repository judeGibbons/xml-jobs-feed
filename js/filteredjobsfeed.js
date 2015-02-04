var recruitmentfeeduniquenamespace = (function () {
	 
	//set up variables and objects
	var feedcontainer;
	var feedurl = "http://staffrecruitment.coventry.ac.uk/RSS/UniversityVacancies.xml";
	var feedlimit = 150; // CHANGE TO NUMBER OF JOBS YOU WANT IN FEED
	var categoriesListArray = [];
	var alljobsArray = [];
	var activeArray = [];
	var vacanciesTable = "";
	var selectMenu;
	var selectedCategory = "alljobs";
	var menuItem = "";

	//set up the category object
	function categoryObject(nameid,namestring,categoryArray,menuItem) {
		this.nameid = nameid;
		this.namestring = namestring;
		this.categoryArray = categoryArray;
		this.menuItem = menuItem;

		categoriesListArray.push(this);
	};

	//list out categories 
	var academic = new categoryObject("academic", "Academic", [], "academic");
	var hpl = new categoryObject("hpl", "Hourly Paid Lecturer", [], "hourly paid lecturing");
	var profservices = new categoryObject("profservices", "Professional Services", [], "professional, administration and clerical");
	var research = new categoryObject("research", "Research", [], "research");
	var ressup = new categoryObject("ressup", "Research Support", [], "research support");
	var snrmgt = new categoryObject("snrmgt", "Senior Management", [], "senior management and VC's group");
	var studentemp = new categoryObject("studentemp", "Student Employment", [], "student employment");
	
	//attach listener to category dropdown filter
	function addListenerToCategorySelector() {
		if (document.getElementById("jobcategory").addEventListener) {
			document.getElementById("jobcategory").addEventListener('change', categoryFilter, false);
		} else {
		if (document.getElementById("jobcategory").attachEvent) {
			document.getElementById("jobcategory").attachEvent('onchange', categoryFilter);
			};
		};
	};

	//set up category dropdown filter
	function categoryFilter() {
		selectMenu = document.getElementById("jobcategory");
		selectedCategory = selectMenu.options[selectMenu.selectedIndex].value;
		createTable(selectedCategory);
	};

	//call functions onload
	window.onload=function() {
		document.getElementById('jobcategory').options[0].selected = true;
		rssfeedsetup();
		addListenerToCategorySelector();
	};

	//bring in xml
	function rssfeedsetup() {
		var jobsfeed = new google.feeds.Feed(feedurl+"?t="+new Date().getTime());
		jobsfeed.setResultFormat(google.feeds.Feed.XML_FORMAT);
		jobsfeed.setNumEntries(feedlimit);
		jobsfeed.load(displayfeed);
	};

	//set up sort on job title
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
		    var items = result.xmlDocument.getElementsByTagName('item'),
		    //content = document.getElementById('content'),
			//itemArray = [],
			itemsArray = [];
			
			//set up the 'Item' object 
			function itemObject(title,link,department,reference,category,salary,minsalary,closingdate,closingdateObject) {
				this.title = title;
				this.link = link;
				this.department = department;
				this.reference = reference;
				this.category = category;
				this.salary = salary;
				this.minsalary = minsalary;
				this.closingdate = closingdate;
				this.closingdateObject = closingdateObject;

				itemsArray.push(this);
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
		    //and make item a new object, pushing to alljobsArray and relevant categoryArray
		    for (var i=0, maxi=items.length; i<maxi; i++) {

		    	//console.log(items[i].getElementsByTagName("category")[0].innerHTML);


				var item = items[i],
				titleElement = item.getElementsByTagName("title")[0],
				linkElement = item.getElementsByTagName("link")[0];


				if (item.getElementsByTagName("job:reference")[0]) {
					var referenceElement = item.getElementsByTagName("job:reference")[0],
					departmentElement = item.getElementsByTagName("job:location")[0],
					salaryElement = item.getElementsByTagName("job:salary")[0],
					closingdateElement = item.getElementsByTagName("job:closingdate")[0],
					minsalaryElement = item.getElementsByTagName("job:minsalary")[0],
					categoryElement = item.getElementsByTagName("job:category")[0];

				} else {
					var referenceElement = item.getElementsByTagName("reference")[0],
					departmentElement = item.getElementsByTagName("location")[0],
					salaryElement = item.getElementsByTagName("salary")[0],
					closingdateElement = item.getElementsByTagName("closingdate")[0],
					minsalaryElement = item.getElementsByTagName("minsalary")[0],
					categoryElement = item.getElementsByTagName("category")[0];
				};
	

				var title = checkElementChildren(titleElement),
				link = checkElementChildren(linkElement),
				reference = checkElementChildren(referenceElement),
				department = checkElementChildren(departmentElement),
				salary = checkElementChildren(salaryElement),
				closingdate = checkElementChildren(closingdateElement),
				minsalary = checkElementChildren(minsalaryElement),
				category = checkElementChildren(categoryElement),
				closingdateObject;

				//console.log(categoryElement);

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
				
				//for each item in feed, make a new object, filter on each category and push to different arrays
				var newItemObject = new itemObject(title,link,department,reference,category,salary,minsalary,closingdate,closingdateObject);
				alljobsArray.push(newItemObject);
				for (var l=0, maxl=categoriesListArray.length; l<maxl; l++) {
					if (newItemObject.category == categoriesListArray[l].namestring) {
						categoriesListArray[l].categoryArray.push(newItemObject);
					};
				};


			}; //END OF ITEM LOOP

							//make activeArray from one of the categoryArrays and push into table rows


			createTable(selectedCategory); //only called on windowload
		} else {
			alert(result.error.message);
		};
	};

	//make activeArray from one of the categoryArrays and push into table rows
	function createTable(selectedCategory) {
		if (selectedCategory == "alljobs") {
			activeArray = alljobsArray;
		} else {
			for (var m=0, maxm=categoriesListArray.length; m<maxm; m++) {
				if (selectedCategory == categoriesListArray[m].nameid) {
					//combine research and ressup categoryArrays into one array
					if (categoriesListArray[m].nameid == "research") {
						activeArray = research.categoryArray.concat(ressup.categoryArray);
					} else {
						activeArray = categoriesListArray[m].categoryArray;
					}
					menuItem = categoriesListArray[m].menuItem;
				};
			};
		};
		activeArray = activeArray.sort(sortOnTitle);

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
			vacanciesTable="<p class='standalonepara nojobs'>There are currently no " + menuItem + " jobs available.<\/p>";
		} else {
			vacanciesTable="<table><thead><tr><th>Job title<\/th><th>Salary<\/th><th>Closing date<\/th><\/tr><\/thead><tbody>" + rssoutput + "<\/tbody><\/table>";
		};
		feedcontainer.innerHTML=vacanciesTable;
	};

})();

