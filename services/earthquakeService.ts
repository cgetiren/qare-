import axios from 'axios';
import { Earthquake } from '../types';

// Primary Source: Kandilli Wrapper
const PRIMARY_API_URL = 'https://api.orhanaydogdu.com.tr/deprem/kandilli/live';

// Backup Source: USGS (Filtered for Turkey Region: ~35-43N, 25-45E)
const BACKUP_API_URL = 'https://earthquake.usgs.gov/fdsnws/event/1/query';

const formatDate = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd} ${hh}:${min}:${ss}`;
};

const fetchPrimaryEarthquakes = async (): Promise<Earthquake[]> => {
  const response = await axios.get(PRIMARY_API_URL, {
    params: { limit: 100 },
    timeout: 15000 // 15 seconds timeout
  });

  if (response.data.status && Array.isArray(response.data.result)) {
    return response.data.result.map((item: any) => {
      let lat = item.lat || item.latitude;
      let lng = item.lng || item.longitude;
      
      if ((!lat || !lng) && item.geojson?.coordinates) {
         lng = item.geojson.coordinates[0];
         lat = item.geojson.coordinates[1];
      }
      
      let mag = item.mag;
      if (mag === undefined && item.size) {
          mag = item.size.ml || item.size.md || item.size.mw || 0;
      }

      return {
        id: item.earthquake_id || item._id || `${item.date}-${item.title}`,
        date: item.date,
        timestamp: item.timestamp || item.date,
        latitude: typeof lat === 'string' ? parseFloat(lat) : (lat || 0),
        longitude: typeof lng === 'string' ? parseFloat(lng) : (lng || 0),
        depth: typeof item.depth === 'string' ? parseFloat(item.depth) : (item.depth || 0),
        mag: typeof mag === 'string' ? parseFloat(mag) : (mag || 0),
        title: item.title || 'Bilinmeyen Konum',
      };
    });
  }
  throw new Error("Invalid format from Primary API");
};

const fetchBackupEarthquakes = async (): Promise<Earthquake[]> => {
  console.log("Switching to Backup API (USGS)...");
  const response = await axios.get(BACKUP_API_URL, {
    params: {
      format: 'geojson',
      minlatitude: 35,
      maxlatitude: 43,
      minlongitude: 25,
      maxlongitude: 45,
      limit: 100,
      orderby: 'time'
    },
    timeout: 15000
  });

  if (response.data.features && Array.isArray(response.data.features)) {
    return response.data.features.map((item: any) => {
      const props = item.properties;
      const coords = item.geometry.coordinates; // [lng, lat, depth]
      const dateObj = new Date(props.time);
      
      return {
        id: item.id,
        date: formatDate(dateObj),
        timestamp: props.time.toString(),
        latitude: coords[1],
        longitude: coords[0],
        depth: coords[2],
        mag: props.mag || 0,
        title: props.place || 'Bilinmeyen Konum',
      };
    });
  }
  return [];
};

export const fetchEarthquakes = async (): Promise<Earthquake[]> => {
  try {
    return await fetchPrimaryEarthquakes();
  } catch (primaryError) {
    console.warn("Primary API failed, trying backup...", primaryError);
    try {
      return await fetchBackupEarthquakes();
    } catch (backupError) {
      console.error("All APIs failed:", backupError);
      return [];
    }
  }
};
