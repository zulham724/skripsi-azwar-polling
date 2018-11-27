// import libraries
var Gpio = require('pigpio').Gpio;
var led = new Gpio(25,{mode: Gpio.OUTPUT});
var in1 = new Gpio(23,{mode: Gpio.OUTPUT});
var in2 = new Gpio(24,{mode: Gpio.OUTPUT});
var enA = new Gpio(4,{mode:  Gpio.OUTPUT});
var in3 = new Gpio(27,{mode: Gpio.OUTPUT});
var in4 = new Gpio(22,{mode: Gpio.OUTPUT});
var enB = new Gpio(17,{mode: Gpio.OUTPUT});
in1.digitalWrite(1);
in2.digitalWrite(0);
enA.pwmWrite(0);
in3.digitalWrite(0);
in4.digitalWrite(1);
enB.pwmWrite(0);
// ============================
var request = require('request');
var sizeof = require('object-sizeof');
var os = require('os-utils');
// ============================
//declare global variable
var url = "http://skripsi-azwar.ardata.co.id/";
var token = null;
var current_action = null;
var bandwidth = 0;
var cpuUsage = 0;
var memoryUsage = 0;
var interval = 500;

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
				console.log('now we will request data to server with interval ',interval,'ms\n');
				token = body.access_token;
				
				setInterval(()=>{
					
					os.cpuUsage(val=>{
						cpuUsage = val;
					});

					// console.log('requesting data.. \n');

					request.get({
						url:url+'api/users/1',
						json:true,
						headers:{
							Accept:'application/json',
							Authorization:'Bearer '+token
						}
					},function(err,resp,body){
						
						if(!err && resp.statusCode == 200){
							
							bandwidth += sizeof(body);
							memoryUsage = os.totalmem() - os.freemem();
							
							if(current_action != body.message){
							
								if(body.message == 'forward'){
									enA.pwmWrite(255);
									enB.pwmWrite(255);
									led.digitalWrite(1);
								} else if(body.message == 'stop'){
									enA.pwmWrite(0);
									enB.pwmWrite(0);
									led.digitalWrite(0);
								}
								
								var date = new Date();
								
								current_action = body.message;
								
								console.log('New data recieved at ',date.toString(),' with : ',body,'\n','estimate bandwidth used : ',bandwidth,' Bytes \n','estimate cpu usage : ',cpuUsage,'%\n','estimate memory used : ',memoryUsage,' Bytes\n');
								console.log('data will sent to server again, please wait...\n');
								
								request.post({
									url:url+'api/pollings',
									json:true,
									headers:{
										Accept:'application/json',
										Authorization:'Bearer '+token
									},
									body:{
										user_id:1,
										value:body.message,
										date:date.toLocaleString('en-US'),
										bandwidth_usage:bandwidth,
										cpu_usage:cpuUsage,
										memory_usage:memoryUsage
									}
								},function(err,resp,body){
									console.log('result :\n',body,'\n\n');
								});
								
								
							}
						
						}
						
					});
				},interval);
			});
			
		});
		// ==============================================
	
		res.render('index',{title:'Skripsi transmisi data Long Polling'});
	}
}
