////AJAX REQUEST GEOJSON FROM GISTS
var CampLand1 = $.ajax({
  url: "https://gist.githubusercontent.com/EricSamsonCarto/af6dc91c42439d8319ab1659981f003e/raw/c8f595f6d29fa828c4c8f6e0c869c62992c74384/CampLand.geojson",
  dataType: "json",
  success: console.log("County data successfully loaded."),
  error: function(xhr) {
    alert(`CampLand1: ${xhr.statusText}`);
  }
});

var NoCampLand1 = $.ajax({
  url: "https://gist.githubusercontent.com/EricSamsonCarto/7e726743481826e0a4c5dff96f99db38/raw/b114b9b9438783b9479f4b08e0031f03f7a83ae2/NoCampLand.geojson",
  dataType: "json",
  success: console.log("County data successfully loaded."),
  error: function(xhr) {
    alert(`NoCampLand1: ${xhr.statusText}`);
  }
});

var Background1 = $.ajax({
  url: "https://gist.githubusercontent.com/EricSamsonCarto/a8bdd4007dc860d4952d5bbe57f8a374/raw/5358d90dd41da5964d504e15183d38bcaffbda3a/Background.geojson",
  dataType: "json",
  success: console.log("County data successfully loaded."),
  error: function(xhr) {
    alert(`Background1: ${xhr.statusText}`);
  }
});

var PrivateLand1 = $.ajax({
  url: "https://gist.githubusercontent.com/EricSamsonCarto/6d868f0fd05ac893600f1afba237f22f/raw/98d7ab9afaed3a864e70ba32e0bdda4589112839/PrivateLand.geojson",
  dataType: "json",
});

var BLM1 = $.ajax({
  url: "https://gist.githubusercontent.com/EricSamsonCarto/2c30f0284f49c8d70d1de95053da171e/raw/89fa5d3a33066fc89fcc0e607c2fb728fe3ac928/BLM.geojson",
  dataType: "json",
});

// AFTER THE AJAX REQUEST IS COMPLETED, LOAD MAP
$.when(CampLand1, NoCampLand1, Background1, PrivateLand1, BLM1).done(function() {
  var map = L.map("map",{
    zoomControl: false,
    minZoom: 5,
    maxZoom: 19
  }).setView([37.732941, -120.915037], 5);

//BASEMAPS FROM ESRI, STANDARD TOPOGRAPHIC ON DEFAULT AND IMAGERY OPTION
var topo = L.esri.basemapLayer("Topographic");
topo.addTo(map);
var satellite = L.esri.basemapLayer("ImageryClarity");
//BASEMAPS GROUP
var basemaps = {
  Topographic: topo,
  Satellite: satellite
};

//PANNING RESTRICTIONS
var southWest = L.latLng(22.212095, -137.321017),
northEast = L.latLng(50.336290, -102.497042);
var bounds = L.latLngBounds(southWest, northEast);

map.setMaxBounds(bounds);
map.on('drag', function() {
  map.panInsideBounds(bounds, { animate: false });
});
  
//COORDINATES MAP CENTER TOP LEFT
L.control.mapCenterCoord({
  position: 'topleft',
}).addTo(map); 
  
//FULLSCREEN OPTION IN TOP RIGHT
map.addControl(new L.Control.Fullscreen({
  position: 'topright',
})); 
  
//ZOOM LEVEL DISPLAY
var ZoomViewer = L.Control.extend({
		onAdd: function(){
			var gauge = L.DomUtil.create('div');
			gauge.style.width = '95px';
			gauge.style.background = 'rgba(255,255,255,0.8)';
			gauge.style.textAlign = 'left';
			map.on('zoomstart zoom zoomend', function(ev){
				gauge.innerHTML = '&nbsp' + '&nbsp' + 'Zoom Level: ' + map.getZoom();
			})
			return gauge;
		}
	});
(new ZoomViewer).addTo(map);
  
//****ADD GEOJSONS LOADED PREVIOUSLY TO MAP****\\
//CAMPLAND
var CampLand = L.geoJSON(CampLand1.responseJSON, {
    fillOpacity: 0.15,
    color: '#239B56',
    weight: 1,   
  }).addTo(map);
//ADD CAMPLAND POPUP
CampLand.bindPopup(function (layer) {
    let desc = `
    <a href="${layer.feature.properties.Website}" target="new">${layer.feature.properties.Name}</a>`
    return desc;
}).addTo(map);
//REMOVE CAMPLAND LAYER WHEN USER IS TOO ZOOMED IN
map.on('zoomend', function() {
    if (map.getZoom() > 12){
            map.removeLayer(CampLand);
    }
    else {
            map.addLayer(CampLand);
        }
})

//NOCAMPLAND
var NoCampLand = L.geoJSON(NoCampLand1.responseJSON, {
    fillOpacity: 0.15,
    color: '#CD6155',
    weight: 1,
    stroke: true,
    
  }).addTo(map);
 
//BACKGROUNDCUSTOM
var Background2 = L.geoJSON(Background1.responseJSON, {
    fillOpacity: 0.60,
    color: 'black',
    weight: 1,
    stroke: false
  }).addTo(map);

//PRIVATELAND 
var PrivateLand = L.geoJSON(PrivateLand1.responseJSON, {
    fillOpacity: 0.15,
    color: '#CD6155',
    weight: 1,
    stroke: true,    
  })
//PRIVATELAND APPEARS AT ZOOM LEVEL 12
  map.on('zoomend', function() {
    if (map.getZoom() < 12){
            map.removeLayer(PrivateLand);
    }
    else {
            map.addLayer(PrivateLand);
        }
}) 

//BLMLAND
 var BLM = L.geoJSON(BLM1.responseJSON, {
    fillOpacity: 0.25,
    color: '#F1D562',
    weight: 1,
    stroke: true,    
  })
 //BLM APPEARS AT ZOOM LEVEL 9
  map.on('zoomend', function() {
    if (map.getZoom() < 9){
            map.removeLayer(BLM);
    }
    else {
            map.addLayer(BLM);
        }
}) 
//**END OF ADDING LAYERS FROM AJAX**\\

///CREATE OVERLAYS FOR CONTROL LAYERS PANE
var overlays = {
  DispersedCampLand: CampLand,
  BLM: BLM,
  PrivateLand: PrivateLand,
};
L.control.layers(basemaps, overlays).addTo(map);  

  
//***SETTING UP FS ROADS **\\
  
//FS ROADS STYLES
function FSroadsStyle(feature) {
  var colorToUse;
  var line = feature.properties.SYMBOL_NAME;     
  if (line === "Paved Road") colorToUse = "#7D3C98";
  else colorToUse = "#D4AC0D";          
  return {
    "color": colorToUse,
    "weight": 2
  };
}
//ADD FS ROADS FROM REST SERVICE
var FSroads = L.esri.featureLayer({
    url: 'https://apps.fs.usda.gov/arcx/rest/services/EDW/EDW_RoadBasic_01/MapServer/0',
  opacity: 0.7,
  style: FSroadsStyle,
    });
//BIND POPUP FOR FS ROADS
FSroads.bindPopup(function (layer) {
    return L.Util.template('<font size="2px"><b>Road Name:</b> {NAME} <br> <b>Road Class:</b> {FUNCTIONAL_CLASS} <br> <b>Road Status:</b> {SYMBOL_NAME} <br> <b>Surface Type:</b> {SURFACE_TYPE}</font>', layer.feature.properties);
  });
  
//RESTRICT ZOOM LEVELS ON ROAD SERVICE
//NEW FEATURE GROUP
var FSroadszoom = new L.FeatureGroup();
//ADD FS ROADS TO GROUP
FSroadszoom.addLayer(FSroads);
///CONTROL ZOOM
map.on('zoomend', function() {
    if (map.getZoom() < 13){
            map.removeLayer(FSroadszoom);
    }
    else {
            map.addLayer(FSroadszoom);
        }
});
//***END OF FSROADS SETUP**\\ 
  
  
//***SETTING UP OFFICIAL CAMPSITES **\\

//ADD OFFICIAL CAMP SITES FROM REST SERVICE
var officialLogo = L.icon({
    iconUrl: 'https://image.flaticon.com/icons/svg/452/452702.svg',
    iconSize: [28, 29],
});
  
var OFF_Campsites = L.esri.featureLayer({
  url: 'https://apps.fs.usda.gov/fsgisx05/rest/services/wo_nfs_gtac/GTAC_IVMCartography_02/MapServer/1',
  where: ("MARKERACTIVITY = 'Campground Camping' OR MARKERACTIVITY = 'Group Camping' OR MARKERACTIVITY = 'RV Camping' OR MARKERACTIVITY = 'Horse Camping' OR MARKERACTIVITY = 'Dispersed Camping' OR MARKERACTIVITY = 'OHV Camping' OR MARKERACTIVITY = 'OHV Camping'"),
  pointToLayer: function (geojson, latlng) {
      return L.marker(latlng, {
        icon: officialLogo
      });
    }
});
  
//BIND POPUP FOR FS ROADS
OFF_Campsites.bindPopup(function (layer) {
    return L.Util.template('<font size="2px"><b>Campground Name:</b> {RECAREANAME} <br> <b>Capsite Site:</b> <a href={RECAREAURL}>Link</a> <br> <b>Activity Type:</b> {MARKERACTIVITY} <br> <b>Open Status:</b> {OPENSTATUS}</font>', layer.feature.properties);
  });

//RESTRICT ZOOM LEVELS ON CAMP SERVICE
//NEW FEATURE GROUP
var OFF_Campsites_Zoom = new L.FeatureGroup();
//ADD Campsites TO GROUP
OFF_Campsites_Zoom.addLayer(OFF_Campsites);
///CONTROL ZOOM
map.on('zoomend', function() {
    if (map.getZoom() < 13){
            map.removeLayer(OFF_Campsites);
    }
    else {
            map.addLayer(OFF_Campsites);
        }
});
//***END OF OFFICIAL CAMPSITES SETUP**\\ 
  
  
//ADD TRAILHEADS FROM REST SERVICE\\
var Trailheadlogo = L.icon({
    iconUrl: 'https://image.flaticon.com/icons/svg/566/566499.svg',
    iconSize: [28, 29],
});
  
var trailheads = L.esri.featureLayer({
  url: 'https://apps.fs.usda.gov/fsgisx05/rest/services/wo_nfs_gtac/GTAC_IVMCartography_02/MapServer/1',
  where: ("MARKERACTIVITY = 'Trailhead'"),
  pointToLayer: function (geojson, latlng) {
      return L.marker(latlng, {
        icon: Trailheadlogo
      });
    }
});
  
//BIND POPUP FOR FS ROADS
trailheads.bindPopup(function (layer) {
    return L.Util.template('<font size="2px"><b>Trailhead Name:</b> {RECAREANAME} <br> <b>Trailhead Site:</b> <a href={RECAREAURL}>Link</a> <br> <b>Open Status:</b> {OPENSTATUS}</font>', layer.feature.properties);
  });

//RESTRICT ZOOM LEVELS ON CAMP SERVICE
//NEW FEATURE GROUP
var trailheads_Zoom = new L.FeatureGroup();
//ADD Campsites TO GROUP
trailheads_Zoom.addLayer(trailheads);
///CONTROL ZOOM
map.on('zoomend', function() {
    if (map.getZoom() < 13){
            map.removeLayer(trailheads);
    }
    else {
            map.addLayer(trailheads);
        }
});
//***END OF OFFICIAL CAMPSITES SETUP**\\ 
  

 
//***EDITABLE POINTS FOR USERS***\\
//MARKER DESIGN
var campIcon = L.icon({
    iconUrl: 'https://image.flaticon.com/icons/svg/452/452804.svg',
    iconSize: [28, 29],
});
  
//SET UP EDITABLE LAYER GROUP
var editableLayers = new L.FeatureGroup();
  
map.addLayer(editableLayers);
//SET UP BUTTON, ONLY FOR MARKER
var options = {
  position: 'topright',
  draw: {
    polyline: false,
    polygon: false,
    circle: false, 
    rectangle: false,
    marker: {
      icon : campIcon
    },
  },
  edit: {
    featureGroup: editableLayers,
    remove: false,
    edit: false
  }
};
//ADD DRAW CONTROL WITH SPECIFIED OPTIONS ABOVE
var drawControl = new L.Control.Draw(options);
map.addControl(drawControl);
//FUNCTION THAT ADDS DRAWN POINTS TO EDITABLE LAYERS
map.on('draw:created', function(e) {
            editableLayers.addLayer(e.layer);
        });
//***END OF EDITABLE POINTS FOR USERS***\\

//***ADD POPUPS FOR MARKERS***\\ 
map.on(L.Draw.Event.CREATED, function(e) {
  var type = e.layerType,
    layer = e.layer;

if (type === 'marker') {    

//HORRIBLE SLICING JOB, BUT GETS IT DONE, TRYING TO EXTRACT LAT, LON VALUES FOR GOOGLE, NOAA, AND POPUP WINDOW
var LL = '' + layer.getLatLng();
var res = LL.slice(6);
var view = res.slice(1, -1);
var lat = view.slice(0,-12);
var lon3 = '' + layer.getLatLng();
var lon2 = lon3.slice(6);
var lon1 = lon2.slice(11);
var lon = lon1.slice(0, -1);
  
var Link = `
     ${res}
<hr style="height:1px; border:none; color:#000; background-color:#000; width:100%; text-align:center; margin-bottom: .1rem;">

<a href="https://www.google.com/search?q=${res}" target="_blank">Google Coordinates</a> 

<hr style="height:1px; border:none; color:#000; background-color:#000; width:100%; text-align:center; margin-bottom: .1rem;">

<a href="https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${view}" target=" _blank">Google Street View</a>

<hr style="height:1px; border:none; color:#000; background-color:#000; width:100%; text-align:center; margin-bottom: .1rem;">

<a href=" https://forecast.weather.gov/MapClick.php?lon=${lon}&lat=${lat}" target=" _blank">NOAA</a>
 `
;
layer.bindPopup(Link);
  }

});
//***END POPUPS FOR MARKERS***\\

//***EXPORT OF MARKERS + BUTTONS***\\ 
////GEOJSON EXPORT
  document.getElementById('GJexport').onclick = function(e) {
            //EXTRACT GEOJSON FROM FEATURE GROUP
            var editablelayersJSON = editableLayers.toGeoJSON();
    
            //CONVERT GEOJSON
            var convertedGeojson = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(editablelayersJSON));

            //CREATE DOWNLOAD
            document.getElementById('GJexport').setAttribute('href', 'data:' + convertedGeojson); 
            document.getElementById('GJexport').setAttribute('download','MyCampSpots.geojson');
        }	
////KML EXPORT
  document.getElementById('KMLexport').onclick = function(e) {
            //EXTRACT GEOJSON FROM FEATURE GROUP, CONVERT TO KML
            var editablelayersJSONforKML = editableLayers.toGeoJSON();
            var kml = tokml(editablelayersJSONforKML);
            
            //CONVERT KML
            var convertedkml = 'application/vnd.google-earth.kml+xml;charset=utf-8,' + encodeURIComponent(kml);

            //CREATE DOWNLOAD
            document.getElementById('KMLexport').setAttribute('href', 'data:' + convertedkml); 
            document.getElementById('KMLexport').setAttribute('download','MyCampSpots.kml');
        }

////ON CLICK, CLEAR ALL EDITABLE POINTS
  document.getElementById('delete').onclick = function(e) {
            editableLayers.clearLayers();
        }
//***END OF EXPORT OF MARKERS + BUTTONS***\\ 
  
});
