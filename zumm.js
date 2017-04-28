(function ($) {
	window.onload = function(e) {
		var init, W, H;
		var map_width_offset = 0;//200;
		var body;
		var html;
		var infowindow;
		var map_centered = true;
		var loading_pos = {x:280/2, y:226/2};
		var circle_small;
		var circle_large;
		var pos;
		var act_frame = "loading";
		var prev_frame = "loading";
		var frames = ["enter", "reg", "regcomp1", "regcomp2", "camp1", "camp2", "camp3", "game", "hive"];
		var slide_base_scale = {width:752, height:1336};
		var cover_alpha_targ = 0.6;
		var tween_time = 0.6;
		var ease = Sine.EaseInOut;
		var padding = 20;
		var video;
		var overlay = false;
		var white = true;
		var panorama;
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
			goto_hive:{
				x:200,
				y:200,
				pos:"bottom_right"
			},
			goto_map:{
				x:30,
				y:200,
				pos:"bottom_left"
			},
		}
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
			

			
		}();
		function startVideo(fade){
			if(map && !panorama){
				map.getStreetView();
				panorama = map.getStreetView();
		          // Set up Street View and initially set it visible. Register the
		          // custom panorama provider function.
		          var panoOptions = {
		            position: pos,
		            disableDefaultUI: true,
		            visible: true/*,
		            panoProvider: getCustomPanorama*/
		          };
		          panorama.setOptions(panoOptions);
		          var streetviewService = new google.maps.StreetViewService();
		          var radius = 50;
		          streetviewService.getPanoramaByLocation(pos, radius,
	              function(result, status) {
	                console.log("1", arguments);
	            if (status == google.maps.StreetViewStatus.OK) {
	              // We'll monitor the links_changed event to check if the current
	              // pano is either a custom pano or our entry pano.
	              google.maps.event.addListener(panorama, 'links_changed', function() {
	                  console.log("2", arguments);
	                  //createCustomLinks(result.location.pano);
	              });
	              google.maps.event.addListener(panorama, 'position_changed', function() {
	                console.log('panorama.getPosition()', panorama.getPosition());
	              });
	              google.maps.event.addListener(panorama, 'pov_changed', function() {
	              });
	            }
	          });
			}
			/*var constraints = { audio: false, video: { width: 1280, height: 720 } };
			navigator.mediaDevices.getUserMedia(constraints)
			.then(function(mediaStream) {
			  video.srcObject = mediaStream;
			  video.onloadedmetadata = function(e) {
			  	video.play();
			  };
			})
			.catch(function(err) { console.log(err.name + ": " + err.message); }); //
			if(fade){
				$.tween("video", tween_time, {autoAlpha:1, ease:ease});
			}else{
				 //video.play();
			}*/
			

			/*var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
			var cameraStream;

			getUserMedia.call(navigator, {
			    audio: false, video: { width: 1280, height: 720 }
			}, function (stream) {
			    
			    Here's where you handle the stream differently. Chrome needs to convert the stream
			    to an object URL, but Firefox's stream already is one.
			    
			    if (window.webkitURL) {
			        video.src = window.webkitURL.createObjectURL(stream);
			    } else {
			        video.src = stream;
			    }

			    //save it for later
			    //cameraStream = stream;

			    video.play();
			});
			if(fade){
				$.tween("video", tween_time, {autoAlpha:1, ease:ease});
			}else{
				 //video.play();
			}*/
		}
		function stopVideo(){
			$.tween("video", tween_time, {autoAlpha:0, ease:ease, onComplete:function(){/*video.stop();*/}});	
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
			$.set("get_game", {x:524, y:1164, width:166, height:166});
			startVideo(false);

			for(var i = 0; i < frames.length; i++)
			{
				$.set(frames[i], {autoAlpha:0});
			}
			
			var buttons = document.getElementsByClassName("button");
			for(var i = 0; i < buttons.length; i++)
			{
				buttons[i].addEventListener("click", buttonClicked);
			}
			startApp();

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
			if(infowindow){
				centerMap();
			}
		};
		function startApp(){
			
			newFrame("enter");
			//startMarkers();
		}
		function buttonClicked(e){
			var name_arr = e.target.id.split("_");
			newFrame(name_arr[1]);
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
					stopVideo();
				break;
				case "map":
					removeMarkers();
				break;
				default:
					need_white = true;
				break;
			}
			$.tween(prev_frame, tween_time, {autoAlpha:0, ease:ease});
			switch(act_frame){
				case "game":
					showMarkers();
					need_overlay = true;
					need_white = false;
					startVideo(true);
				break;
				case "map":
					need_overlay = true;
					need_white = false;
					showMarkers();

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
				$.tween("overlay", tween_time, {delay:tween_time*0.7, autoAlpha:1, ease:ease});
			}
			if(white && !need_white){
				white = false;
				$.tween("cover", tween_time, {autoAlpha:0, ease:ease});
				$.set("map", {webkitFilter:"blur(0px)"});
			}
			if(!white && need_white){
				white = true;
				$.tween("cover", tween_time, {delay:tween_time*0.7, autoAlpha:cover_alpha_targ, ease:ease});
				$.set("map", {webkitFilter:"blur(5px)"});
			}
		}
	    /*


	    Map

	    */

	    var map;
	    var markers = [
			{
				icon: 'img/main_marker.png',
	        	type: 'own',
	        	text: "Vitu bácsi"
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
		function centerMap(){
			map_centered = true;
			map.panTo(infowindow.position);
		}
		function removeMarkers(){
			for(var i = 0; i < markers.length; i++){
				markers[i].marker.setMap(null);
			}
		}
		function showMarkers(){
			createMarkers();
		}
		function createMarkers(){
			

			var radius = 0.003;
      		for (var i = 0; i < markers.length; i++){
      			console.log(pos.lat()+" "+ pos.lng());
      			random_pos = new google.maps.LatLng(
      				pos.lat()-radius/2+Math.random()*radius,
      				pos.lng()-radius/2+Math.random()*radius
      			);
      			markers[i].marker = new MarkerWithLabel({
          			map: map,
            		position: !i ? pos : random_pos,
            		icon: markers[i].icon,
            		animation:google.maps.Animation.DROP,
            		draggable: true,
       				raiseOnDrag: true,
       				labelContent:markers[i].text,
            		
            		labelClass: "labels",
            		labelAnchor: new google.maps.Point(150,-15)
            	});
      		}
      		cirle_small = new google.maps.Circle({
	            strokeColor: '#00FF00',
	            strokeOpacity: 0,
	            strokeWeight: 1,
	            fillColor: '#FF0000',
	            fillOpacity: 0.2,
	            map: map,
	            center: infowindow.position,
	            radius: 15
	        });
	        markers.push({marker:cirle_small});
	        cirle_large = new google.maps.Circle({
	            strokeColor: '#FF0000',
	            strokeOpacity: 0,
	            strokeWeight: 1,
	            fillColor: '#FF0000',
	            fillOpacity: 0.2,
	            map: map,
	            center: infowindow.position,
	            radius: 24
	        });
	        markers.push({marker:cirle_large});
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
	            infowindow = {position: pos};
	            
	      		
	      		//startApp();
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

	        var infowindow = new google.maps.InfoWindow(options);
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