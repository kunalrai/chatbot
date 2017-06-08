function executeAction(method){
    switch(method.action){
        case 'changebackgroundColor':
            changebackgroundColor(method.parameters.color);
            break;
        case 'getgeolocation':
            getGeoLocation(method.parameters);
        break;
    }
}

function changebackgroundColor(color){
    document.body.style.backgroundColor = color;
}

function getGeoLocation(parameters){

    
     var city ,
         country;
    city = parameters.city.city;
    country=parameters.country.country;

    var gApi_Key='AIzaSyCiv7jVrzCKdrKh4yRRcokYIUnfMMtKuFM';
    var webApiURL = 'https://maps.googleapis.com/maps/api/geocode/json?address=';
    var requestUri = webApiURL+city+'+'+country+'&key='+gApi_Key;
    if(city){
        requestUri = webApiURL+city+'+'+country+'&key='+gApi_Key;
    }

    fetch(requestUri).then(
        function(response){
            sendMessageByBot(response);
        }
    )


}