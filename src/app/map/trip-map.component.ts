import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMapsModule, GoogleMap } from '@angular/google-maps';
import { tripPalMapStyles } from './map-styles';


/** Example itinerary interface - match your actual structure. */
export interface ItineraryItem {
  placeName: string;
  lat: number;
  lng: number;
  startTime: string;
  endTime: string;
  cost: number;
  dayIndex: number;
}

@Component({
  selector: 'app-trip-map',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule],
  template: `
    <div class="map-container relative w-full h-full">
      <button 
        (click)="toggleMapType()" 
        style="position: absolute; top: 1rem; left: 1rem; z-index: 1000; background: #65ccf5; color: white; padding: 0.5rem 1rem; border-radius: 4px;">
        {{ isSatelliteView ? 'Switch to Styled Map' : 'Switch to Satellite View' }}
      </button>

      <google-map
        [center]="center"
        [zoom]="zoom"
        [options]="mapOptions"
        (mapClick)="onMapClick($event)"
        class="test absolute inset-0 object-cover"
        style="width: 100%; height: 100%;"
      >
      </google-map>
    </div>
  `,
  styles: [`
    .map-container {
      position: relative;
      height: 100%;
      width: 100%;
    }
  
    ::ng-deep google-map > div {
    width: 100% !important;
    height: 100% !important;
    }

  `]
})
export class TripMapComponent implements OnInit {
  @ViewChild('googleMap') googleMap!: GoogleMap;
  @Input() location: string | null = null;
  @Output() placeClicked = new EventEmitter<ItineraryItem>();
  center: google.maps.LatLngLiteral = { lat: 40.7128, lng: -74.0060 }; // default
  zoom = 12;

  mapOptions: google.maps.MapOptions = {
    mapTypeId: 'roadmap',
    mapTypeControl: false,
    styles: tripPalMapStyles,
  };

  isSatelliteView = false;

  ngOnInit(): void {
    // If we have a location from the parent, geocode it to recenter the map
    if (this.location) {
      this.geocodeAddress(this.location);
    }
  }

  /**
   * Called whenever the user clicks on the map
   */
  onMapClick(event: google.maps.MapMouseEvent) {
    if (!event.latLng) return;

    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    // Reverse-geocode to find a place name
    this.reverseGeocode(lat, lng).then(placeName => {
      // Build a new itinerary item (default dayIndex = 1, or decide logic)
      const newItem: ItineraryItem = {
        placeName,
        lat,
        lng,
        startTime: '',
        endTime: '',
        cost: 0,
        dayIndex: 1
      };
      // Emit to parent
      this.placeClicked.emit(newItem);
    });
  }

  private geocodeAddress(address: string): void {
    if (!(window as any).google?.maps) {
      console.warn('Google Maps script not loaded');
      return;
    }
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results && results.length > 0) {
        const latLng = results[0].geometry.location;
        this.center = { lat: latLng.lat(), lng: latLng.lng() };
      } else {
        console.warn('Geocode was not successful for address "' + address + '": ' + status);
      }
    });
  }

  private reverseGeocode(lat: number, lng: number): Promise<string> {
    return new Promise(resolve => {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results.length > 0) {
          resolve(results[0].formatted_address || 'Map Pin');
        } else {
          resolve('Map Pin');
        }
      });
    });
  }

  toggleMapType(): void {
    this.isSatelliteView = !this.isSatelliteView;
    if (this.isSatelliteView) {
      // Use 'hybrid' for satellite imagery with labels
      this.mapOptions = {
        ...this.mapOptions,
        mapTypeId: 'hybrid',
        styles: [] // Remove custom styles so that labels appear
      };
    } else {
      // Revert back to the styled roadmap view
      this.mapOptions = {
        ...this.mapOptions,
        mapTypeId: 'roadmap',
        styles: tripPalMapStyles
      };
    }
  }
  
  
}

  