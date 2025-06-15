import { useEffect, useRef } from "react";

// Global flag to prevent multiple API loads
declare global {
  interface Window {
    googleMapsLoading?: boolean;
    googleMapsLoaded?: boolean;
  }
}

export const Map = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY; // Replace with your real key

  useEffect(() => {
    // Prevent multiple initializations
    if (mapInstanceRef.current) return;

    // Check if already loaded or loading
    if (window.googleMapsLoaded) {
      initMap();
      return;
    }
    if (window.googleMapsLoading) return;

    // Check if Google Maps is already loaded
    if (window.google?.maps?.Map) {
      window.googleMapsLoaded = true;
      initMap();
      return;
    }

    // Set loading flag
    window.googleMapsLoading = true;

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async`;
    script.async = true;
    script.onload = () => {
      window.googleMapsLoaded = true;
      window.googleMapsLoading = false;
      initMap();
    };
    script.onerror = () => {
      window.googleMapsLoading = false;
      console.error("Failed to load Google Maps API");
    };
    document.head.appendChild(script);

    return () => {
      // Don't remove the script as other components might need it
      window.googleMapsLoading = false;
    };
  }, [apiKey]);

  const initMap = () => {
    if (mapRef.current && window.google?.maps?.Map && !mapInstanceRef.current) {
      try {
        mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
          center: { lat: 0, lng: 0 },
          zoom: 2,
        });
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    }
  };

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: "400px",
        backgroundColor: "#e0e0e0",
      }}
    />
  );
};
