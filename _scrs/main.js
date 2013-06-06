var map; 
var points = []; 
var markers = []; 
var infowins = [];
var heatmap; 
var genericSearch = true;  	
var language = 'es';
var VIEW_POINTS = 0; 
var VIEW_HEATMAP = 1;  
var visualType; 

function initialize() {
	var center = new google.maps.LatLng(32.842674, -22.675781);
	var options = {
		zoom: 2, 
		center: center, 
		mapTypeId: google.maps.MapTypeId.ROADMAP,  
		panControl: false, 
		zoomControl: false, 
		streetViewControl: false, 
		mapTypeControl: false, 
		scaleControl: true
	} 
	
	map = new google.maps.Map(document.getElementById('map-canvas'),options);
	map.set('styles', [
		{
			featureType:'all', 
			elementType: 'all', 
			stylers: [
				{ visibility: 'simplified' },
				{ hue: '#e8e3da' } , 
				{ gamma: 2 }, 
				{ saturation: 32 }, 
				{ lightness: 20 }
			]
		}, {
			featureType:'water',
			elementType:'geometry',
			stylers: [
				{ color: '#cccccc' },
				{ weight: 1.6 }
			]
		}, {
			featureType:'all',
			elementType:'labels', 
			stylers: [
				{ visibility: 'off' }
			]
		}, {
			featureType:'landscape.natural', 
			elementType:'all',
			stylers: [
				{ color: '#e8e3da' }
			]
		}
	]); 
	
	visualType = VIEW_POINTS; 
	$('.icon#options #pointer').css('color','#ff00f5'); 
}

function selectVisualizationType() {
	$('.icon#options #pointer').click(function() { 
		visualType = VIEW_POINTS; 
		$(this).css('color','#ff00f5'); 
		$('.icon#options #heat').css('color','#fff'); 
	}); 
	
	$('.icon#options #heat').click(function() { 
		visualType = VIEW_HEATMAP; 
		$(this).css('color','#ff00f5'); 
		$('.icon#options #pointer').css('color','#fff'); 
	}); 
}

function alertNoResults() {
	$('.alert#noresults').fadeIn(200).delay(1000).fadeOut(1000);
}

function generateMarkers(tweets) {
	// Remove previous markers and information
	// windows from map 
	for(var i = 0; i < markers.length; i++) {
		if(markers[i]!=null) markers[i].setMap(null); 
		if(infowins[i]!=null) infowins[i].setMap(null); 
	} 
	// Remove previous heatmap 
	if(heatmap!=null && heatmap.getMap()) heatmap.setMap(null); 
	
	var coords; 
	var point; 
	var marker; 
	var text; 
	var info; 
	var prevwin = 0; 
	
	// view as heatmap
	if(visualType==VIEW_HEATMAP) {
		var gradient = [
			'rgba(246,135,31,0)',
			'rgba(246,135,31,1)',
			'rgba(243,113,34,1)',
			'rgba(243,113,34,1)',
			'rgba(242,86,45,1)',
			'rgba(244,71,81,1)',
			'rgba(246,57,115,1)',
			'rgba(250,31,176,1)', 
			'rgba(254,9,234,1)',
			'rgba(254,9,234,1)'
			
			// 'rgba(254,9,234,0)',
			// 'rgba(254,9,234,1)',
			// 'rgba(250,31,176,1)', 
			// 'rgba(246,57,115,1)',
			// 'rgba(244,71,81,1)',
			// 'rgba(242,86,45,1)',
			// 'rgba(243,113,34,1)',
			// 'rgba(243,113,34,1)',
			// 'rgba(246,135,31,1)',
			// 'rgba(246,135,31,1)',
		]; 
		var temp = 0; 
		for(var i = 0; i < tweets.statuses.length; i++) {
			if(i==0) points = []; 
			if(tweets.statuses[i].geo!=null &&
				(tweets.statuses[i].geo.coordinates[0]!=0 &&
				 tweets.statuses[i].geo.coordinates[1]!=0)) {
				// add point to array of points
				coords = tweets.statuses[i].geo.coordinates; 
				point = new google.maps.LatLng(coords[0],coords[1]);
				console.log(temp+" => "+point); 
				points[temp] = point;
				temp+=1;   	
			}
		}
		// create heatmap based on points on array
		heatmap = new google.maps.visualization.HeatmapLayer({
			data: points, 
			radius: 10, 
			gradient: gradient
		}); 
		heatmap.setMap(map); 
		
		if(points.length==0) alertNoResults(); 
		console.log("Heatmap point concentrations: \n"+points); 
	} 
	// view as points
	else {
		for(var i = 0; i < tweets.statuses.length; i++) {
			// Clear previous list of markers and 
			// information windows 
			if(i==0) {
				markers = []; 
				infowins = []; 
			}
			// Add tweets with geolocation to 
			// list and set its marker to map
			if(tweets.statuses[i].geo!=null &&
				(tweets.statuses[i].geo.coordinates[0]!=0 &&
				 tweets.statuses[i].geo.coordinates[1]!=0)) {
				// set marker to map
				coords = tweets.statuses[i].geo.coordinates; 
				point = new google.maps.LatLng(coords[0],coords[1]); 
				marker = new google.maps.Marker({
					position:point, 
					map:map, 
					icon:'_imgs/marker.png', 
					animation: google.maps.Animation.DROP, 
					id: i
				}); 
				
				markers[i] = marker; 
				
				// set info window on map
				text = "\""+tweets.statuses[i].text+"\" by "+
					"<a href=\"http://twitter.com/"+tweets.statuses[i].user.screen_name+"\">@"+tweets.statuses[i].user.screen_name+"</a>"+
					"<br><b>Coords:</b> "+coords[0]+","+coords[1]+
					"<br><b>Lang:</b> "+tweets.statuses[i].lang; 
				info = new google.maps.InfoWindow({
					content:text, 
					position:point
				}); 
				
				infowins[i] = info; 
				
				// connect marker to info window
				google.maps.event.addListener(marker,'click',function() {
					// close previous window and open the one 
					// corresponding to the marker clicked. 
					if(infowins[prevwin]!=null) infowins[prevwin].close(); 
					infowins[this.id].open(map,this); 
					console.log(this.id+"=>"+infowins[this.id].content); 
					prevwin = this.id; 
				}); 
			}
		}
		
		if(markers.length==0) alertNoResults(); 
		console.log("Map markers \n:"+markers); 
	}
}

$(document).ready(function() {
	initialize();
	selectVisualizationType(); 
	var search = $('.search');
	
	// Settings
	$('.icon#settings').click(function() {
		$('.alert#settings').fadeIn(); 
	});
	$('.alert#settings #close').click(function() {
		$('.alert#settings').fadeOut(); 
	}); 
	
	// Seatch entered word
	search.keyup(function(e) {
		if(e.which==13) $('.icon#mag_glass').click(); 
	}); 
	
	$('.icon#mag_glass').click(function() {
		console.log("searching..."); 
		var fetch = 'tweets';
		var word = search.val(); 
		var lang = 'es';  
		$.ajax({
			type:'POST',
			url:'../_app/engine.php', 
			data: {
				fetch: fetch, 
				word: word, 
				lang: lang
			}, 
			success: function(data) {
				if(data!='' || data!=null || !data.length>0) {
					var tweets = jQuery.parseJSON(data);
					console.log(tweets); 
					generateMarkers(tweets); 
				} else {
					alertNoResults();  
				}
			}, 
			error: function (xhr, ajaxOptions, thrownError) {
				console.log(xhr.status);
				console.log(thrownError);
			}
		}); 
	}); 
	
	// Mobile site representation of the app
	$('.get').click(function() {
		window.location='app.html'; 
	}); 
}); 



