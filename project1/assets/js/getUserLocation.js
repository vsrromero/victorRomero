var lat = null;
var lng = null;

async function getLocation() {
  return new Promise(function(resolve, reject) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        function(position) {
          resolve(position.coords);
        },
        function(error) {
          reject("Error retrieving location: " + error.message);
        }
      );
    } else {
      reject("Geolocation is not supported by the browser.");
    }
  });
}

async function getCoordinates() {
  try {
    const position = await getLocation();
    lat = position.latitude;
    lng = position.longitude;
    handleLocationCoordinates(lat, lng);
  } catch (error) {
    console.log(error);
  }
}

getCoordinates();
