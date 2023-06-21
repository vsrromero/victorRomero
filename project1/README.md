# Gazetteer

Using the Leaflet API, this project displays a map of the world with markers for each country when selected from a select list. 
The project must have 4 controls that opens a modal for each control: info control, open a modal with the country information got from [geonames.org](https://www.geonames.org/export/ws-overview.html) at [Request Example Endpoint](http://api.geonames.org/countryInfoJSON?formatted=true&lang=en&country=DE&username=vsromero&style=full) , weather control that opens a modal with the weather info got from [Open Weather](https://openweathermap.org/api), a wikipedia control that opens a modal with a sumary and link to the wikipedia page of the selected country, can get informations at [Request Example Endpoint](http://api.geonames.org/wikipediaSearchJSON?formatted=true&q=country%20andorra&maxRows=10&username=vsromero&style=full), and a Currency control that opens a modal with the currency info got from [Open Exchange Rates](https://openexchangerates.org/signup/free) at [Request Example Endpoint](https://openexchangerates.org/api/latest.json?app_id=YOUR_APP_ID).

## Requirements

- 4 Modals with the information of the country selected from the select list, weather, wikipedia, currency and country info.
- The map must must show all the selected country fitted in the screen, it is possible using the `map.fitBounds()` method of the map.  
    Other resources that you should be looking at including to improve the user experience are:
    - Leaflet.markercluster
    - Leaflet.easyButton
    - Leaflet.extraMarker or 
    - equivalent (or just use L.Icon to create your own markers)
- The following file, [countryBorders.geo.json](./assets/json/countryBorders.geo.json), contains a list of all countries with ISO2 andISO3 codes as well as polygons describing the border. You can use this in two ways; one, to create a PHP routine to return the ISO code and name for inclusion in the `<select>` and, two, to create a PHP routine to parse the JSON object to return a border where the entrymatches a given country code.
- On loading, the system should be able to determine the current location of the device anddisplay a map highlighting the country that the user is currently in. This may be achievedusing the JavaScript `navigator` command.
- The latitude and longitude data returned by this can then be used by AJAX functions tomake calls to PHP routines that you design to call the above APIs. The data that theyreturn for a country can then be arranged and displayed in the modal dialogs. This willrequire putting some thought into how this section may best be designed to optimise thedisplay of at the very least the following data:
    Info Modal:
    - Country Name
    - Capital
    - Population
    - Area
    - Currency
    - Language
    Weather Modal:
    - Current Weather (temperature, etc...)
    Wikipedia Modal:
    - Summary of the country
    - Link to the wikipedia page
    Currency Modal:
    - Currency rate to USD

## Program flow

This is an overview as to how you could approach the design of this system but the finaldecision is up to you. Try to imagine how the system could be used and plan thefunctionality to fit how you envisage the user experience:
- Display loader whilst HTML renders.
- JQuery onload retrieve current location.
- Update map with currently selected country border
- AJAX call to PHP routine to OpenCage using location data to return coreinformation. 
- AJAX calls to PHP routines to other API providers using information fromOpenCage.

## TODO

- [x] Render the map on the screen.
- [x] Get the current location of the device.
    - [x] Set the map center to the current location.
    - [x] Add the layer with the country borders.
- [ ] Create a routine to get the countries and ISO country code from the [countryBorders.geo.json](./assets/json/countryBorders.geo.json) file and serve to the front-end.
- [ ] Create a select list with all countries and country codes as it's options and values.
- [ ] Drag the map to the current location of the device.
    - [ ] Use the countryBorders.geo.json to set the country border on the map.
    - [ ] Highlight the country border and the country map.
    - [ ] Fit on the screen the actual country using the `map.fitBounds()` method.
- [ ] Create a php routine to get the country information from the [geonames.org](https://www.geonames.org/export/ws-overview.html) API.
- [ ] Create a modal with the country information.
- [ ] Create a php routine to get the weather information from the [Open Weather](https://openweathermap.org/api) API.
- [ ] Create a modal with the weather information.
- [ ] Create a php routine to get the wikipedia information from the [geonames.org](https://www.geonames.org/export/ws-overview.html) API.
- [ ] Create a modal with the wikipedia information.
- [ ] Create a php routine to get the currency information from the [Open Exchange Rates](https://openexchangerates.org/signup/free) API.
- [ ] Create a modal with the currency information.