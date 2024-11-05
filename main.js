// Load geojson and population data
d3.json("ct-towns-2022.geojson").then((geojson, err1) => {
    d3.dsv(",", "ct-town-pop-density-2019acs5yr.csv", (d) => {
        return {
            name: d.Town,
            pop: +d.pop2019,
            dense: +d.popsqmi2019
        };
    }).then((data, err2) => {
        for (var i = 0; i < geojson.features.length; i++) {
            for (var j = 0; j < data.length; j++) {
                if (geojson.features[i].properties["name"] === data[j]["name"]) {
                    geojson.features[i].properties["pop"] = data[j]["pop"];
                    geojson.features[i].properties["dense"] = data[j]["dense"];
                }
            }
        }

        // Initialize map
        var map = L.map('map').setView([41.38016733657364, -72.10705729845692], 19);

        // Base map layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 9,
        }).addTo(map);

        // Function to determine color based on density
        function getColor(d) {
            return d > 1000 ? '#800026' :
                d > 500  ? '#BD0026' :
                    d > 200  ? '#E31A1C' :
                        d > 100  ? '#FC4E2A' :
                            d > 50   ? '#FD8D3C' :
                                d > 20   ? '#FEB24C' :
                                    d > 10   ? '#FED976' :
                                        '#FFEDA0';
        }

        // Style function to apply color scale based on density
        function style(feature) {
            return {
                fillColor: getColor(feature.properties.dense),
                weight: 1,
                opacity: 1,
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.7
            };
        }

        // Add hover info box
        function onEachFeature(feature, layer) {
            layer.bindTooltip(`<strong>${feature.properties.name}</strong><br>Population: ${feature.properties.pop}<br>Density: ${feature.properties.dense.toFixed(2)} per sq mi`, {
                sticky: true
            });
        }

        // Add geojson layer
        L.geoJson(geojson, {
            style: style,
            onEachFeature: onEachFeature
        }).addTo(map);

        // Add legend to the map
        var legend = L.control({ position: 'bottomright' });

        legend.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend'),
                grades = [0, 10, 20, 50, 100, 200, 500, 1000];

            // Loop through density intervals and create color-coded legend
            for (var i = 0; i < grades.length; i++) {
                div.innerHTML +=
                    '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                    grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
            }

            return div;
        };

        legend.addTo(map);
    });
});
