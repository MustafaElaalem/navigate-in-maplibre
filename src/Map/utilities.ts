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