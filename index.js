$(startApp)

function startApp(){
	inputListener()
	inputEraser()
}

function inputListener(){
	var input = document.getElementById('cityInput')
	new google.maps.places.Autocomplete(input);
	$('.js-form').submit(event => {
		event.preventDefault()
		const input = $('#cityInput').val()

		fetchMap(input, displayMap)
		fetchWiki(input, renderWiki)
		fetchWeatherCity(input, renderWeather)

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
			// action: 'query',
			prop: 'extracts',
			titles: city,
			exsentences: 3,
			formatversion: 2,
			exintro: '',
			explaintext: '',
			redirects: '',
			format: 'json',
			// rvparse: 1,
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
	// setTimeout(function(){
	const query = {
		url: `https://api.openweathermap.org/data/2.5/weather`,
		data: {
			q: city,
			appid: '5e5df2be1d3b2a169cf5895f07e31d61',
			// origin: '*'
		},
		success: callback
	}
	$.ajax(query)
	// }, 1000)
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