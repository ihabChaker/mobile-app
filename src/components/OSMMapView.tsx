import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta?: number;
  longitudeDelta?: number;
}

export interface Marker {
  id: string | number;
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
  color?: string;
  onPress?: () => void;
}

export interface Polyline {
  id: string | number;
  coordinates: Array<{ latitude: number; longitude: number }>;
  color?: string;
  width?: number;
}

interface OSMMapViewProps {
  style?: any;
  initialRegion: MapRegion;
  markers?: Marker[];
  polylines?: Polyline[];
  showUserLocation?: boolean;
  onMarkerPress?: (markerId: string | number) => void;
}

/**
 * OpenStreetMap component for React Native using WebView + Leaflet
 */
export const OSMMapView: React.FC<OSMMapViewProps> = ({
  style,
  initialRegion,
  markers = [],
  polylines = [],
  showUserLocation = false,
  onMarkerPress,
}) => {
  const webViewRef = useRef<WebView>(null);

  // Update markers when they change
  useEffect(() => {
    if (webViewRef.current && markers.length > 0) {
      const markersData = JSON.stringify(markers);
      webViewRef.current.injectJavaScript(`
        window.updateMarkers(${markersData});
        true;
      `);
    }
  }, [markers]);

  // Update polylines when they change
  useEffect(() => {
    if (webViewRef.current && polylines.length > 0) {
      const polylinesData = JSON.stringify(polylines);
      webViewRef.current.injectJavaScript(`
        window.updatePolylines(${polylinesData});
        true;
      `);
    }
  }, [polylines]);

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'markerPress' && onMarkerPress) {
        onMarkerPress(data.markerId);
      }
    } catch {
      // Silently ignore invalid messages
    }
  };

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body, html {
      margin: 0;
      padding: 0;
      height: 100%;
      width: 100%;
    }
    #map {
      height: 100%;
      width: 100%;
    }
    .leaflet-popup-content-wrapper {
      border-radius: 8px;
    }
    .leaflet-popup-content {
      margin: 12px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .popup-title {
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 4px;
      color: #1a202c;
    }
    .popup-description {
      font-size: 12px;
      color: #4a5568;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    // Initialize map
    const map = L.map('map', {
      zoomControl: true,
      attributionControl: true,
    }).setView([${initialRegion.latitude}, ${initialRegion.longitude}], ${
      initialRegion.latitudeDelta
        ? Math.round(12 - Math.log2(initialRegion.latitudeDelta))
        : 13
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Store markers and polylines
    let markersLayer = L.layerGroup().addTo(map);
    let polylinesLayer = L.layerGroup().addTo(map);
    let userLocationMarker = null;

    // Create custom colored marker icon
    const createMarkerIcon = (color = '#3B82F6') => {
      return L.divIcon({
        className: 'custom-marker',
        html: \`<div style="background-color: \${color}; width: 24px; height: 24px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>\`,
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        popupAnchor: [0, -24],
      });
    };

    // Update markers function
    window.updateMarkers = (markersData) => {
      markersLayer.clearLayers();
      
      markersData.forEach(marker => {
        const icon = createMarkerIcon(marker.color);
        const m = L.marker([marker.latitude, marker.longitude], { icon })
          .addTo(markersLayer);
        
        if (marker.title || marker.description) {
          const popupContent = \`
            \${marker.title ? \`<div class="popup-title">\${marker.title}</div>\` : ''}
            \${marker.description ? \`<div class="popup-description">\${marker.description}</div>\` : ''}
          \`;
          m.bindPopup(popupContent);
        }
        
        m.on('click', () => {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'markerPress',
            markerId: marker.id
          }));
        });
      });
      
      // Auto-fit bounds if multiple markers
      if (markersData.length > 1) {
        const bounds = L.latLngBounds(markersData.map(m => [m.latitude, m.longitude]));
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    };

    // Update polylines function
    window.updatePolylines = (polylinesData) => {
      polylinesLayer.clearLayers();
      
      polylinesData.forEach(polyline => {
        if (polyline.coordinates && polyline.coordinates.length >= 2) {
          const latLngs = polyline.coordinates.map(coord => [coord.latitude, coord.longitude]);
          L.polyline(latLngs, {
            color: polyline.color || '#3B82F6',
            weight: polyline.width || 3,
            opacity: 0.7,
          }).addTo(polylinesLayer);
        }
      });
    };

    // Show user location
    ${
      showUserLocation
        ? `
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          if (userLocationMarker) {
            userLocationMarker.setLatLng([latitude, longitude]);
          } else {
            const userIcon = L.divIcon({
              className: 'user-location-marker',
              html: '<div style="background-color: #3B82F6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 2px #3B82F6;"></div>',
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            });
            
            userLocationMarker = L.marker([latitude, longitude], { icon: userIcon })
              .addTo(map)
              .bindPopup('Votre position');
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        },
        { enableHighAccuracy: true }
      );
    }
    `
        : ''
    }

    // Initial data
    window.updateMarkers(${JSON.stringify(markers)});
    window.updatePolylines(${JSON.stringify(polylines)});
  </script>
</body>
</html>
  `;

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        geolocationEnabled={showUserLocation}
        onMessage={handleMessage}
        scrollEnabled={false}
        bounces={false}
        originWhitelist={['*']}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

export default OSMMapView;
