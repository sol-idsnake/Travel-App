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
		console.log(cityUsa)
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
	console.log(lat, long)
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
	console.log(data)
	var temp = `${data.main.temp}`.substr(0, 2);

	$('.weather').html(`
		<h1><i class="far fa-sun"></i> Weather for ${data.name}</h1>
		<p>Currently ${data.weather["0"].description} in ${data.name}, at ${temp} &deg;C.</p><br>
		<p>Wind speeds of ${data.wind.speed} mph, with ${data.main.humidity}% humidity.</p>
	`);
}

let cityUsa = ''
// Handle Zomato API call
function fetchZomato(city) {
	if ($('#zomato').prop('checked')) {
		cityUsa = city.slice(0, -5);
		
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
		// set Timeout function to make cityUsa available for FetchZomatoInfo function
		setTimeout(function(){$.ajax(queryFirst)}, 300)
	} else {
		$('.zomato').hide();
	};
}

// Get list of restaurant recommendations via City ID
function fetchZomatoInfo(cityId) {
	const cityAndStateArray = []
	const citySelection = cityId.location_suggestions

	// Push all results into a text array
	for (let i = 0; i < citySelection.length; i++){
		cityAndStateArray.push(cityId.location_suggestions[i].name)
	}

	// Search for city user input match in the array of results
	let indexNumber = $.inArray(cityUsa, cityAndStateArray)

	// API sometimes has differing names (e.g. 'tampa' = 'tampa bay' on API). 
	// If API city name != user input and exactly 1 match is returned, choose that only result.
	// Else If = If no match is found at all, show error message.
	if (cityId.location_suggestions.length === 1) {
		indexNumber = 0
	} else if (indexNumber === -1) {
		$(".greeting").hide();
        $("main").css("display", "flex");
        $(".zomato").show();
        $(".js-list").show();
        $(".js-list").find("li").remove();
		$(".js-list").append(`
        	<li>
			<h3>Sorry</h3>
			<p>There seem to be no Zomato restaurants in this city.</p>
			</li>
        `);
        return
	}

	const query = {
		url: 'https://developers.zomato.com/api/v2.1/search',
		beforeSend: function(xhr){xhr.setRequestHeader('user-key', '1aa61e0bfadfad8ac936849e8fe6ce25')},
		data: {
			'entity_type': 'city',
			'entity_id': citySelection[indexNumber].id,
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
