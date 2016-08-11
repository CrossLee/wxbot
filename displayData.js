var mongojs = require('mongojs')
var dbG = mongojs('mongodb://localhost/Vikvon',['theGroup'])
var theData = dbG.theGroup.find()
// document.write(theData)
while (theData.hasNext()) {
	document.write(theData.next());
}