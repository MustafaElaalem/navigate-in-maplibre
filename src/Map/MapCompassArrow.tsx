import { Marker, Map } from "maplibre-gl";
import { useEffect, useState } from "react";
import useCompass from "./useCompass";

export default function MapCompassArrow({
  geolocate,
  map,
}: {
  //@ts-ignore
  geolocate;
  map: Map;
}) {
  const [where, setWhere] = useState<{
    longitude: number;
    latitude: number;
  }>({
    longitude: 0,
    latitude: 0,
  });
  const [compass] = useCompass({
    latitude: where?.latitude,
    longitude: where?.longitude,
  });

  const [marker, setMarker] = useState();

  useEffect(() => {
    if (!geolocate) return;
    const events = [
      //@ts-ignore
      ["geolocate", (position) => setWhere(position.coords)],
      //@ts-ignore
      ["trackuserlocationend", () => setWhere(null)],
    ];

    events.map(([eventName, eventHandler]) =>
      geolocate.on(eventName, eventHandler)
    );

    return () => {
      events.map(([eventName, eventHandler]) =>
        geolocate.off(eventName, eventHandler)
      );
    };
  }, [geolocate, setWhere]);

  useEffect(() => {
    if (!map || !where) return;
    const element = document.createElement("div");
    element.style.cssText = `
				display: flex;
				flex-direction: column;
				align-items: center;
			`;
    const size = "45px";

    const image = document.createElement("img");
    image.src = "/compass-arrow.svg";
    image.style.width = size;
    image.style.height = size;
    image.style.filter = "drop-shadow(0px 1px 3px rgba(0, 0, 0, 0.7));";
    //image.alt = 'Flèche indiquant votre orientation' peut créer un texte avant
    //le chargement, c'est moche
    element.append(image);

    const marker = new Marker({ element }).setLngLat([
      where.longitude,
      where.latitude,
    ]);

    // setMarker(marker);

    return () => {
      marker.remove();
    };
  }, [map, where, setMarker]);

  console.log("compass", compass);
  const noCompass = compass === undefined;
  useEffect(() => {
    if (!marker) return;

    // if (noCompass) marker.remove();
    // if (!noCompass) marker.addTo(map);
  }, [noCompass, marker, map]);
  useEffect(() => {
    if (!marker) return;
    // marker.setRotation(compass);
  }, [marker, compass]);
}
