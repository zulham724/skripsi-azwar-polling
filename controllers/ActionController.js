// import libraries
var gpio = require('onoff').Gpio;
var pin2 = new gpio(2,'out');
// ============================
var request = require('request');
// ============================
//declare global variable
var url = "http://skripsi-azwar.ardata.co.id/";
var token = null;
var current_action = null;

// setup module
module.exports = {
	get: function(req,res){
		// do something
		console.log('please wait passport security on proccess');
		request.get({
			url:url+'api/clients/2',
			json:true
		},function(err,resp,body){
			
			console.log('secret client ready! \n\n',body.secret,'\n\n');
			
			request.post({
				url:url+'oauth/token',
				json:true,
				body:{
					grant_type:'password',
					client_id:'2',
					client_secret:body.secret,
					username:'admin@admin.com',
					password:'password'
				}
			},function(err,resp,body){
				console.log('token ready! \n\n',body.access_token,'\n\n');
				token = body.access_token;
				
				setInterval(()=>{
					// console.log('requesting data.. \n');
					request.get({
						url:url+'api/users/1',
						json:true,
						headers:{
							Accept:'application/json',
							Authorization:'Bearer '+token
						}
					},function(err,resp,body){
						
						if(current_action != (body.data != null ? body.data.name : null)){
							
							if(body.data.name == 'forward'){
								pin2.writeSync(1);
							} else if(body.data.name == 'stop'){
								pin2.writeSync(0);
							}
							
							var date = new Date();
							current_action = body.data.name;
							console.log('New data recieved at ',date.toString(),' with : ',current_action,'\n');
							console.log('data will sent to server again, please wait...');
							
							request.post({
								url:url+'api/pollings',
								json:true,
								headers:{
									Accept:'application/json',
									Authorization:'Bearer '+token
								},
								body:{
									user_id:1,
									value:body.data.name,
									date:date.toLocaleString()
								}
							},function(err,resp,body){
								console.log('result :\n',body);
							});
							
							
						}
						
					});
				},1000);
			});
			
		});
		// ==============================================
	
		res.render('index',{title:'Skripsi transmisi data Long Polling'});
	}
}
