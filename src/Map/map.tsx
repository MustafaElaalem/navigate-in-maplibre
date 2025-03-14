// Map.js
import maplibregl, { GeoJSONSource, GeolocateControl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import { RouteWithGeometry } from "./routeType";
import { PlacePoint } from "./types";
import useCompass from "./useCompass";
import { hideMarker, showMarker } from "./utilities";

const routeLayerId = "route";
const routeSourceId = "routeSource";
const lng = 31.220359988367647;
const lat = 0.06100948209334;
const zoom = 10;

function MapComponent() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<maplibregl.Map | null>(null);

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
  const [lonlat, setLonlat] = useState({ lon: 0, lat: 0 });
  const [degree, elss] = useCompass({
    latitude: lonlat.lat,
    longitude: lonlat.lon,
  });
  useEffect(() => {
    // toast(`Degree: ${degree}, - ${elss}`, {
    //   position: "bottom-left",
    //   style: { backgroundColor: "black", color: "white" },
    // });
    console.log("==>", degree);
  }, [degree, elss]);

  // add layers
  useEffect(() => {
    let sub: maplibregl.Subscription;
    if (map.current) {
      sub = map.current.on("load", async () => {
        map.current?.addSource(routeSourceId, {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [],
          },
        });
        map.current?.addLayer({
          id: routeLayerId,
          type: "line",
          source: routeSourceId,
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#888",
            "line-width": 2,
          },
        });

        // add arrow layer
        const image = await map.current?.loadImage("arrow.png");
        if (!image) return;
        map.current?.addImage("arrow", image.data);
        map.current?.addLayer({
          id: "direction-indicator",
          type: "symbol",
          source: {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: [
                {
                  type: "Feature",
                  id: "current-position",
                  properties: { bearing: 0 },
                  geometry: {
                    type: "Point",
                    coordinates: [lng, lat],
                  },
                },
              ],
            },
          },
          layout: {
            "icon-image": "arrow",
            "icon-rotate": ["get", "bearing"],
            "icon-rotation-alignment": "auto",
            "symbol-placement": "point",
            "icon-size": 0.05,
            "icon-allow-overlap": true,
          },
        });

        // add GeolocateControl
        const glc = new GeolocateControl({
          trackUserLocation: true,
          showUserLocation: false,
          showAccuracyCircle: true,
          fitBoundsOptions: { animate: true },
          positionOptions: { enableHighAccuracy: true },
        });
        glc.on("geolocate", (geoData) => {
          console.log(geoData);
          setLonlat({
            lat: geoData.coords.latitude,
            lon: geoData.coords.longitude,
          });
          // toast(
          //   `lat: ${geoData.coords.latitude}, lon:${geoData.coords.longitude}, H:${geoData.coords.heading}`,
          //   {
          //     position: "top-right",
          //     style: { backgroundColor: "black", color: "white" },
          //   }
          // );
        });
        map.current?.addControl(glc, "bottom-right");
      });
    }
    return () => {
      if (sub) sub.unsubscribe();
    };
  }, [map.current]);

  // async function animateSymbol(featureId, newLng, newLat, duration = 1000) {
  //   const source = map.current?.getSource("symbolSource") as GeoJSONSource;
  //   map.current?.getFeatureState({source:"direction-indicator", id:"current-position"})
  //   const feature =(await source?.getData() as GeoJSONFeature).features.find((f) => f.id === featureId);

  //   if (!feature) {
  //     console.error("Feature not found.");
  //     return;
  //   }

  //   const startLng = feature.geometry.coordinates[0];
  //   const startLat = feature.geometry.coordinates[1];
  //   const startTime = performance.now();

  //   async function updateFrame() {
  //     const currentTime = performance.now();
  //     const elapsed = currentTime - startTime;
  //     const progress = Math.min(1, elapsed / duration); // Ensure progress doesn't exceed 1

  //     if (progress < 1) {
  //       const currentLng = startLng + (newLng - startLng) * progress;
  //       const currentLat = startLat + (newLat - startLat) * progress;

  //       feature.geometry.coordinates = [currentLng, currentLat];
  //       source.setData(await source?.getData());

  //       requestAnimationFrame(updateFrame);
  //     } else {
  //       // Animation complete, set the final coordinates
  //       feature.geometry.coordinates = [newLng, newLat];
  //       source.setData(await source?.getData());
  //     }
  //   }

  //   requestAnimationFrame(updateFrame);
  // }

  useEffect(() => {
    if (map.current && map.current?.getSource("direction-indicator")) {
      (map.current?.getSource("direction-indicator") as GeoJSONSource)?.setData(
        {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: { bearing: degree },
              geometry: {
                type: "Point",
                coordinates: [lonlat.lon, lonlat.lat],
              },
            },
          ],
        }
      );
      // map.current?.setFeatureState(
      //   { source: 'my-source', id: featureId },
      //   { targetLon: lonlat.lon, targetLat: lonlat.lat }
      // );
    }
    return () => {};
  }, [map.current, degree, lonlat]);

  // @ts-ignore
  window._map = map.current;

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
      `https://nominatim.openstreetmap.org/search?q=${q}&format=json&countrycodes=eg`
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

  const [routeData, setRouteData] = useState<RouteWithGeometry>({
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
          `https://routing.openstreetmap.de/routed-bike/route/v1/driving/${fromSelectedPlace.lon},${fromSelectedPlace.lat};${toSelectedPlace.lon},${toSelectedPlace.lat}?alternatives=false&steps=true&overview=full&geometries=geojson`
        );
        const data = await res.json();
        console.log(data);
        setRouteData(data);
      })();
    }
  }, [map.current, toSelectedPlace.name, fromSelectedPlace.name]);
  // draw route
  useEffect(() => {
    console.log("routeData", routeData);
    if (map.current && routeData.routes[0]) {
      const geom = routeData.routes[0]?.geometry as {
        coordinates: number[][];
        type: "LineString";
      };
      // const sourceId = map.current.getLayer(routeLayerId)?.source;
      // if (!sourceId) return;
      const source =
        map.current.getSource<maplibregl.GeoJSONSource>(routeSourceId);
      source?.setData({
        type: "Feature",
        properties: {},
        geometry: geom,
      });
      // const data = source?.getData();
      // data?.then((features) => {
      //   if (features) {
      //     const zz = features.bbox as maplibregl.LngLatBoundsLike;
      //     map.current?.fitBounds(zz, { padding: 20 });
      //   }
      // });
    }
  }, [routeData, map.current]);

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
            listStyle: "none",
            padding: 0,
            margin: 0,
            maxHeight: "200px",
            overflow: "auto",
          }}
        >
          {placesOptions.places.map((p) => (
            <li
              key={p.place_id}
              style={{ cursor: "pointer", margin: "10px 0" }}
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
