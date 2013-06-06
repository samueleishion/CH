var map; 
var markers = []; 
var infowins = [];
var genericSearch = true;  	

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
	
	$('.icon#options #pointer').css('color','#ff00f5'); 
}

function selectVisualizationType() {
	$('.icon#options #pointer').click(function() { 
		$(this).css('color','#ff00f5'); 
		$('.icon#options #heat').css('color','#fff'); 
	}); 
	
	$('.icon#options #heat').click(function() { 
		$(this).css('color','#ff00f5'); 
		$('.icon#options #pointer').css('color','#fff'); 
	}); 
}

$(document).ready(function() {
	initialize();
	selectVisualizationType(); 
	var search = $('.search');
	
	// Search enetered word
	search.keyup(function(e) {
		if(e.which==13) $('.icon#mag_glass').click(); 
	}); 
	
	$('.icon#mag_glass').click(function() {
		preprocess(search.val());  
	});  
	
	// Settings
	$('.icon#settings').click(function() {
		$('.alert#settings').fadeIn(); 
	});
	$('.alert#settings #close').click(function() {
		$('.alert#settings').fadeOut(); 
	}); 
}); 

