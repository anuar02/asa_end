import React, { useState, useEffect } from 'react';
import ReactMapGL, { NavigationControl, GeolocateControl, Marker, Popup } from 'react-map-gl';
import polyline from '@mapbox/polyline';
import axios from 'axios';

const mapboxAccessToken = 'pk.eyJ1IjoiYW1pZGFtYXJ1MTEiLCJhIjoiY2xzd3F4b2ZwMWdueDJybXVveXp4d2FqMSJ9._aFwfiCYo7BBiwmGUbj1xg';


const MapGl = () => {
    const [viewport, setViewport] = useState({
        width: '100%',
        height: '100%',
        latitude: 51.127701,
        longitude: 71.405521,
        zoom: 10,
    });

    const [routeGeometry, setRouteGeometry] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:3000/route');
                // const decodedRoute = polyline.decode(response.data.geometry);
                // setRouteGeometry(decodedRoute);
            } catch (error) {
                console.error('Error fetching route:', error);
            }
        };
        fetchData();
    }, []);

    return (
        <ReactMapGL
            {...viewport}
            width="100vw"
            height="100vh"
            mapStyle="mapbox://styles/mapbox/streets-v11"
            onViewportChange={setViewport}
            mapboxApiAccessToken={mapboxAccessToken}
        >
            <div style={{ position: 'absolute', right: 30, top: 30 }}>
                <NavigationControl />
            </div>
            <div style={{ position: 'absolute', right: 30, top: 80 }}>
                <GeolocateControl />
            </div>
            {routeGeometry && (
                <Marker
                    longitude={routeGeometry[0][0]}
                    latitude={routeGeometry[0][1]}
                    offsetLeft={-20}
                    offsetTop={-10}
                >
                    <div>Start</div>
                </Marker>
            )}
            {routeGeometry && (
                <Marker
                    longitude={routeGeometry[routeGeometry?.length - 1][0]}
                    latitude={routeGeometry[routeGeometry?.length - 1][1]}
                    offsetLeft={-20}
                    offsetTop={-10}
                >
                    <div>End</div>
                </Marker>
            )}
            {routeGeometry && (
                <div>
                    <PolylineOverlay points={routeGeometry} />
                </div>
            )}
        </ReactMapGL>
    );
};

const PolylineOverlay = ({ points }) => {
    return (
        <svg style={{ position: 'absolute', width: '100%', height: '100%' }}>
            <polyline
                points={points.map(point => point.join(',')).join(' ')}
                fill="none"
                stroke="#007bff"
                strokeWidth="4"
            />
        </svg>
    );
};

export default MapGl;
