import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

export default function MarkerCluster({ places }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const markers = L.markerClusterGroup();

    places.forEach((place) => {
      const marker = L.marker([place.lat, place.lon]).bindPopup(
        `<b>${place.tags.name || "Unknown"}</b><br>${place.tags.amenity}`
      );
      markers.addLayer(marker);
    });

    map.addLayer(markers);

    return () => {
      map.removeLayer(markers);
    };
  }, [map, places]);

  return null;
}