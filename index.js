$(startApp)

function startApp(){
	inputListener()
	inputEraser()
}

function inputListener(){
	$('.js-form').submit(event => {
		event.preventDefault()
		const input = $('#cityInput').val()

		fetchMap(input, displayMap)
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

function displayMap(data){
	const lat = data.results[0].geometry.location.lat
	const long = data.results[0].geometry.location.lng
	// console.log(`${lat} and ${long}`)

	renderMaps(lat, long)
}

function renderMaps(lat, long){
	console.log(lat, long)
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