var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 4000;

var cookieParser = require('cookie-parser')
app.use(cookieParser())

namess= new Array("balloon", "cat", "dog", "mouse", "fish","rabbit", "hat", "dice", "button", "bat" , "wall")


messages=[]
users={}
online={}
names={}




function make_user() {
	return{
		name: (namess[Math.floor((Math.random() * 10))] + "-" + namess[Math.floor((Math.random() * 10))] + "-" + namess[Math.floor((Math.random() * 10))]),
		color: "FFFFFF",
	}
}



function make_msg(mesg,cookie,date) {
	return {
    	msg: mesg,
    	color: users[cookie]["color"],
    	user: users[cookie]["name"],
    	date: date
  	}
}





app.get('/', function(req, res){
	if (!(req.cookies["cookie"]) || !(req.cookies["cookie"] in users)){
		number=Math.random()*10000
		users[number]= make_user()
		res.cookie("cookie", number)
		res.cookie("name", users[number].name)
		names[users[number].name]=1
	}
  res.sendFile(__dirname + '/index.html');
});



io.on('connection', function(socket){

  socket.on('chat message', function(mesg){
  	recieved=JSON.parse(mesg)
  	d=new Date()
  	time=d.getHours() + ":" + d.getMinutes()
  	mesg=make_msg(recieved["msg"],recieved["user"],time)
  	messages.push(mesg)
  	

    io.emit('chat message', JSON.stringify(mesg));
  });


  socket.on('now online', function(mesg){
  	online[socket.id]=users[mesg]["name"]
  	io.emit('users', JSON.stringify(online));+

  	socket.emit('hist', JSON.stringify(messages))


  })

  socket.on('nickcolor', function(mesg){
  	message=JSON.parse(mesg)
  	users[message["user"]]["color"]=message["msg"]
  })
  socket.on('nick', function(mesg){
  	message=JSON.parse(mesg)
  	if(message["msg"] in names){
  		socket.emit("namebad","no")
  	}
  	else{
  		delete names[users[message["user"]]["name"]]
	  	names[message["msg"]]=1
	  	users[message["user"]]["name"]=message["msg"]
	  	online[socket.id]=message["msg"]
	  	io.emit('users', JSON.stringify(online));
	  	socket.emit("name",message["msg"])
  	}
  })
  socket.on('disconnect', function(){
    delete online[socket.id]
    io.emit('users', JSON.stringify(online));
    console.log("disconnect")

  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
