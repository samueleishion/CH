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
	var center = new google.maps.LatLng(18.842674, -18.675781);
	var options = {
		zoom: 1, 
		center: center, 
		mapTypeId: google.maps.MapTypeId.ROADMAP,  
		panControl: false, 
		streetViewControl: false, 
		mapTypeControl: false, 
		scaleControl: true, 
		zoomControl: true, 
		zoomControlOptions: {
			style: google.maps.ZoomControlStyle.LARGE, 
			position: google.maps.ControlPosition.RIGHT_CENTER
		}
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
	
	$('.options .icon#pointer').css('color','#ff00f5'); 
    $('.myView').css('top','-'+$(document).height()+'px'); 
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

function bringToFront(view) {
    view.animate({
        top:'0px'
    },1000,function() {}); 
}

function generateMarkers(tweets) {
	// Remove previous markers and information
	// windows from map 
	for(var i = 0; i < markers.length; i++) {
		if(markers[i]!=null) markers[i].setMap(null); 
		if(infowins[i]!=null) infowins[i].setMap(null); 
	} 
	
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
		console.log(markers); 
	}
}

function alertNoResults() {
    alert("There were no results found."); 
}

$(document).ready(function() {
    initialize(); 
    selectVisualizationType(); 
	var search = $('.search');
    search.width($(document).width-120+'px'); 
    
    // Settings
    $('.icon#settings').click(function() { 
        bringToFront($('.alert#settings')); 
    }); 

    // Random word
	$('.icon#random').click(function() {
		console.log("searching...");  
		var fetch = 'random'; 
		var lang = 'es'; 
		$.ajax({
			type:'POST', 
			url:'http://ch.benova.net/_app/engine.php', 
			data: {
				fetch: fetch, 
				lang: lang
			}, 
			success: function(data) {
				search.val(data); 
				$('.icon#mag_glass').click(); 
			}, 
			error: function (xhr, ajaxOptions, thrownError) {
				$('.alert#loading').hide(); 
				console.log(xhr.status);
				console.log(thrownError);
			}
		}); 
	}); 
    
    // Search entered word
	search.keyup(function(e) {
		if(e.which==13) $('.icon#mag_glass').click(); 
	}); 
	
	$('.icon#mag_glass').click(function() {
		console.log("searching..."); 
		$('.alert#loading').fadeIn(); 
		var fetch = 'tweets';
		var word = search.val(); 
		var lang = 'es';  
		$.ajax({
			type:'POST',
            url:'http://ch.benova.net/_app/engine.php', 
            async: false, 
			data: {
				fetch: fetch, 
				word: word, 
				lang: lang
			}, 
			success: function(data) {
				$('.alert#loading').hide(); 
				if(data!='' || data!=null || !data.length>0) {
					var tweets = jQuery.parseJSON(data);
					console.log(tweets); 
					generateMarkers(tweets); 
				} else {
					alertNoResults();  
				}
			}, 
			error: function (xhr, ajaxOptions, thrownError) {
				$('.alert#loading').hide(); 
				console.log(xhr.status);
				console.log(thrownError);
			}
		}); 
	}); 
}); 