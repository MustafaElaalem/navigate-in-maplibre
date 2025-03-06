// Map.js
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import React, { useEffect, useRef, useState } from "react";
import { PlacePoint, RouteData } from "./types";
import { hideMarker, showMarker } from "./utilities";

function MapComponent() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [lng, setLng] = React.useState(-70.9);
  const [lat, setLat] = React.useState(42.35);
  const [zoom, setZoom] = React.useState(9);

  useEffect(() => {
    if (map.current) return; // prevent map from initializing more than once
    if (mapContainer.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        //   style: "https://demotiles.maplibre.org/style.json",
        style:
          "https://openmaptiles.geo.data.gouv.fr/styles/osm-bright/style.json",
        center: [lng, lat],
        zoom: zoom,
      });
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [mapContainer.current]);
  useEffect(() => {
    const sub = map.current?.on("move", (e) => {
      const long = e.target.getCenter().lng.toFixed(4);
      const lat = e.target.getCenter().lat.toFixed(4);
      const zoom = e.target.getZoom().toFixed(4);
      setLng(Number(long));
      setLat(Number(lat));
      setZoom(Number(zoom));
    });
    return () => sub?.unsubscribe();
  }, [map.current]);
  const [focusedInput, setFocusedInput] = useState<HTMLInputElement | null>(
    null
  );
  useEffect(() => {
    if (focusedInput) focusedInput.style.opacity = "1";
    return () => {
      if (focusedInput) focusedInput.style.opacity = "0.5";
    };
  }, [focusedInput]);

  const [toSearchQuery, setToSearchQuery] = useState("");
  const [fromSearchQuery, setFromSearchQuery] = useState("");
  const [toSelectedPlace, setToSelectedPlace] = useState({
    name: "",
    lat: "",
    lon: "",
  });
  const [fromSelectedPlace, setFromSelectedPlace] = useState({
    name: "",
    lat: "",
    lon: "",
  });
  const [placesOptions, setPlacesOptions] = useState<{
    type: string;
    places: PlacePoint[];
  }>({ type: "", places: [] });
  async function searchPlace(q: string, type: string) {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${q}&format=json`
    );
    const data = await res.json();
    setPlacesOptions({ type, places: data });
  }
  useEffect(() => {
    const timeOutId = setTimeout(() => {
      if (toSearchQuery) searchPlace(toSearchQuery, "to");
      if (fromSearchQuery) searchPlace(fromSearchQuery, "from");
    }, 1000);

    return () => {
      clearTimeout(timeOutId);
    };
  }, [toSearchQuery, fromSearchQuery]);

  const [routeData, setRouteData] = useState<RouteData>({
    code: "",
    routes: [],
    waypoints: [],
  });
  // create markers
  const toMarkerRef = useRef<maplibregl.Marker | null>(null);
  const fromMarkerRef = useRef<maplibregl.Marker | null>(null);
  useEffect(() => {
    if (map.current) {
      toMarkerRef.current = new maplibregl.Marker()
        .setLngLat([0, 0])
        .addTo(map.current);
      fromMarkerRef.current = new maplibregl.Marker()
        .setLngLat([0, 0])
        .addTo(map.current);
      // initially hide it
      toMarkerRef.current.getElement().style.display = "none";
      fromMarkerRef.current.getElement().style.display = "none";
    }

    return () => {
      if (toMarkerRef.current) toMarkerRef.current.remove();
      if (fromMarkerRef.current) fromMarkerRef.current.remove();
    };
  }, [map.current]);
  // move markers
  useEffect(() => {
    if (toSelectedPlace.name && map.current) {
      const tolonlat = [
        Number(toSelectedPlace.lon),
        Number(toSelectedPlace.lat),
      ] as maplibregl.LngLatLike;
      toMarkerRef.current?.setLngLat(tolonlat);
      if (toMarkerRef.current) showMarker(toMarkerRef.current);
      map.current.flyTo({
        center: tolonlat,
        zoom: 12,
        bearing: 0,
        speed: 0.8,
      });
    }
  }, [map.current, toSelectedPlace.name]);
  useEffect(() => {
    if (fromSelectedPlace.name && map.current) {
      const fromlonlat = [
        Number(fromSelectedPlace.lon),
        Number(fromSelectedPlace.lat),
      ] as maplibregl.LngLatLike;
      fromMarkerRef.current?.setLngLat(fromlonlat);
      if (fromMarkerRef.current) showMarker(fromMarkerRef.current);
      map.current.flyTo({
        center: fromlonlat,
        zoom: 12,
        bearing: 0,
        speed: 0.8,
      });
    }
  }, [map.current, fromSelectedPlace.name]);
  //  get route
  useEffect(() => {
    if (toSelectedPlace.name && fromSelectedPlace.name) {
      (async () => {
        const res = await fetch(
          `https://routing.openstreetmap.de/routed-bike/route/v1/driving/${fromSelectedPlace.lon},${fromSelectedPlace.lat};${toSelectedPlace.lon},${toSelectedPlace.lat}?overview=false&alternatives=false&steps=true`
        );
        const data = await res.json();
        setRouteData(data);
      })();
    }
  }, [map.current, toSelectedPlace.name, fromSelectedPlace.name]);
  // draw route
  useEffect(() => {
    console.log("routeData", routeData);
  }, [routeData]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "start",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <div
        style={{
          padding: "10px",
          backgroundColor: "rgba(0,0,0,0.3)",
          width: "280px",
          position: "absolute",
          zIndex: 1,
          color: "white",
        }}
      >
        <div>
          <label style={{ padding: "5px" }} htmlFor="from">
            from
          </label>
          <input
            type="text"
            id="from"
            style={{ opacity: "0.5" }}
            value={fromSearchQuery || fromSelectedPlace.name}
            onChange={(e) => setFromSearchQuery(e.target.value)}
            onFocus={(e) => setFocusedInput(e.currentTarget)}
          />
          <span
            style={{ cursor: "pointer", marginLeft: "5px" }}
            onClick={() => {
              setFromSearchQuery("");
              setFromSelectedPlace({
                lat: "",
                lon: "",
                name: "",
              });
              setRouteData({ code: "", routes: [], waypoints: [] });
              if (fromMarkerRef.current) hideMarker(fromMarkerRef.current);
            }}
          >
            X
          </span>
        </div>
        <div>
          <label style={{ padding: "5px" }} htmlFor="to">
            to
          </label>
          <input
            type="text"
            id="to"
            style={{ opacity: "0.5" }}
            value={toSearchQuery || toSelectedPlace.name}
            onFocus={(e) => setFocusedInput(e.currentTarget)}
            onChange={(e) => setToSearchQuery(e.target.value)}
          />
          <span
            style={{ cursor: "pointer", marginLeft: "5px" }}
            onClick={() => {
              setToSearchQuery("");
              setToSelectedPlace({
                lat: "",
                lon: "",
                name: "",
              });
              setRouteData({ code: "", routes: [], waypoints: [] });
              if (toMarkerRef.current) hideMarker(toMarkerRef.current);
            }}
          >
            X
          </span>
        </div>
        <ul
          style={{
            display: "flex",
            listStyle: "none",
            padding: 0,
            margin: 0,
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          {placesOptions.places.map((p) => (
            <li
              key={p.place_id}
              style={{ cursor: "pointer" }}
              onClick={() => {
                if (placesOptions.type === "from") {
                  setFromSearchQuery("");
                  setFromSelectedPlace({
                    name: p.display_name,
                    lat: p.lat,
                    lon: p.lon,
                  });
                }
                if (placesOptions.type === "to") {
                  setToSearchQuery("");
                  setToSelectedPlace({
                    name: p.display_name,
                    lat: p.lat,
                    lon: p.lon,
                  });
                }
                setPlacesOptions({ type: "", places: [] });
              }}
            >
              {p.display_name}
            </li>
          ))}
        </ul>
      </div>
      <div
        ref={mapContainer}
        style={{
          width: "300px",
          height: "400px",
        }}
      />
    </div>
  );
}

export default MapComponent;
