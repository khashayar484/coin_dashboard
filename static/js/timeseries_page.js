
////////////////////////// PARTICLE ENGINE ////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

var ParticleEngine = (function() {
	'use strict';

	function ParticleEngine(canvas_id) {
		// enforces new
		if (!(this instanceof ParticleEngine)) {
			return new ParticleEngine(args);
		}
		
		var _ParticleEngine = this;

		this.canvas_id = canvas_id;
		this.stage = new createjs.Stage(canvas_id);
		this.totalWidth = this.canvasWidth = document.getElementById(canvas_id).width = document.getElementById(canvas_id).offsetWidth;
		this.totalHeight = this.canvasHeight = document.getElementById(canvas_id).height = document.getElementById(canvas_id).offsetHeight;
		this.compositeStyle = "lighter";

		this.particleSettings = [{id:"small", num:300, fromX:0, toX:this.totalWidth, ballwidth:3, alphamax:0.4, areaHeight:.5, color:"#F0F0F0", fill:false}, 
								{id:"medium", num:100, fromX:0, toX:this.totalWidth,  ballwidth:8, alphamax:0.3, areaHeight:1, color:"#C0C0C0", fill:true}, 
								{id:"large", num:10, fromX:0, toX:this.totalWidth, ballwidth:30,  alphamax:0.2, areaHeight:1, color:"#A0A0A0", fill:true}];
		this.particleArray = [];
		this.lights = [{ellipseWidth:400, ellipseHeight:100, alpha:0.6, offsetX:0, offsetY:0, color:"#D0D0D0"}, 
						{ellipseWidth:350, ellipseHeight:250, alpha:0.3, offsetX:-50, offsetY:0, color:"#B8B8B8"}, 
						{ellipseWidth:100, ellipseHeight:80, alpha:0.2, offsetX:80, offsetY:-50, color:"#F8F8F8"}];

		this.stage.compositeOperation = _ParticleEngine.compositeStyle;


		function drawBgLight()
		{
			var light;
			var bounds;
			var blurFilter;
			for (var i = 0, len = _ParticleEngine.lights.length; i < len; i++) {				
				light = new createjs.Shape();
				light.graphics.beginFill(_ParticleEngine.lights[i].color).drawEllipse(0, 0, _ParticleEngine.lights[i].ellipseWidth, _ParticleEngine.lights[i].ellipseHeight);
				light.regX = _ParticleEngine.lights[i].ellipseWidth/2;
				light.regY = _ParticleEngine.lights[i].ellipseHeight/2; 
				light.y = light.initY = _ParticleEngine.totalHeight/2 + _ParticleEngine.lights[i].offsetY;
				light.x = light.initX =_ParticleEngine.totalWidth/2 + _ParticleEngine.lights[i].offsetX;

				blurFilter = new createjs.BlurFilter(_ParticleEngine.lights[i].ellipseWidth, _ParticleEngine.lights[i].ellipseHeight, 1);
				bounds = blurFilter.getBounds();
				light.filters = [blurFilter];
				light.cache(bounds.x-_ParticleEngine.lights[i].ellipseWidth/2, bounds.y-_ParticleEngine.lights[i].ellipseHeight/2, bounds.width*2, bounds.height*2);
				light.alpha = _ParticleEngine.lights[i].alpha;

				light.compositeOperation = "screen";
				_ParticleEngine.stage.addChildAt(light, 0);

				_ParticleEngine.lights[i].elem = light;
			}

			TweenMax.fromTo(_ParticleEngine.lights[0].elem, 10, {scaleX:1.5, x:_ParticleEngine.lights[0].elem.initX, y:_ParticleEngine.lights[0].elem.initY},{yoyo:true, repeat:-1, ease:Power1.easeInOut, scaleX:2, scaleY:0.7});
			TweenMax.fromTo(_ParticleEngine.lights[1].elem, 12, { x:_ParticleEngine.lights[1].elem.initX, y:_ParticleEngine.lights[1].elem.initY},{delay:5, yoyo:true, repeat:-1, ease:Power1.easeInOut, scaleY:2, scaleX:2, y:_ParticleEngine.totalHeight/2-50, x:_ParticleEngine.totalWidth/2+100});
			TweenMax.fromTo(_ParticleEngine.lights[2].elem, 8, { x:_ParticleEngine.lights[2].elem.initX, y:_ParticleEngine.lights[2].elem.initY},{delay:2, yoyo:true, repeat:-1, ease:Power1.easeInOut, scaleY:1.5, scaleX:1.5, y:_ParticleEngine.totalHeight/2, x:_ParticleEngine.totalWidth/2-200});
		}
		
		var blurFilter;
		function drawParticles(){

			for (var i = 0, len = _ParticleEngine.particleSettings.length; i < len; i++) {
				var ball = _ParticleEngine.particleSettings[i];

				var circle;
				for (var s = 0; s < ball.num; s++ )
				{
					circle = new createjs.Shape();
					if(ball.fill){
						circle.graphics.beginFill(ball.color).drawCircle(0, 0, ball.ballwidth);
						blurFilter = new createjs.BlurFilter(ball.ballwidth/2, ball.ballwidth/2, 1);
						circle.filters = [blurFilter];
						var bounds = blurFilter.getBounds();
						circle.cache(-50+bounds.x, -50+bounds.y, 100+bounds.width, 100+bounds.height);
					}else{
						circle.graphics.beginStroke(ball.color).setStrokeStyle(1).drawCircle(0, 0, ball.ballwidth);
					}
					
					circle.alpha = range(0, 0.1);
					circle.alphaMax = ball.alphamax;
					circle.distance = ball.ballwidth * 2;
					circle.ballwidth = ball.ballwidth;
					circle.flag = ball.id;
					_ParticleEngine.applySettings(circle, ball.fromX, ball.toX, ball.areaHeight);
					circle.speed = range(2, 10);
					circle.y = circle.initY;
					circle.x = circle.initX;
					circle.scaleX = circle.scaleY = range(0.3, 1);

					_ParticleEngine.stage.addChild(circle);
					

					animateBall(circle);

					_ParticleEngine.particleArray.push(circle);
				}
			}	
		}

		this.applySettings = function(circle, positionX, totalWidth, areaHeight)
		{
			circle.speed = range(1, 3);
			circle.initY = weightedRange(0, _ParticleEngine.totalHeight , 1, [_ParticleEngine.totalHeight * (2-areaHeight/2)/4, _ParticleEngine.totalHeight*(2+areaHeight/2)/4], 0.8 );
			circle.initX = weightedRange(positionX, totalWidth, 1, [positionX+ ((totalWidth-positionX))/4, positionX+ ((totalWidth-positionX)) * 3/4], 0.6);
		}

		function animateBall(ball)
		{
			var scale = range(0.3, 1);
			var xpos = range(ball.initX - ball.distance, ball.initX + ball.distance);
			var ypos = range(ball.initY - ball.distance, ball.initY + ball.distance);
			var speed = ball.speed;
			TweenMax.to(ball, speed, {scaleX:scale, scaleY:scale, x:xpos, y:ypos, onComplete:animateBall, onCompleteParams:[ball], ease:Cubic.easeInOut});	
			TweenMax.to(ball, speed/2, {alpha:range(0.1, ball.alphaMax), onComplete:fadeout, onCompleteParams:[ball, speed]});	
		}	

		function fadeout(ball, speed)
		{
			ball.speed = range(2, 10);
			TweenMax.to(ball, speed/2, {alpha:0 });
		}

		drawBgLight();
		drawParticles();
	}

	ParticleEngine.prototype.render = function()
	{
		this.stage.update();
	}

	ParticleEngine.prototype.resize = function()
	{
		this.totalWidth = this.canvasWidth = document.getElementById(this.canvas_id).width = document.getElementById(this.canvas_id).offsetWidth;
		this.totalHeight = this.canvasHeight = document.getElementById(this.canvas_id).height = document.getElementById(this.canvas_id).offsetHeight;
		this.render();

		for (var i= 0, length = this.particleArray.length; i < length; i++)
		{
			this.applySettings(this.particleArray[i], 0, this.totalWidth, this.particleArray[i].areaHeight);
		}

		for (var j = 0, len = this.lights.length; j < len; j++) {
			this.lights[j].elem.initY = this.totalHeight/2 + this.lights[j].offsetY;
			this.lights[j].elem.initX =this.totalWidth/2 + this.lights[j].offsetX;
			TweenMax.to(this.lights[j].elem, .5, {x:this.lights[j].elem.initX, y:this.lights[j].elem.initY});			
		}
	}

	return ParticleEngine;

}());


////////////////////////UTILS//////////////////////////////////////
//////////////////////////////////////////////////////////////////

function range(min, max)
{
	return min + (max - min) * Math.random();
}
		
function round(num, precision)
{
   var decimal = Math.pow(10, precision);
   return Math.round(decimal* num) / decimal;
}

function weightedRange(to, from, decimalPlaces, weightedRange, weightStrength)
{
	if (typeof from === "undefined" || from === null) { 
	    from = 0; 
	}
	if (typeof decimalPlaces === "undefined" || decimalPlaces === null) { 
	    decimalPlaces = 0; 
	}
	if (typeof weightedRange === "undefined" || weightedRange === null) { 
	    weightedRange = 0; 
	}
	if (typeof weightStrength === "undefined" || weightStrength === null) { 
	    weightStrength = 0; 
	}

   var ret
   if(to == from){return(to);}
 
   if(weightedRange && Math.random()<=weightStrength){
	  ret = round( Math.random()*(weightedRange[1]-weightedRange[0]) + weightedRange[0], decimalPlaces )
   }else{
	  ret = round( Math.random()*(to-from)+from, decimalPlaces )
   }
   return(ret);
}


var particles
(function(){
	particles = new ParticleEngine('projector');
	createjs.Ticker.addEventListener("tick", updateCanvas);
	window.addEventListener('resize', resizeCanvas, false);

	function updateCanvas(){
		particles.render();
	}

	function resizeCanvas(){
		particles.resize();
	}
}());

///////////////// RUN CODE //////////////////////////
//////////////////////////////////////////////////////

var display_id = ""

function create_option(text,value) {
		}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function create_button(data) {
	const buttons = document.createElement("button");
	const aas = document.createElement("a");
	var next_page_button = document.getElementById("next_page_id")
	var linkText = document.createTextNode(" NEXT ");

	buttons.setAttribute("class" , "myButton")
	buttons.setAttribute("id" , "send_file_id")
	aas.appendChild(linkText)
	buttons.appendChild(aas)
	buttons.style.borderRadius = '42px'
	
	next_page_button.appendChild(buttons)

}

function select_feature_target(){
	var target = document.getElementById("select_id_1")
	var feature = document.getElementById("select_id_0")

	return [feature.value, target.value]
}

function send_data(data, file) {
	var [feature,target] = select_feature_target()
	var file_name = realfilebtn.value.match( /[\/\\]([\w\d\s\.\-\(\)]+)$/)[1]
	datas = JSON.stringify(data)

	if (feature !== "__" &&  target !== "__") {
		$.ajax({
		url: 'send_files',
		type:'POST',
		data : {'feature':feature, 'target' : target , "inputdata" : datas, 'filename' : file_name},
		
		success: function(data){
		console.log("---------->  OK !! <200>", data.response)
		if (data.response == "OK") {
			// alert("ok")
			location.href = "http://127.0.0.1:5000/timeseries/timeseries_page2"
		}else{
			alert("somthing went wrong :((")
		}
		}
		})
	}else{
		alert("fill target and label columns")
	}

}

function send_data_PAI(data, file) {
	var [feature,target] = select_feature_target()
	const formData = new FormData();
	formData.append( 'file' , file )

	if (feature !== "__" &&  target !== "__") {
		const metadata = JSON.stringify({
            target_column: target,
            value_column: feature
        })

	formData.append('metadata', metadata )
	const controller = new AbortController();
	var signal = controller.signal
	let timmy = setTimeout(function(){
			controller.abort()
	}, 2500)

	fetch("http://157.90.194.54:3000/api/v1/newtransaction"  , {
		method : "post",
		signal: signal,
		body : formData
	
	}).then(function(response){
		return response.json()
	}).then(function(text){
		display_id = Object.values(text)
		// alert(display_id)
		sessionStorage.setItem("display_id",display_id);
		setTimeout(()=>{
			location.href = "http://127.0.0.1:5000/timeseries/page2"
		}, 3000)

	})
	}else{
		alert("fill target and label columns")
		
	}

}


function clearDOM() {
	array = ['feature_id', 'target_id' , 'button_id', 'next_page_id']
	for (let index = 0; index < array.length; index++) {
		$(`#${array[index]}`).empty();
	}
};

function select_appearnce(columns) {
	var array = ['feature_id' , 'target_id']
	var p_tag_text = ['Select Datetime' , 'Select Value']
	var input_data_headers = ["__", ...columns]
	
	for (let index = 0; index < array.length; index++) {
		
		var feature = document.getElementById(array[index])
		const selectList1 = document.createElement("select");

		const p_tags = document.createElement("p");
		p_tags.style.color = "white"
		p_tags.style.fontFamily = "times new roman"
		p_tags.style.fontsize = '20px'

		var text = document.createTextNode(p_tag_text[index]);
		p_tags.appendChild(text) 
		feature.appendChild(p_tags);

		selectList1.setAttribute("id" , `select_id_${index}`)
		selectList1.style.color = 'white';
		selectList1.style.width = '180px';
		selectList1.style.height = "30px"
		selectList1.style.fontFamily = "times new roman"
		selectList1.style.borderRadius = "10px"
		selectList1.style.backgroundColor = '#525c84'
		// selectList1.style.float = 'left'

		feature.appendChild(selectList1);

		for (let index = 0; index < input_data_headers.length; index++) {
			var option = document.createElement("option");
			if (input_data_headers[index] == `__`) {
				option.value = "__"
				option.text = "select smth.."
				option.disabled = true
				option.selected = true
			}else{
				option.value = input_data_headers[index];
				option.text = input_data_headers[index];
			}
			selectList1.appendChild(option);
		}
	}
}

function read_csv(file) {
	return new Promise(resolve => {
		let cols;
		Papa.parse(file , {
			download : true,
			header : true,
			complete: function(results) {
				var array = []
			
				cols = Object.keys(results['data'][0])
				array[0] = cols

				for (let index = 0; index < Object.values(results['data']).length -1; index++) {
					var element = Object.values(results['data'][index]);
					array[index+1] = element
				}
				resolve((array))
			}
		} )
	})
}

function read_excel(file) {
	return new Promise(resolve => {
		readXlsxFile(file).then(function (data) {
			cols = data[0]
			resolve(data)
		})
	})
}

async function columns_apperance(input_file, callback) {
	const myArray = input_file.value.split(".")
	const filetype = myArray[myArray.length - 1]
	const file = input_file.files[0]
		
	data = ""
	if (filetype == 'csv' || filetype == 'txt') {
		data = await  read_csv(file)
		return data

	}
	else if (filetype == 'xlsx'){
		data = await  read_excel(file)
		return data
	}else{
	return data 
	}
}

const realfilebtn = document.getElementById("upload_file")
const custombtn = document.getElementById("custom_button")
const customtxt = document.getElementById("custom_text")

custombtn.addEventListener("click" , function() {
	realfilebtn.click()
});

// when value changes then do something 

realfilebtn.addEventListener("change" , function(){
	if (realfilebtn.value) { // if file is real 
		const file = realfilebtn.files[0]
		console.log("-----------------> check is it file or not " , file)
		if (document.getElementById("feature_id").querySelector("#select_id_0")){
		clearDOM()
		}
		let data =  columns_apperance(realfilebtn)
		data.then((result) => {
			var input_headers = result[0]
			select_appearnce(input_headers)
			create_button(data = result)
			var buttons = document.getElementById("send_file_id")
			buttons.addEventListener("click" , function(){

			// send_data_PAI(data, file) // connect to server !!!
			send_data(data , file)
			
		})
			// show_table(data = result, columns = input_headers) not now
			customtxt.innerHTML = realfilebtn.value.match( /[\/\\]([\w\d\s\.\-\(\)]+)$/)[1]
			customtxt.style.fontFamily = "times new roman"
		})
	}else{
		customtxt.innerHTML = "No File Chosen, yet."
	}
});

