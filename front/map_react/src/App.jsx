import React, { useEffect, useState } from 'react';
import ReactMapGL, {GeolocateControl, NavigationControl, Source, Layer, Marker} from 'react-map-gl';
import './App.css';

function App() {
  const [viewport, setViewport] = useState({
    width: '100%',
    height: '100%',
    latitude: 51.127701,
    longitude: 71.405521,
    zoom: 10,
  });

  const [points, setPoints] = useState([]);
  const [isWebSocketOpen, setIsWebSocketOpen] = useState(false); // Track WebSocket connection status
  const [startLat, setStartLat] = useState(51.127701);
  const [startLng, setStartLng] = useState(71.405521);
  const [endLat, setEndLat] = useState(0);
  const [endLng, setEndLng] = useState(0);
  const [stop, setStop] = useState(false);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
        (position) => {
          setEndLat(position.coords.latitude);
          setEndLng(position.coords.longitude);
        },
        (error) => {
          console.error('Error getting user location:', error);
        }
    );
  }, []);

  const mapboxAccessToken = 'pk.eyJ1IjoiYW1pZGFtYXJ1MTEiLCJhIjoiY2xzd3F4b2ZwMWdueDJybXVveXp4d2FqMSJ9._aFwfiCYo7BBiwmGUbj1xg';

  const handleWebSocketStart = () => {
    const numberOfPoints = 10;

    const ws = new WebSocket('ws://localhost:3000');

    ws.onopen = () => {
      console.log('Connected to WebSocket server');
      setIsWebSocketOpen(true); // Update WebSocket connection status
      // Send start and end coordinates to the server
      ws.send(JSON.stringify({ startLat, startLng, endLat, endLng, numberOfPoints }));
    };

    ws.onmessage = (event) => {
      const point = JSON.parse(event.data);
      console.log('Received point:', point);
      setPoints((prevPoints) => [...prevPoints, point]);
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket server');
      setIsWebSocketOpen(false); // Update WebSocket connection status
      setStop(true)
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsWebSocketOpen(false); // Update WebSocket connection status
    };

    // Close WebSocket connection when the component unmounts
    return () => {
      console.log('Closing WebSocket connection');
      ws.close();
    };
  };

  const postStartFinishPoints = () => {
    const numberOfPoints = 20;

    fetch('http://localhost:3000/route', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ startLat, startLng, endLat, endLng, numberOfPoints }),
    })
        .then((response) => response.json())
        .then((data) => {
          console.log('Route data:', data);
          // Handle received route data if necessary
        })
        .catch((error) => {
          console.error('Error posting start and finish points:', error);
        });
  };

  const resetPoints = () => {
    setPoints([]);
  };

  return (
      <div className="app-container">
        <h1>Points Along Route</h1>
        <div className="input-container">
          <div>
            <div className="input-group">
              <label>Start Latitude:</label>
              <input type="number" value={startLat} onChange={(e) => setStartLat(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Start Longitude:</label>
              <input type="number" value={startLng} onChange={(e) => setStartLng(e.target.value)} />
            </div>
          </div>
          <div className="input-group">
            <label>End Latitude: </label>
            {endLat}
          </div>
          <div className="input-group">
            <label>End Longitude: </label>
            {endLng}
          </div>
        </div>
        <div className="button-container">
          <button onClick={handleWebSocketStart} disabled={isWebSocketOpen}>
            {isWebSocketOpen ? 'WebSocket Connected' : 'Start WebSocket'}
          </button>
          <button onClick={postStartFinishPoints}>Post Start & Finish Points</button>
          <button onClick={resetPoints}>Reset</button>

        </div>
        <ReactMapGL
            {...viewport}
            width="60vw"
            height="60vh"
            mapStyle="mapbox://styles/mapbox/streets-v11"
            onViewportChange={setViewport}
            mapboxApiAccessToken={mapboxAccessToken}
        >
          <div className="navigation-control">
            <NavigationControl />
          </div>
          <div className="geolocate-control">
            <GeolocateControl />
          </div>
          <Source id="route" type="geojson" data={{
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: points.map(point => [parseFloat(point.lng), parseFloat(point.lat)]),
            },
          }}>
            <Layer
                id="route"
                type="line"
                source="route"
                layout={{
                  'line-join': 'round',
                  'line-cap': 'round',
                }}
                paint={{
                  'line-color': '#007bff',
                  'line-width': 8,
                }}
            />
          </Source>
        </ReactMapGL>
      </div>
  );
}

export default App;
