import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

import MarkerCluster from "./MarkerCluster";

const center = [42.6629, 21.1655]; // Prishtina

function Map() {
  const [places, setPlaces] = useState([]);
  const [bounds, setBounds] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPlaces, setFilteredPlaces] = useState([]);

  useEffect(() => {
    if (!bounds) return;

    const fetchPlaces = async () => {
      const { _southWest, _northEast } = bounds;
      const query = `
        [out:json];
        (
          node["amenity"="cafe"](${_southWest.lat},${_southWest.lng},${_northEast.lat},${_northEast.lng});
          node["amenity"="bar"](${_southWest.lat},${_southWest.lng},${_northEast.lat},${_northEast.lng});
          node["amenity"="club"](${_southWest.lat},${_southWest.lng},${_northEast.lat},${_northEast.lng});
        );
        out;
      `;
      const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

      try {
        const res = await fetch(url);
        const data = await res.json();
        setPlaces(data.elements.filter(el => el.lat && el.lon));
      } catch (err) {
        console.error(err);
      }
    };

    fetchPlaces();
  }, [bounds]);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredPlaces(places);
    } else {
      const filtered = places.filter(place => {
        const name = place.tags?.name || "";
        return name.toLowerCase().includes(searchTerm.toLowerCase());
      });
      setFilteredPlaces(filtered);
    }
  }, [places, searchTerm]);

  return (
    <div style={{ position: "relative", height: "100vh", width: "100%" }}>
      <div style={{
        position: "absolute",
        top: "10px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        backgroundColor: "white",
        padding: "10px",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
      }}>
        <input
          type="text"
          placeholder="Search coffee shops..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "8px 12px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            fontSize: "14px",
            width: "300px",
            outline: "none"
          }}
        />
      </div>
      <MapContainer center={center} zoom={14} style={{ height: "100vh", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap contributors" />
        <MapBounds onBoundsChange={setBounds} />
        <MarkerCluster places={filteredPlaces} />
      </MapContainer>
    </div>
  );
}

function MapBounds({ onBoundsChange }) {
  useMapEvents({
    moveend: (e) => onBoundsChange(e.target.getBounds()),
  });
  return null;
}

export default Map;
