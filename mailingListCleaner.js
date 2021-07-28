/* 
mailing LIst Cleaner V.2

this ENTIRE COMMENT SHOULD BE REMOVED BEFORE GOING PUBLIC

SET  VAR isTesting  to use test or production Firebase.


****************************************
			SCRAP Area
****************************************
Fb rules were:
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}


****************************************
			END SCRAP AREA
****************************************

****************************************
			CHANGE LOG
****************************************	
	
****************************************
			TO-DO
****************************************
	put on server SOMEPLACE -- ask Robert
	test to see how long FB connection remains open.  Does client always need to be running in a browser for this to work?
	Change security rules??
	
****************************************	
			LOCATIONS: 
****************************************
the webhook endpoint in FB
https://mailinglistcleanqueue.firebaseio.com/mailinglistcleanqueue.json

 using caddy server + ngrok the web address looks like this:  https://5e4054f3.ngrok.io/ 
 
 on IDX server at  XXXX 
 on minweb server  http://169.254.37.177:8000/cleaner/mailingListCleaner.html

 FIREBASES:
 
 MASTER Email list (being cleaned)  https://mailinglist-74f9e.firebaseio.com/ 
 MASTER clean Queue = cleanQueueMaster is at  https://mailinglistcleanqueue.firebaseio.com/
   Therefore the MASTER webhook endpoint in FB is 
    https://mailinglistcleanqueue.firebaseio.com/cleanQueueMaster.json
 
 
 TEST DB emails being cleaned       https://email-marketing-crm.firebaseio.com/ 
 TEST DB clean Queue                https://api-project-252798108718.firebaseio.com/
  cleanQueueTest.json
  Therefore the TEST webhook endpoint in FB is 
    https://api-project-252798108718.firebaseio.com/cleanQueueTest.json
	
	ALL OF THE ABOVE LINES SHOULD BE REMOVED BEFORE GOING PUBLIC
-----------------------------------------
 */ 
 
  $(function() {
	var isTesting = true; // manually set this here to either true or false
	                       // when testing is true we execute & show console log statements
	var ec = !isTesting ; // when ec is false we execute & show console log statements, if true they are not executed
	
	var projectName = $("title").text();
	var databaseURL; // set in queueSetupForTesting() or queueSetupForProduction();
	var EmailDatabaseURL;
	var EmailCleanQ_LogURL;
	var fbr_webhook_1;  // this a reference to into the DB
	                     // ex: firebase.database().ref("cleanQueueMaster") or cleanQueueTest 
						 //set in Initialize all Firebases
	
 // Initialize all Firebases	 
if (isTesting){   
	queueSetupForTesting();
	//emailListForTesting();
 } else {
	queueSetupForProduction();
	//emailListForProduction();
 }
  
  /*  
   TESTING: for the queue use firebase api-project  and for the database use firebase email-marketing-crm.firebaseapp.com 
   PRODUCTION: the queue use YYY for  and for the database use XXX 
  */
  
  //  ok
function queueSetupForTesting() {
	var theColor = "pink";
     $("h2").text(projectName +  ": TESTING mode");
	 $("html").css( "background", "pink" ); //LightCyan  shows we are in Testing DB
	  //  BurlyWood
	 ec || console.log("START Initialize TESTING Firebase at https://api-project-252798108718.firebaseio.com/ ", moment().format("MM/DD/YY, h:mm:ss a"));
   console.log("START Initialize TESTING ", moment().format("MM/DD/YY, h:mm:ss a"));
   // Initialize Firebase
var config = {
    apiKey: "AIzaSyDMC1mwgMUtb69-mQ9LauTzub59qnzCIRk",
    authDomain: "api-project-252798108718.firebaseapp.com",
    databaseURL: "https://api-project-252798108718.firebaseio.com/",
    projectId: "api-project-252798108718",
    storageBucket: "api-project-252798108718.appspot.com",
    messagingSenderId: "252798108718"
  };
    firebase.initializeApp(config);
	ec || console.log("END Initialize TESTING Firebase at https://api-project-252798108718.firebaseio.com/ ", moment().format("MM/DD/YY, h:mm:ss a") )
    console.log("END Initialize TESTING ", moment().format("MM/DD/YY, h:mm:ss a") );
	window.QueueDataBaseRef = firebase.database().ref(); //use root of db
	// ref was cleanQueueTest now webhook_1
	fbr_webhook_1 = firebase.database().ref("webhook_1"); // use all children of webhook_1
	//window.fbr_webhook_1_log = firebase.database().ref("webhook_1_log"); // use all children of webhook_1_log   
	EmailDatabaseURL = "https://email-marketing-crm.firebaseio.com/";
	EmailCleanQ_LogURL  = "https://api-project-252798108718.firebaseio.com/"
}  
  
  // projectName defaults to contents of #projectName tag in html
function queueSetupForProduction() {	 
	var theColor = "Beige";
	 $("html").css( "background", theColor );
	 ec || console.log("START Initialize Production Firebase at https://mailinglistcleanqueue.firebaseio.com/ ", moment().format("MM/DD/YY, h:mm:ss a"));	  
	console.log("START Initialize Production ", moment().format("MM/DD/YY, h:mm:ss a"));
	// Initialize PRODUCTION cleanqueue Firebase here-- 
	 var config = {
    apiKey: "AIzaSyBlDHxD0m5Yvi9Q7jx89E74xE7o1mMBaQE",
    authDomain: "mailinglistcleanqueue.firebaseapp.com",
    databaseURL: "https://mailinglistcleanqueue.firebaseio.com/",
    projectId: "mailinglistcleanqueue",
    storageBucket: "mailinglistcleanqueue.appspot.com",
    messagingSenderId: "276891529086"
  };
	firebase.initializeApp(config);
	ec || console.log("END Initialize PRODUCTION Firebase at https://mailinglistcleanqueue.firebaseio.com/ ", moment().format("MM/DD/YY, h:mm:ss a") );
	console.log("END Initialize PRODUCTION ", moment().format("MM/DD/YY, h:mm:ss a") );
	window.QueueDataBaseRef = firebase.database().ref();
	// ref was cleanQueueTest now webhook_1
	fbr_webhook_1 = firebase.database().ref("webhook_1");
	EmailDatabaseURL = "https://mailinglist-74f9e.firebaseio.com/";
	EmailCleanQ_LogURL  = "https://mailinglistcleanqueue.firebaseio.com/";
}  
   

   
// END Initialize Firebases
  
  
// GLOBALs inside anonymous Function
//	window.firebaseRef = firebase.database().ref();
  
	/* 		*******************************************
							add event handlers
		*******************************************
	*/	
	
$( "#processQueue" ).on("click", processQueue)	

/* 
		*******************************************
				END add event handlers
		*******************************************
		
  */
  
/*   
		*******************************************
				Start processing logic
		*******************************************
  
 */  
function processQueue(){
	 ec || console.log("processQueue was clicked");
 	//console.log("processQueue was clicked"); 
}

/* 
fbr_webhook_1.once('value', function(dataSnapshot) {
	window.ds = dataSnapshot; //just for testing	
    var n = dataSnapshot.numChildren();
    ec || console.log("n ",n)  
}); 

 */


// top is webhook_1 of DB to get number of children and for triggering child_added 
// to countDown size of Q see:   function success_of_GET for function call to updateQsize.
function ShowQueueSize(){
	//QueueDataBaseRef.once('value', function(dataSnapshot) {
	fbr_webhook_1.once('value', function(dataSnapshot) {
	window.ds = dataSnapshot; //just for testing	
    var n = dataSnapshot.numChildren();
    ec || console.log("n ",n)        
    $("#queueSize").text(n);        
	});
}
ShowQueueSize(); 


// see: https://firebase.google.com/docs/database/admin/retrieve-data
// see also: https://firebase.google.com/docs/reference/js/firebase.database.DataSnapshot
// other options "child_changed" "child_removed"
// consider ref.off("value", originalCallback);
// to remove all callbacks at a location  ref.off("value");  or ref.off();

// when page loads all children in the queue will pass through this point
// see note 1 at end for loading only all children under a given key eg, webhooksTest
// QueueDataBaseRef.on("child_added", function(snapshot, prevChildKey) {
fbr_webhook_1.on("child_added", function(snapshot, prevChildKey) {
	window.theSnap = snapshot; //only for testing
	window.snapVal = snapshot.val();
	var keyOf_childAdded = snapshot.ref.key;
	var theEmailAddress;
	var theEmailStatusCode;
	//ec || console.log(snapVal ,"  prevChildKey ",prevChildKey );

   ec || console.log("snapshot.numChildren(): ", snapshot.numChildren() );
	
	// see if we have: an email request for unsub or a bounce
	
	if( snapVal["requests_unsubscribe"] === undefined ) { // then we have a bounce
		theEmailAddress = getEmailFrom(snapVal);
		theEmailStatusCode  = getEmailStatusCodeFrom(snapVal, theEmailAddress);

	} else {
	 	theEmailAddress = snapVal["requests_unsubscribe"]; // this has the email that is requesting unsub
		snapVal["status"] = "eru"; // there is no status code so create one called eru email requested unsub
		theEmailStatusCode = "eru"; //set the variable 
		
	}
	
	isEmail_inMasterDB(theEmailAddress,theEmailStatusCode)
	// HERE IS BEST PLACE TO REMOVE FROM Q
	removeEmailAddrFromQ(theEmailAddress,theEmailStatusCode,keyOf_childAdded);
	// now update the log
	update_webhook_1_log(theEmailAddress, theEmailStatusCode);
	// below will print all so we can visually verify
	//ec || console.log("theEmailAddress: %s,theEmailStatusCode: %s keyOf_childAdded: %s",theEmailAddress,theEmailStatusCode, keyOf_childAdded)
	
});	
 
 /* 
Try to extract email. first from final-recipient, then original-recipient.
If neither has an email, then return a default of Robert.Gorman@Idx-Data.com  
*/
function getEmailFrom(snapVal){
     ec ||console.log("getEmailFrom(snapVal) ",snapVal);
	var original_recipient = snapVal["original-recipient"]
	var final_recipient =  snapVal["final-recipient"]
	var theEmail;  // default set at end of function. "Robert.Gorman@Idx-Data.com";
	// extraction rules -- note this depends on format and data that Mailparser sends us. 
	if ( !_.isEmpty(final_recipient) ){
	  theEmail = final_recipient.split(";")[1];
	 return theEmail.trim();
	}

	if ( !_.isEmpty(original_recipient) ){
	  theEmail = original_recipient.split(";")[1];
	 return theEmail.trim();
	}
	// Could not find an email so we return the default email -- to keep downstream logic simple
		theEmail = "Robert.Gorman@Idx-Data.com";
	return theEmail.trim();
}

function getEmailStatusCodeFrom(snapVal,theEmailAddress){
	//ec || console.log("snapVal status   ", snapVal["status"])
	var statusCodeNumber = false; // our default
	var emailStatusText =  snapVal["status"]; 
	if (emailStatusText){
		var stringPart = emailStatusText.split(" ")[1]; // it may look like this: "4.7.1\n blah blah"
		statusCodeNumber = (stringPart.split("\n")[0]).trim(); // now we have a pure string-number
		//ec || console.log("statusCodeNumber ",statusCodeNumber);
		return statusCodeNumber;
	}
	ec || console.log("statusCodeNumber unknown_Status for email: ", theEmailAddress);
	return "unknown_Status";
} // end getEmailStatusCodeFrom
/* 
Use this idea to examine individual codes and return good or bad 
it uses the strman libray method of containsAny
 badCodes=["5.7.1", "5.7.2"]; must be a list of all bad codes
 emailStatusText = "Status: 5.7.1 \nSMPT 2344.more stuff";  //  example of emailStatusText
  ec || console.log(  _s.containsAny(statusString,badCodes)    );  // will return true if our string contains any of the bad codes

 */

 // all codes are considered bad -- that is hard delete from DB.
 // However, SOME codes may not be THAT bad and so we only mark them.  those codes are on exception list
function isEmailStatusCodeBad(theEmailStatusCode, theEmailAddress){
	var isBadCode; // true or false
	  // for List approach to work we must give a list of ALL BAD codes
	  //var badCodeExceptionList = ["X.X.X" ,"Y.Y.Y", "  etc "];  // what are possible good codes
      // usage:    _s.containsAny(theEmailStatusCode,badCodeExceptionList);
	
	// every code that has a 2 in first position is Good 
	var rule1 = theEmailStatusCode.charAt(0) == "2"  // 
	var rule2 = theEmailStatusCode = "eru"; // this was an email requested delete
        	 // catches specific good codes
			// if ANY RULE is true then it is an OK code.   to add more rules use: || ruleXX
	if (rule1 || rule2 ){
		isBadCode = false;
	} else {
		isBadCode = true;
	}
	ec || console.log("theEmailStatusCode: %s  theEmailAddress: %s  isBadCode: %s ", theEmailStatusCode, theEmailAddress, isBadCode);
return isBadCode;
}

 
 
 
 


// idea is  First we GET to see if email is in DB.  On Success, we then do a PUT with the original data from the Get + the unsubDate

// input theEmailAddress,theStatus      if TRUE, then post as unsubed.  if false then just remove from Q-db
function isEmail_inMasterDB(theEmailAddress,theEmailStatusCode){
	// EmailDatabaseURL was set in queueSetupFor...();  note it url ends with .com/ 
	 var key = CryptoJS.MD5(theEmailAddress).toString();
	 var myEmaildatabaseURL = EmailDatabaseURL + key + "/.json" // note necessary additions to the URL; 
	 //ec || console.log("isEmail: myEmaildatabaseURL: %s theEmailAddress %s,key %s", myEmaildatabaseURL, theEmailAddress, key);
	
	$.ajax({
     url: myEmaildatabaseURL,  // note how url was contructed above.  it has the key to the email of interest
     type: "GET",
     success: success_of_GET, // ALWAYS Comes here, result is null WHEN get fails
     error: function(error) {
       ec || console.log("error: "+error);
     }
   });
   
/* 
 1. functions below are inside scope of function isEmail_inMasterDB. that way we can access the 
	value of theEmailAddress, theEmailStatusCode
 2. test status code to see if we should unsub or really delete the record. To delete put null DataObject 
  
 3. ec || console.log("theEmailAddress %s theEmailStatusCode %s isEmailStatusCodeBad: %s",theEmailAddress,theEmailStatusCode, isEmailStatusCodeBad(theEmailStatusCode) 	)	 
   
 */
		function success_of_GET(result){
			var updateWithThisDataObject;
			if( result !== null){
				ec || console.log(result);
			} else {
			ec || console.log("success_ofGet_then called: null result means not in DB. email %s result was: %s", theEmailAddress, result);
			} 
			updateQsize();
			if (result === null){
				//ec || console.log("no record in emailDB. nothing more we can do. bail out");
				return false;
			}  
			// if bad status code, then to delete the record put a null object for data 
			
			// setup for the PUT which will add the unSubDate to the email object
				var unSubDate = moment().format("MM/DD/YY, h:mm:ss a");
				var theEmail = result["Email"];   // Email is the property name in the email Master DB
				var key = CryptoJS.MD5(theEmail).toString();
				var myEmaildatabaseURL = EmailDatabaseURL + key + "/.json" ;
				   
					updateWithThisDataObject = result;
					updateWithThisDataObject["unSubDate"] = unSubDate;
					updateWithThisDataObject["theEmailStatusCode"] = theEmailStatusCode;
			
			if(isEmailStatusCodeBad(theEmailStatusCode, theEmailAddress)){
				//updateWithThisDataObject = null;
				doDelete();
			} else {
				doPut();
			}
			
		ec || console.log("updateWithThisDataObject: %s  theEmailAddress: %s ,theEmailStatusCode: %s charAt(0) is: %s ", updateWithThisDataObject, theEmailAddress,theEmailStatusCode, theEmailStatusCode.charAt(0) );	 
				
		// do the PUT
		function doPut(){
			$.ajax({
				url: myEmaildatabaseURL,  
				type: "PUT",  // use put, note -- can use get to see what is there
				dataType: "json", //added 05/05/16
				data: JSON.stringify(updateWithThisDataObject),
				success: success_ofPUT,
				error: function(xhr, textStatus, errorThrown) {
						ec || console.log("PUT error: %s, theEmailAddress: %s ,theEmailStatusCode: %s ", error, theEmailAddress, theEmailStatusCode);
						ec || console.log(xhr, textStatus, errorThrown);
						}
			});
		}	

	   //added 05/05/16  do the Delete
	   function doDelete(){
		   ec || console.log("starting do delete ",moment().format("MM/DD/YY, h:mm:ssss a") );
		   $.ajax({
				url: myEmaildatabaseURL,  
				type: "DELETE",  // use put, note -- can use get to see what is there
				dataType: "json", //added 05/05/16
				data: JSON.stringify(updateWithThisDataObject),
				success: function (data, textStatus, xhr) { ec || console.log("from doDelete:  data: %s textStatus: %s xhr: %s", data, textStatus, xhr) },
				error: function(xhr, textStatus, errorThrown) {
						ec || console.log("PUT error: %s, theEmailAddress: %s ,theEmailStatusCode: %s ", error, theEmailAddress, theEmailStatusCode);
						ec || console.log(xhr, textStatus, errorThrown);
						}
			});
	   }
	
				
		function success_ofPUT(result){
		  ec || console.log("success_ofPUT: theEmailAddress %s, theEmailStatusCode %s ", theEmailAddress, theEmailStatusCode); // note result contains all of these fields unless it was null;
		}// end success_ofPUT
 	
}  // end success_of_GET	
	
	
	
	
} // END isEmail_inMasterDB	

function removeEmailAddrFromQ(theEmailAddress,theEmailStatusCode,keyOf_childAdded) {
	firebase.database().ref("webhook_1/"+ keyOf_childAdded).remove();
	//ec || console.log("to do: removeEmailAddrFromQ");
} 


function update_webhook_1_log(theEmailAddress, theEmailStatusCode){
	var withThisDataObject = {};
	var theDate  = moment().format("-x YY_MM_DD_h:mm:ss:SSS a") ;// moment().format("YY_MM_DD_h:mm:ss:SSS a");
	var key = CryptoJS.MD5(theEmailAddress).toString();
	// withThisDataObject["key"] = key;
	// withThisDataObject["date"] = theDate;  // date is part of the key so we do not need to make it a property/value
	withThisDataObject["statusCode"] = theEmailStatusCode; // for testing -> Math.floor(Math.random() * 10);
	withThisDataObject["Email"] = theEmailAddress;
			// root of the log is:  "webhook_1_log/  key for each record is: theDate + +new Date(). need ending =  +new Date() to be certain all date keys are different.  
   //
	firebase.database().ref("webhook_1_log/"+theDate ).update(withThisDataObject);  //key theDate then and catch could go here or use ",success function name" after first argument of "withThisDataObject"
	ec || console.log("update log withThisDataObject ",withThisDataObject );
}


function updateQsize(){
    var qSize = $("#queueSize").text(); 
	qSize = +(qSize); //parseInt
	qSize = qSize-1  < 0? 0 : qSize-1; // make sure we do not go negative
	$("#queueSize").text( qSize); 
	ec || console.log("to do: removeEmailAddrFromQ.  NOTE qSize - 1 is: ", qSize, qSize-1)
} 
 
 
	
	
/*   
		*******************************************
				END processing logic
		*******************************************
  
 */	
	
  }); // end of ready anonymous function   

  
  
  
// ALL LINES FORM HERE TO THE END SHOULD BE REMOVED BEFORE GOING PUBLIC  
  // $(function() {  }); // end of ready anonymous function   
//********************************************************************************
	
	/* 	NOTE 1   loading only all children under a given key eg, webhooksTest
============================================
 // top is webhook_1 DB to get number of children and for triggering child_added 
 fbr_webhook_1.on("child_added", function(snapshot, prevChildKey) {
  window.snapVal = snapshot.val();
  ec || console.log(snapVal,"  prevChildKey ",prevChildKey);
	var akey = _.keys(snapVal);
	var aval = _.values(snapVal);
	ec || console.log( "the email address:", snapVal["email_address"] );   ///note snapVal
});	

fbr_webhook_1.once('value', function(dataSnapshot) {
	window.ds1 = dataSnapshot; //just for testing	
    var n = dataSnapshot.numChildren();
    ec || console.log("n ",n, ds1);        
    $("#queueSize").text(n);        
	});
===========================================

/* 	NOTE 2   Mailparser  notes

Diagnostic codes listed here:

http://help.pardot.com/customer/portal/articles/2128156-bounce-codes-reference  <--BEST
http://www.rfc-editor.org/rfc/rfc1123.txt

complete:  http://www.rfc-editor.org/rfc/rfc3463.txt

http://www.serversmtp.com/en/smtp-error

http://www.greenend.org.uk/rjk/tech/smtpreplies.html

http://www.rfc-editor.org/rfc/rfc1893.txt

http://www.rfc-editor.org/rfc/rfc2034.txt

https://www.authsmtp.com/faqs/faq-25.html

The traditional SMTP bounce reasons are three-digit codes (e.g., 550). The enhanced SMTP bounce responses are three-digits separated by decimal points (e.g., 5.1.1). You may see both in the bounce reasons for a given email campaign. 




for email of interest look for:
  To:
 Original-Recipient:  rfc822; brian@marcelhensley.net OR
 Final-Recipient:     rfc822; brian@marcelhensley.net

Then maybe Look at Diagnostic code
 List-Unsubscribe: <mailto:Robert.Gorman@Idx-Data.com?subject=unsubscribe-ashaki@nhp-reit.com>
 
 
 See last page of emails the FIRST Fwd unsubscribe paula.parks@sothebysinternationalrealty.com
...  Mailparse  ParsedData gives no useful information
 
 For reason look at
 Action:  failed
 Status   4.0.0
 Subject:  Undelivered Mail Returned to Sender
 
 
----
 Subject: Bounce 2 12 pm est.... 
 Subject: Delivery Status Notification (Failure) 
 Diagnostic-Code smtp; The email account that you tried to reach is disabled.
 Diagnostic-Code: smtp; 550 5.1.1 <dspangler@strategicrealtyla.com> Recipient not found == mailbox does not exist:
Diagnostic-Code: smtp; 550-5.7.1 [198.206.133.90 18] Our system hasdetected that this message is 550-5.7.1 likely suspicious due to the very
low reputation of the sending IP 550-5.7.1 address.
 
 
 Final-Recipient: rfc822; hollybyerly@ubgrealestate.com
Action: failed
Status: 5.0.0  or 5.1.10 or 5.1.1   5.7.1(likely unsolicited mail)
  510/511  Bad email address.

  5.4.1  no answer from host  Recipient address rejected: Access denied

---------

 */