$(inputListener)

// Google autocomplete feature & form submit event listener
function inputListener(){
	// Google autocomplete feature
	var options = {
		types: ['(cities)'],
		componentRestrictions: {country: "us"}
	};
	var input = document.getElementById('cityInput');
	new google.maps.places.Autocomplete(input, options);


	// event listener
	$('.js-form').submit(event => {
		event.preventDefault()

		const input = $('#cityInput').val()

		fetchMap(input, renderMap)
		fetchWiki(input, renderWiki)
		fetchWeatherCity(input)
		fetchZomato(input)
	});
}

// Handle Map API call
function fetchMap(city, callback){
	if ($('#maps').prop('checked')) {		
		const query = {
			url: 'https://maps.googleapis.com/maps/api/geocode/json',
			data: {
				address: city,
				key: 'AIzaSyATakAmdToENDu2ttZjIWr71_E-pPylYEs'
			},
			success: callback
		};
		$.ajax(query);
	} else {
		$('.googleMaps').hide();
	};
}

// Render google map
function renderMap(data){
	$('.greeting').hide();
	$('main').css('display', 'flex');
	$('.googleMaps').show();

	const lat = data.results[0].geometry.location.lat
	const long = data.results[0].geometry.location.lng

	var uluru = {lat: lat, lng: long};
	var map = new google.maps.Map(document.querySelector('.googleMaps'), {
	    zoom: 10,
	    center: uluru
	});
	var marker = new google.maps.Marker({
	    position: uluru,
	    map: map
	});	
}

// Handle Wikipedia API call
function fetchWiki(city, callback){
	if ($('#wikipedia').prop('checked')) {
		const cityUsa = city.slice(0, -5);
		const query = {
			url: 'https://en.wikipedia.org/w/api.php?action=query',
			data: {
				prop: 'extracts',
				titles: cityUsa,
				exsentences: 3,
				formatversion: 2,
				exintro: '',
				explaintext: '',
				redirects: '',
				format: 'json',
				origin: '*'
			},
			success: callback
		};
		$.ajax(query);
	} else {
		$('.wikipedia').hide();
	};
}

// Render wikipedia DIV
function renderWiki(data){
	$('.greeting').hide();
	$('main').css('display', 'flex');
	$('.wikipedia').show();
	$('.wikipedia').html(`
		<h1><i class="far fa-building"></i> ${data.query.pages[0].title}</h1>
		<p>${data.query.pages["0"].extract}</p>
	`);
}

// Handle weather API / get coordinates
function fetchWeatherCity(city){
	if ($('#weather').prop('checked')) {
		const cityUsa = city.slice(0, -5);
		
		const query = {
			url: 'https://maps.googleapis.com/maps/api/geocode/json',
			data: {
				address: city,
				key: 'AIzaSyATakAmdToENDu2ttZjIWr71_E-pPylYEs'
			},
			success: getCityByLatLong
		};
		$.ajax(query);
	} else {
		$('.weather').hide();
	};
}

// Get city ID by coordinates
function getCityByLatLong(result){
	const lat = result.results[0].geometry.location.lat;
	const long = result.results[0].geometry.location.lng;

	const query = {
		url: `https://api.openweathermap.org/data/2.5/weather`,
		data: {
			lat: lat,
			lon: long,
			appid: '5e5df2be1d3b2a169cf5895f07e31d61',
		},
		success: renderWeather
	};
	$.ajax(query);
}

// Render weather DIV via city ID
function renderWeather(data) {
	$('.greeting').hide();
	$('main').css('display', 'flex');
	$('.weather').show();

	var temp = `${data.main.temp}`.substr(0, 2);

	$('.weather').html(`
		<h1><i class="far fa-sun"></i> Weather for ${data.name}</h1>
		<p>Currently ${data.weather["0"].description} in ${data.name}, at ${temp} &deg;C.</p><br>
		<p>Wind speeds of ${data.wind.speed} mph, with ${data.main.humidity}% humidity.</p>
	`);
}

// Handle Zomato API call
function fetchZomato(city) {
	if ($('#zomato').prop('checked')) {
		let cityUsa = city.slice(0, -5);

		// State of Hawaii fix for API (Api considers whole island, not individual city)
		if (cityUsa.indexOf("HI") >= 5) {
			cityUsa = 'Hawaii'
		}

		const queryFirst = {
			url: 'https://developers.zomato.com/api/v2.1/cities',
			beforeSend: function(xhr){xhr.setRequestHeader('user-key', '1aa61e0bfadfad8ac936849e8fe6ce25')},
			data: {
				q: cityUsa
			},
			success: fetchZomatoInfo
		}
		$.ajax(queryFirst);
	} else {
		$('.zomato').hide();
	};
}

// Get list of restaurant recommendations via City ID
function fetchZomatoInfo(cityId) {
	const query = {
		url: 'https://developers.zomato.com/api/v2.1/search',
		beforeSend: function(xhr){xhr.setRequestHeader('user-key', '1aa61e0bfadfad8ac936849e8fe6ce25')},
		data: {
			'entity_type': 'city',
			'entity_id': cityId.location_suggestions[0].id,
			count: 10,
			radius: 15,
			sort: 'rating',
		},
		success: renderZomato
	};
	$.ajax(query);
}

// Render Zomato DIV, fill with list of restaurants
function renderZomato(data){
	$('.greeting').hide();
	$('main').css('display', 'flex');
	$('.zomato').show();
	$('.js-list').show();
	$('.js-list').find('li').remove();

	const restaurants = data.restaurants;
	
	for (let i=0; i<restaurants.length; i++){

		let dollar = ' $';

		if (restaurants[i].restaurant.average_cost_for_two >= 15) {
			dollar = ' $$'
		} else if (restaurants[i].restaurant.average_cost_for_two >= 35) {
			dollar = ' $$$'
		};
		
		$('.js-list').append(`
			<li>
			<h3>${restaurants[i].restaurant.name}</h3><span class='dollar'>${dollar}</span>
			<p>Type: ${restaurants[i].restaurant.cuisines}.</p>
			<p>${restaurants[i].restaurant.location.address}</p>
			<p>More info: <a href='${restaurants[i].restaurant.events_url}' target=_blank>See on Zomato</a>
			</li>
		`);
	};
}
