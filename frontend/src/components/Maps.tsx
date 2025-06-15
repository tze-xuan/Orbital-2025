import { Flex } from "@chakra-ui/react";
import {
  AdvancedMarker,
  APIProvider,
  Map,
  MapCameraChangedEvent,
  Pin,
} from "@vis.gl/react-google-maps";

type Poi = { key: string; location: google.maps.LatLngLiteral };

const locations: Poi[] = [
  { key: "sliceOfLife", location: { lat: 1.373876, lng: 103.881873 } },
  { key: "lolaFayeCafe", location: { lat: 1.3118, lng: 103.8615 } },
];

const PoiMarkers = ({ pois }: { pois: Poi[] }) => (
  <>
    {pois.map((poi) => (
      <AdvancedMarker key={poi.key} position={poi.location}>
        <Pin background="#3970B5" glyphColor="white" borderColor="#3970B5" />
      </AdvancedMarker>
    ))}
  </>
);

export const Maps = () => {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  const mapId = process.env.REACT_APP_GOOGLE_MAPS_MAP_ID;

  return (
    <Flex height="60vh" width="100%">
      <APIProvider
        apiKey={apiKey}
        onLoad={() => console.log("Maps API loaded successfully")}
      >
        <Map
          mapId={mapId}
          defaultZoom={13}
          defaultCenter={{ lat: 1.364917, lng: 103.822872 }}
          onCameraChanged={(ev: MapCameraChangedEvent) =>
            console.log(
              "camera changed:",
              ev.detail.center,
              "zoom:",
              ev.detail.zoom
            )
          }
        >
          <PoiMarkers pois={locations} />
        </Map>
      </APIProvider>
    </Flex>
  );
};
