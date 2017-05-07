var cool = require('cool-ascii-faces');
var express = require('express');
var app = express();
var requestModule = require("request");

var bodyParser = require('body-parser')


/*app.configure(function(){
	app.use(express.bodyParser());

});*/

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.get('/cool', function(request, response){
 response.send(cool());
});

app.post('/test', function(request, response){

   console.log("test post");

   response.send(request.body);

});

var http = require('http');

var options = {
  host: 'https://vest-mesa-47056.herokuapp.com',
  port: 80,
  path: '/test'
};

app.get('/test', function(request, response){
   console.log("test get");


 requestModule({
     url: 'https://vest-mesa-47056.herokuapp.com/test',
     qs: {access_token:"token123"},
     method: 'POST',
     json: {
       recipient: {id:"001"},
       message: "teste",
     }
   }, function(error, response, body) {
     if (error) {
       console.log('Error sending message: ', error);
     } else if (response.body.error) {
       console.log('Error: ', response.body.error);
     }
 });

 response.send("test request");

});


app.get('/wk', function (req, res) {

  console.log("wk2");

  if (req.query['hub.verify_token'] === 'token123') {
      console.log("token correto");
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong validation token');
});

app.post('/wk', function (req, res) {

  console.log("post wk");
  console.log(req.body);
  messaging_events = req.body.entry[0].messaging;
  for (i = 0; i < messaging_events.length; i++) {

    event = req.body.entry[0].messaging[i];
    sender = event.sender.id;

    if (event.postback) {
       text = JSON.stringify(event.postback);
       sendTextMessage(sender, "Postback received: "+text.substring(0, 200), token);
       continue;
    }
    if (event.message && event.message.text) {
      text = event.message.text;
      console.log(text);
      // Handle a text message from this sender
      if (text === 'opcoes') {
      	sendGenericMessage(sender);
      	continue;
      }else {
      	 sendTextMessage(sender, "Text received, echo: "+ text.substring(0, 200));
      }



    }
  }

  res.sendStatus(200);

});


token = "needed get from Facebook"

function sendTextMessage(sender, text) {


  console.log("SEND function");

  messageData = {
    text:text
  }

  requestModule({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:token},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: messageData,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  });
}


function sendGenericMessage(sender) {

messageData2 = {
	"attachment": {
		"type": "template",
		"payload": {
			"template_type": "button",
			"text": "Select an option",
			"buttons":[
				{
					"type":"postback",
					"title":"Option 01",
					"payload":"op01"
				},
				{
					"type":"postback",
					"title":"Option 02",
					"payload":"op02"
				},
				{
					"type":"web_url",
					"url":"www.google.com",
					"title":"Get Help"
				}	
			]
		}
	}
};
  messageData = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [{
          "title": "First card",
          "subtitle": "Element #1 of an hscroll",
          "image_url": "http://messengerdemo.parseapp.com/img/rift.png",
          "buttons": [{
            "type": "web_url",
            "url": "https://www.messenger.com/",
            "title": "Web url"
          }, {
            "type": "postback",
            "title": "Postback",
            "payload": "Payload for first element in a generic bubble",
          }],
        },{
          "title": "Second card",
          "subtitle": "Element #2 of an hscroll",
          "image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
          "buttons": [{
            "type": "postback",
            "title": "Postback",
            "payload": "Payload for second element in a generic bubble",
          }, {
            "type": "postback",
            "title": "Postback",
            "payload": "NOVO",
          }],
        }]
      }
    }
  };
  requestModule({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:token},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: messageData2,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  });
}



app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


