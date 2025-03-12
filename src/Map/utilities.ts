export function toggleMarker(marker: maplibregl.Marker) {
    const markerDisplay = marker.getElement().style.display
    if (markerDisplay === "none") {
        marker.getElement().style.display = 'block'
    } else {
        marker.getElement().style.display = 'none'
    }
}
export function showMarker(marker: maplibregl.Marker) {
    const markerDisplay = marker.getElement().style.display
    if (markerDisplay === "none") {
        marker.getElement().style.display = 'block'
    }
}
export function hideMarker(marker: maplibregl.Marker) {
    const markerDisplay = marker.getElement().style.display
    if (markerDisplay !== "none") {
        marker.getElement().style.display = 'none'
    }
}

// export async function getLayerBounds(map: maplibregl.Map, layerId: string) {
//     const sourceId = map.getLayer(layerId)?.source;
//     if (!sourceId) return
//     const source = map.getSource<maplibregl.GeoJSONSource>(sourceId);
    
//     if (source && source.type === 'geojson') {
//         const data = await source.getData(); // Access the GeoJSON data
//         if (data && data.features && data.features.length > 0) {
//             let minLng = Infinity;
//             let minLat = Infinity;
//             let maxLng = -Infinity;
//             let maxLat = -Infinity;

//             data.features.forEach((feature) => {
//                 if (feature.geometry && feature.geometry.coordinates) {
//                     const coordinates = feature.geometry.coordinates;
//                     if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
//                         function processCoords(coords) {
//                             coords.forEach((coord) => {
//                                 if (Array.isArray(coord[0])) {
//                                     processCoords(coord);
//                                 } else {
//                                     const lng = coord[0];
//                                     const lat = coord[1];
//                                     minLng = Math.min(minLng, lng);
//                                     minLat = Math.min(minLat, lat);
//                                     maxLng = Math.max(maxLng, lng);
//                                     maxLat = Math.max(maxLat, lat);
//                                 }
//                             });
//                         }
//                         processCoords(coordinates);
//                     } else if (feature.geometry.type === 'Point' || feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiLineString') {
//                         function processPoints(points) {
//                             points.forEach((point) => {
//                                 if (Array.isArray(point[0])) {
//                                     processPoints(point);
//                                 } else {
//                                     const lng = point[0];
//                                     const lat = point[1];
//                                     minLng = Math.min(minLng, lng);
//                                     minLat = Math.min(minLat, lat);
//                                     maxLng = Math.max(maxLng, lng);
//                                     maxLat = Math.max(maxLat, lat);
//                                 }
//                             });
//                         }
//                         processPoints(coordinates);
//                     }
//                 }
//             });

//             return [[minLng, minLat], [maxLng, maxLat]];
//         }
//     }
//     return null; // Return null if bounds cannot be calculated
// }