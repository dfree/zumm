(function ($) {
	window.onload = function(e) {
		var init, W, H;
		var map_width_offset = 0;//200;
		var body;
		var html;
		var bee_pos;
		var map_centered = true;
		var loading_pos = {x:280/2, y:226/2};
		var circle_small;
		var circle_large;
		var pos;
		var act_frame = "loading";
		var prev_frame = "loading";
		var frames = ["enter", "reg", "regcomp1", "regcomp2", "camp1", "camp2", "camp3", "mapper", "game", "hive"];
		var slide_base_scale = {width:752, height:1336};
		var cover_alpha_targ = 0.6;
		var tween_time = 0.6;
		var ease = Sine.EaseInOut;
		var padding = 20;
		var video;
		var overlay = false;
		var white = true;
		var panorama;
		var panorama_changed = false;
		var game_view = "game";//map

		var overlay_positions = {
			goto_menu:{
				x:30,
				y:30,
				pos:"top_left"
			},
			goto_profile:{
				x:200,
				y:30,
				pos:"top_right"
			},
			move:{
				x:200,
				y:200,
				pos:"bottom_right"
			},
			lets_mapper:{
				x:30,
				y:200,
				pos:"bottom_left"
			},
			lets_game:{
				x:30,
				y:200,
				pos:"bottom_left"
			},
		}
		var pano;
		init = function() {
			video = document.getElementById('video');
			TweenPlugin.activate([CSSPlugin]);
			TweenLite.ticker.fps(24);
			reset();
			
			
			body = document.body;
			html = document.documentElement;
			body.onresize = resize;
			resize();
			initializeMap();
			main = $.id("main");
			main.style.display = "block";
			body.addEventListener("mousedown", function(event) {
				if(event.target.classList.contains("widget-scene-canvas")){
					console.log("hit_map");
					panorama_changed = false;
				}else{
					panorama_changed = true;
				}
				
			   	console.log(event.target);
			});
			body.addEventListener("mouseup", function(event) {
			   console.log("up "+event.target);
			   if(!panorama_changed){
			   		console.log("mooooove");
			   		startRide();
			   }
			});
			body.addEventListener("keydown", function(evt){
			    var keyCode = (evt.which?evt.which:(evt.keyCode?evt.keyCode:0))
			    //alert(keyCode);
			    console.log("keypress "+keyCode);
			});
		}();
		function difference(link) {
			return Math.abs(pano.pov.heading%360 - link.heading);
		}
		function Move(){
			startRide();
			  var curr;
			  for(i=0; i < pano.links.length; i++) {
			    var differ = difference(pano.links[i]);
			    if(curr == undefined) {
			      curr = pano.links[i];
			    }

			    if(difference(curr) > difference(pano.links[i])) {
			      curr = curr = pano.links[i];
			    }
			  }
			  pano.setPano(curr.pano);
		}
		function startPanorama(fade){
			if(map && !panorama){
				map.getStreetView();
				pano = panorama = map.getStreetView();
		          // Set up Street View and initially set it visible. Register the
		          // custom panorama provider function.
		          var panoOptions = {
		            position: pos,
		            disableDefaultUI: true,
		            motionTracking: true,
      				//motionTrackingControl: true,
      				enableCloseButton: false
		            /*,
		            panoProvider: getCustomPanorama*/
		          };
		          panorama.setOptions(panoOptions);
		          var streetviewService = new google.maps.StreetViewService();
		          var radius = 50;
		          streetviewService.getPanoramaByLocation(pos, radius,
	              function(result, status) {
	            if (status == google.maps.StreetViewStatus.OK) {

	              google.maps.event.addListener(panorama, 'links_changed', function() {
	                  console.log("links_changed", arguments);
	                  //createCustomLinks(result.location.pano);
	              });
	              google.maps.event.addListener(panorama, 'position_changed', function() {
	                console.log('panorama.getPosition()', panorama.getPosition());
	                setBeePosition(panorama.getPosition());

	              });
	              google.maps.event.addListener(panorama, 'pov_changed', function() {
	              	panorama_changed = true;
	              });
	            }
	          });
			}
			if(map && panorama){
				panorama.setVisible(true);
			}
			
		}
		function stopPanorama(){
			panorama.setVisible(false);
			//$.tween("video", tween_time, {autoAlpha:0, ease:ease, onComplete:function(){/*video.stop();*/}});	
		}
		function reset() {
			$.set("map", {webkitFilter:"blur(5px)"});
			$.set("overlay", {autoAlpha:0});
			$.set("video", {autoAlpha:0});
			//$.set("bat_3", {x:205, y:19, scaleX:0.2, scaleY:0.2, alpha:0});
			$.set("cover", {backgroundColor:"#FFFFFF", autoAlpha:1});
			$.set("gif", {x:-400/2+loading_pos.x, y:160});
			$.set("enter_name", {x:114, y:509});
			$.set("enter_pass", {x:114, y:588});
			$.set("goto_reg", {x:114, y:598, width:518, height:70});
			$.set("goto_regcomp1", {x:114, y:674, width:518, height:70});
			$.set("goto_game", {x:293, y:784, width:166, height:166});
			$.set("goto_regcomp2", {x:524, y:1164, width:166, height:166});
			$.set("goto_camp1", {x:524, y:1164, width:166, height:166});
			$.set("goto_camp2", {x:524, y:1164, width:166, height:166});
			$.set("goto_camp3", {x:524, y:1164, width:166, height:166});
			$.set("go_game", {x:524, y:1164, width:166, height:166});
			$.set("get_game", {x:368, y:1092, width:166, height:166});

			startPanorama(false);

			for(var i = 0; i < frames.length; i++)
			{
				$.set(frames[i], {autoAlpha:0});
			}
			
			var buttons = document.getElementsByClassName("button");
			for(var i = 0; i < buttons.length; i++)
			{
				buttons[i].addEventListener("click", buttonClicked);
			}
			//startApp();

		};
		function resize() {
			var W = map_width_offset + Math.max( body.scrollWidth, body.offsetWidth, 
			                       html.clientWidth, html.scrollWidth, html.offsetWidth );


			var H = Math.max( body.scrollHeight, body.offsetHeight, 
			                       html.clientHeight, html.scrollHeight, html.offsetHeight );
			$.set("map", {width:W, height:H});
			$.set("cover", {width:W, height:H});
			$.set("loading", {x:W/2-loading_pos.x, y:H/2-loading_pos.y});
			$.set("gif", {alpha:1});
			$.set("video", {x:0, y:0});
			video.width = W;
			video.height = H;
			var scal = H/slide_base_scale.height;


			var slides = document.getElementsByClassName("slide");
			for(var i = 0; i < slides.length; i++)
			{
				$.set(slides[i], {scaleX:scal, scaleY:scal});
			}


			var center = document.getElementsByClassName("center");
			for(var i = 0; i < center.length; i++)
			{
				var _x = (W*(1/scal)/2-slide_base_scale.width/2);
				$.set(center[i], {x:_x});
			}
			var _x;
			var _y;

			for(var butt in overlay_positions){
				console.log(butt+" "+overlay_positions[butt])
				switch (overlay_positions[butt].pos){
					case "top_left":
						_x = overlay_positions[butt].x*scal;
						_y = overlay_positions[butt].y*scal;
					break;
					case "top_right":
						_x = W-overlay_positions[butt].x*scal;
						_y = overlay_positions[butt].y*scal;
					break;
					case "bottom_right":
						_x = W-overlay_positions[butt].x*scal;
						_y = H-overlay_positions[butt].y*scal;
					break;
					case "bottom_left":
						_x = overlay_positions[butt].x*scal;
						_y = H-overlay_positions[butt].y*scal;
					break;
				}
				$.set(butt, {x:_x, y:_y, scaleX:scal, scaleY:scal, transformOrigin:"0 0"});
			}
			if(bee_pos){
				centerMap(bee_pos);
			}
		};
		function startApp(){
			
			newFrame("enter");
			//startMarkers();
		}
		function buttonClicked(e){
			/*switch(e.target.id){
				case "gameswitcher":
					if(game_view == "game"){
						newFrame("map");
					}else{
						newFrame("game");
					}
				break;
				default:
					var name_arr = e.target.id.split("_");
					newFrame(name_arr[1]);
				break;
			}*/
			if(e.target.id == "move"){
				Move();
				console.log("move");
			}else{
				var name_arr = e.target.id.split("_");
				newFrame(name_arr[1]);
			}
		}
		function switchView(frame){
			if(frame == "mapper"){
				$.set("lets_game", {autoAlpha:1});
				$.set("lets_mapper", {autoAlpha:0});
				markers[1].marker.setMap(map);
			}else{
				$.set("lets_mapper", {autoAlpha:1});
				$.set("lets_game", {autoAlpha:0});
				if(markers[1].marker){
					markers[1].marker.setMap(null);
				}
				
			}
		}
		function newFrame(act){
			console.log("newFrame("+act+")");
			prev_frame = act_frame;
			act_frame = act;
			var need_overlay = false;
			var need_white = false;
			switch(prev_frame){
				case "loading":
					$.tween("cover", 1, {delay:tween_time/2, autoAlpha:cover_alpha_targ, ease:ease});
					$.tween("loading", tween_time/2, {autoAlpha:0, ease:ease});
				break;
				case "game":
					stopBeeAnim();
				break;
				default:
					need_white = true;

				break;
			}

			$.tween(prev_frame, tween_time, {autoAlpha:0, ease:ease});
			switch(act_frame){
				case "game":
					$.delay(0.4, showMarkers);
					need_overlay = true;
					need_white = false;
					startPanorama(true);
					switchView(act_frame);
					startBeeAnim();
				break;
				case "mapper":
					need_overlay = true;
					need_white = false;
					showMarkers();
					stopPanorama();
					switchView(act_frame);
				break;
				default:
					need_white = true;
				break;
			}
			//$.tween("loading", 0.5, {autoAlpha:0});
			
			$.tween(act_frame, tween_time, {delay:tween_time*0.7, autoAlpha:1, ease:ease});
			
			if(overlay && !need_overlay){
				overlay = false;
				$.tween("overlay", tween_time, {autoAlpha:0, ease:ease});
			}
			if(!overlay && need_overlay){
				overlay = true;
				$.tween("overlay", tween_time, {autoAlpha:1, ease:ease});
			}
			if(white && !need_white){
				white = false;
				$.tween("cover", tween_time, {autoAlpha:0, ease:ease});
				$.set("map", {webkitFilter:"blur(0px)"});
			}
			if(!white && need_white){
				white = true;
				$.tween("cover", tween_time, {autoAlpha:cover_alpha_targ, ease:ease});
				$.set("map", {webkitFilter:"blur(5px)"});
			}
		}

		/*

		//Bee

		*/
		function setBeePosition(_pos){
			bee_pos = _pos;
            map.setCenter(bee_pos);
            if(markers[1].marker){
            	markers[1].marker.setPosition(bee_pos);
            	circle_small.setCenter(bee_pos);
            	circle_large.setCenter(bee_pos);
            }
            //bee_marker = bee_pos;
            checkPickables();
            showMarkers();
		}
		var bee_state = "dive";
		var bee_x = 37;
		var bee_y = 182;

		function startBeeAnim(){
			$.set("bee_container", {x:bee_x, y:bee_y});
			bee_state = "rise";
			beeFly();
		}
		function stopBeeAnim(){
			$.kill("bee_contaier");
		}
		function beeRide(){
			bee_state = "ride";
			beeFly();
		}
		function beeFly(){
			var _x = bee_x;
			var _y = bee_y;
			var _c_rota = 0;
			var _delay = 0;
			var ride_plus = {x:250, y:200, rotation:22};
			var _scal = 1;
			var _time = 1+Math.random()*0.6;
			if(bee_state == "dive"){
				bee_state = "rise"
			}else if(bee_state == "rise"){
				_x = bee_x-5-5*Math.random();
				_y = bee_y+40+40*Math.random();
				_c_rota = 4;
				bee_state = "dive"
			}else if(bee_state == "ride"){
				_x = bee_x-5-5*Math.random()+ride_plus.x;
				_y = bee_y+40+40*Math.random()+ride_plus.y;
				_c_rota = ride_plus.rotation;
				_delay = 0.3;
				bee_state = "rise";
				_scal = 0.5;
				$.tween("bee_container", _delay, {x:_x, y:_y, scaleX:_scal, scaleY:_scal, rotation:_c_rota, ease:Power1.easeOut});
				// reset values
				_x = bee_x;
				_y = bee_y;
				_c_rota = 0;
				_scal = 1;
				_time = 0.4;
				console.log("RIDE");
			}

			$.tween("bee_container", _time, {delay:_delay, x:_x, y:_y, scaleX:1, scaleY:1, rotation:_c_rota*Math.random(), ease:Sine.easeInOut, onComplete:beeFly});
		}
	    /*


	    Map

	    */

	    var map;
	    var markers = [
			{
				icon: 'img/main_marker.png',
	        	type: 'own',
	        	text: "HIVE"
		    },
		    {
				icon: 'img/bee_marker.png',
	        	type: 'own',
	        	text: "Vitu's Bee"
		    },
		    {
				icon: 'img/marker_0.png',
	        	type: 'own',
	        	text: "Strawberry Cinema"
		    },
		    {
				icon: 'img/marker_0.png',
	        	type: 'own',
	        	text: "Strawberry Cinema"
		    },
		    {
				icon: 'img/marker_0.png',
	        	type: 'own',
	        	text: "Strawberry Cinema"
		    },
		    {
				icon: 'img/marker_0.png',
	        	type: 'own',
	        	text: "Strawberry Cinema"
		    },
		    {
				icon: 'img/marker_0.png',
	        	type: 'own',
	        	text: "Strawberry Cinema"
		    },
		    {
				icon: 'img/marker_0.png',
	        	type: 'own',
	        	text: "Strawberry Cinema"
		    },
		    {
				icon: 'img/marker_0.png',
	        	type: 'own',
	        	text: "Strawberry Cinema"
		    },
		    {
				icon: 'img/marker_0.png',
	        	type: 'own',
	        	text: "Strawberry Cinema"
		    }
		];
		var pickables = [
			{
				icon: 'img/coin_marker.png',
				active: 'img/coin_active_marker.png',
	        	type: 'own',
	        	text: "1 Coin"
		    },
		    {
				icon: 'img/coin_marker.png',
				active: 'img/coin_active_marker.png',
	        	type: 'own',
	        	text: "1 Coin"
		    },
		    {
				icon: 'img/coin_marker.png',
				active: 'img/coin_active_marker.png',
	        	type: 'own',
	        	text: "1 Coin"
		    }
		    
		   
		];
		function checkPickables(){
			if(pickables[0].marker){
				for(var i = 0; i < pickables.length; i++){
					//markers[i].marker.setMap(null);
					var dist = getDistance(bee_pos, pickables[i].marker.position);
					
					if(dist < 23){
						if(!pickables[i].ready){
							pickables[i].marker.setIcon(pickables[i].active);
							pickables[i].ready = true;
						}
					}else if(pickables[i].ready){
						pickables[i].marker.setIcon(pickables[i].icon);
						pickables[i].ready = false;
					}
				}
			}
		}
		var rad = function(x) {
		  	return x * Math.PI / 180;
		};

		var getDistance = function(p1, p2) {
		  	var R = 6378137; // Earth’s mean radius in meter
		  	var dLat = rad(p2.lat() - p1.lat());
		  	var dLong = rad(p2.lng() - p1.lng());
		  	var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		    Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
		    Math.sin(dLong / 2) * Math.sin(dLong / 2);
		  	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		  	var d = R * c;
		  	return d; // returns the distance in meter
		};
		function centerMap(){
			map_centered = true;
			map.panTo(bee_pos.position);
		}
		function removeMarkers(){
			for(var i = 0; i < markers.length; i++){
				markers[i].marker.setMap(null);
			}
			for(var i = 0; i < pickables.length; i++){
				pickables[i].marker.setMap(null);
			}
		}
		function startRide(){
			beeRide();
			removeMarkers();
		}
		function showMarkers(){
			createMarkers();
		}
		function createMarkers(){
			

			var radius = 0.003;
      		for (var i = 0; i < markers.length; i++){
      			//console.log(pos.lat()+" "+ pos.lng());
      			random_pos = new google.maps.LatLng(
      				pos.lat()-radius/2+Math.random()*radius,
      				pos.lng()-radius/2+Math.random()*radius
      			);
      			if(!markers[i].marker){
	      			markers[i].marker = new MarkerWithLabel({
	          			map: map,
	            		position: !i ? pos : random_pos,
	            		icon: markers[i].icon,
	            		animation:google.maps.Animation.DROP,
	            		/*draggable: true,
	       				raiseOnDrag: true,*/
	       				labelContent:markers[i].text,
	            		
	            		labelClass: "labels",
	            		labelAnchor: new google.maps.Point(150,-15)
	            	});
	      		}else{
	      			markers[i].marker.setMap(map);
	      		}
      		}
      		for (var i = 0; i < pickables.length; i++){
      			//console.log(pos.lat()+" "+ pos.lng());
      			random_pos = new google.maps.LatLng(
      				pos.lat()-radius/4+Math.random()*radius/2,
      				pos.lng()-radius/4+Math.random()*radius/2
      			);
      			if(!pickables[i].marker){
	      			pickables[i].marker = new MarkerWithLabel({
	          			map: map,
	            		position: random_pos,
	            		icon: pickables[i].icon,
	            		animation:google.maps.Animation.DROP,
	       				labelContent:pickables[i].text,
	            		
	            		labelClass: "labels",
	            		labelAnchor: new google.maps.Point(150,-15)
	            	});
	      		}else{
	      			pickables[i].marker.setMap(map);
	      		}
      		}
      		if(!circle_small){
	      		circle_small = new google.maps.Circle({
		            strokeColor: '#00FF00',
		            strokeOpacity: 0,
		            strokeWeight: 1,
		            fillColor: '#FF0000',
		            fillOpacity: 0,
		            map: map,
		            center: bee_pos.position,
		            radius: 15
		        });
		        markers.push({marker:circle_small});
		        circle_large = new google.maps.Circle({
		            strokeColor: '#FF0000',
		            strokeOpacity: 0,
		            strokeWeight: 1,
		            fillColor: '#FF0000',
		            fillOpacity: 0.2,
		            map: map,
		            center: bee_pos.position,
		            radius: 24
		        });
		        markers.push({marker:circle_large});
		    }
		    if(act_frame == "game" && markers[1].marker){
		    	markers[1].marker.setMap(null);
		    }
		    
		}
	    function initializeMap() {
	        var myOptions = {
	          zoom: 20,
	          mapTypeId: 'satellite',
	          disableDefaultUI: true,
	        };

	        map = new google.maps.Map(document.getElementById('map'),
	            myOptions);
	        map.setTilt(45);
	        // Try HTML5 geolocation
	        if(navigator.geolocation) {
	          navigator.geolocation.getCurrentPosition(function(position) {
	            pos = new google.maps.LatLng(position.coords.latitude,
	                                             position.coords.longitude);
	            bee_pos = {position: pos};
	            
	      		
	      		startApp();
	      		//createMarkers();
		        map.addListener('drag', function() {
		        	map_centered = false;
		        });
	            map.setCenter(pos);
	          }, function() {
	            handleNoGeolocation(true);
	          });
	        } else {
	          // Browser doesn't support Geolocation
	          handleNoGeolocation(false);
	        }
	      }

	      function handleNoGeolocation(errorFlag) {
	        if (errorFlag) {
	          var content = 'Error: The Geolocation service failed.';
	        } else {
	          var content = 'Error: Your browser doesn\'t support geolocation.';
	        }

	        var options = {
	          map: map,
	          position: new google.maps.LatLng(47.684717, 17.623706200000015),
	          content: content
	        };

	        var bee_pos = options.position;
	        map.setCenter(options.position);
	    }
	};
})({
	id: function(name){
		return document.getElementById(name);
	},
	delay: function(time, func, props){
		var prp = props || [];
		TweenLite.delayedCall(time, func, prp);
	},
	from: function(name, time, props){
		return TweenLite.from(typeof name === 'string' ? this.id(name) : name, time, props);
	},
	tween: function(name, time, props){
		return TweenLite.to(typeof name === 'string' ? this.id(name) : name, time, props);
	},
	to: function(name, time, props){
		return this.tween(name, time, props);
	},
	set: function(name, props){
		return TweenLite.set(typeof name === 'string' ? this.id(name) : name, props);
	},
	create: function(name, parent, props, src){
		var elem = document.createElement(src ? 'img' : 'div');
		var par = typeof parent === 'string' ? this.id(parent) : parent;
		if(src){
			elem.src = src;
		}
		elem.id = name;
		par.appendChild(elem);
		props = props || {};
		this.set(elem, props);
		return elem;
	},
	kill: function(name){
		return TweenLite.killTweensOf(typeof name === 'string' ? this.id(name) : name);
	}
});