$(startApp)

function startApp(){
	inputListener()
	inputEraser()
}

function inputListener(){
	var options = {
		types: ['(cities)'],
		componentRestrictions: {country: "us"}
	}

	var input = document.getElementById('cityInput')
	new google.maps.places.Autocomplete(input, options);

	$('.js-form').submit(event => {
		event.preventDefault()
		const input = $('#cityInput').val()

		$('.greeting').hide()
		$('.left').hide()
		$('.right').hide()

		fetchMap(input, displayMap)
		fetchWiki(input, renderWiki)
		fetchWeatherCity(input, renderWeather)
		fetchCityId(input)
	})
}

function inputEraser(){
	$('.fa-times-circle').on('click', () => {
		$('#cityInput').val('').focus()
	})
}

function fetchMap(city, callback){
	const query = {
		url: 'https://maps.googleapis.com/maps/api/geocode/json',
		data: {
			address: city,
			key: 'AIzaSyATakAmdToENDu2ttZjIWr71_E-pPylYEs'
		},
		success: callback
	}
	$.ajax(query)
}

let lat = ''
let long = ''

function displayMap(data){
	lat = data.results[0].geometry.location.lat
	long = data.results[0].geometry.location.lng

	renderMaps(lat, long)
}

function renderMaps(lat, long){
	$('.main').prop('hidden', false)
	$('.googleMaps').prop('hidden', false)

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

function fetchWiki(city, callback){
	const query = {
		url: 'https://en.wikipedia.org/w/api.php?action=query',
		data: {
			prop: 'extracts',
			titles: city,
			exsentences: 3,
			formatversion: 2,
			exintro: '',
			explaintext: '',
			redirects: '',
			format: 'json',
			origin: '*'
		},
		success: callback
	}
	$.ajax(query)
}

function renderWiki(data){
	$('.wikipedia').prop('hidden', false)
	$('.wikipedia').html(`
		<h1>${data.query.pages["0"].title}</h1>
		<p>${data.query.pages["0"].extract}</p>
	`)
}

function fetchWeatherCity(city, callback){
	const query = {
		url: `https://api.openweathermap.org/data/2.5/weather`,
		data: {
			q: city,
			appid: '5e5df2be1d3b2a169cf5895f07e31d61',
		},
		success: callback
	}
	$.ajax(query)
}

function renderWeather(data) {
	$('.main').prop('hidden', false)
	$('.weather').prop('hidden', false)

	var temp = `${data.main.temp}`.substr(0, 2)

	$('.weather').html(`
		<h1>Weather for ${data.name}</h1>
		<p>Currently ${data.weather["0"].description} in ${data.name}, at ${temp} &deg;C.</p>
		<p>Wind speeds of ${data.wind.speed} mph, with ${data.main.humidity}% humidity.</p>
	`)
}

function fetchCityId(input) {
	console.log(input)
	const queryFirst = {
		url: 'https://developers.zomato.com/api/v2.1/cities',
		beforeSend: function(xhr){xhr.setRequestHeader('user-key', '1aa61e0bfadfad8ac936849e8fe6ce25')},
		data: {
			q: input
		},
		success: fetchZomato
	}
	$.ajax(queryFirst)
}

function fetchZomato(result) {
	console.log(result.location_suggestions[0].id)
	const query = {
		url: 'https://developers.zomato.com/api/v2.1/search',
		beforeSend: function(xhr){xhr.setRequestHeader('user-key', '1aa61e0bfadfad8ac936849e8fe6ce25')},
		data: {
			'entity_type': 'city',
			'entity_id': result.location_suggestions[0].id,
			count: 10,
			radius: 15,
			sort: 'rating',
		},
		success: renderZomato
	}
	$.ajax(query)
}

function renderZomato(data){
	$('.zomato').prop('hidden', false)
	$('.js-list').prop('hidden', false)

	const restaurants = data.restaurants
	
	for (let i=0; i<restaurants.length; i++){
		console.log(this.restaurant)

		let dollar = ' $'

		if (restaurants[i].restaurant.average_cost_for_two >= 15) {
			dollar = ' $$'
		} else if (restaurants[i].restaurant.average_cost_for_two >= 35) {
			dollar = ' $$$'
		}
		
		$('.js-list').append(`
			<li>
			<h3>${restaurants[i].restaurant.name}</h3><span class='dollar'>${dollar}</span>
			<p>Type: ${restaurants[i].restaurant.cuisines}.</p>
			<p>${restaurants[i].restaurant.location.address}</p>
			<p>More info: <a href='${restaurants[i].restaurant.events_url}' target=_blank>See on Zomato</a>
			</li>
		`)

	}
}
