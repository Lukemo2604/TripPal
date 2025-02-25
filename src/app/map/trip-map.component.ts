// src/app/trip-map.component.ts
import {
    Component,
    OnInit,
    ViewChild,
    ElementRef,
    AfterViewInit
  } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { GoogleMapsModule, MapInfoWindow, MapMarker } from '@angular/google-maps';
  
  @Component({
    selector: 'app-trip-map',
    standalone: true,
    imports: [
      CommonModule,
      GoogleMapsModule
    ],
    template: `
      <div class="map-container">
        <google-map
          height="500px"
          width="100%"
          [center]="center"
          [zoom]="zoom"
          (mapClick)="onMapClick($event)">
        </google-map>
  
        <div class="place-log">
          <h3>Clicked Places</h3>
          <ul>
            <li *ngFor="let item of itinerary">
              {{ item.placeName }} ({{ item.lat }}, {{ item.lng }})
            </li>
          </ul>
        </div>
      </div>
    `,
    styles: [`
      .map-container {
        position: relative;
        width: 100%;
      }
      .place-log {
        margin-top: 20px;
      }
      ul {
        list-style: none;
        padding-left: 0;
      }
    `]
  })
  export class TripMapComponent implements OnInit, AfterViewInit {
    center: google.maps.LatLngLiteral = { lat: 40.7128, lng: -74.0060 }; // default to NYC
    zoom = 12;
  
    // A simplified itinerary: array of clicked places
    itinerary: { lat: number; lng: number; placeName: string }[] = [];
  
    map!: google.maps.Map; // We'll reference the raw Map object if needed
    mapLoaded = false;
  
    ngOnInit(): void {
      // Could set center dynamically or from a trip's lat/lng
    }
  
    ngAfterViewInit(): void {
      // The <google-map> component automatically loads
      // If we want the raw map instance:
      // We can get it by hooking into the *MapReady* event
    }
  
    onMapClick(event: google.maps.MapMouseEvent): void {
      if (!event.latLng) return;
  
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
  
      // Option A: Just store a "custom place"
      // Option B: use PlacesService to find a nearby place
      this.findNearestPlace(lat, lng);
    }
  
    // Example method using the Places library (PlaceSearch)
    private findNearestPlace(lat: number, lng: number) {
      // We need the raw map object for PlacesService. We'll do a short hack:
      // The @angular/google-maps <google-map> has a 'mapInitialized' event, or:
      if (!window.google?.maps) return;
  
      // Create a dummy map or if we have a ref to the real map object
      // Because @angular/google-maps v13+ can give a map reference in a separate event
      const mapDiv = document.createElement('div');
      const tempMap = new google.maps.Map(mapDiv);
      const service = new google.maps.places.PlacesService(tempMap);
  
      const request: google.maps.places.PlaceSearchRequest = {
        location: new google.maps.LatLng(lat, lng),
        radius: 10 // search within 10 meters
      };
  
      service.nearbySearch(request, (results, status) => {
        if (
          status === google.maps.places.PlacesServiceStatus.OK &&
          results?.length
        ) {
          // Found a recognized place
          const place = results[0];
          const name = place.name || 'Unnamed Place';
          this.itinerary.push({
            lat,
            lng,
            placeName: name
          });
        } else {
          // No recognized place, store a custom location
          this.itinerary.push({
            lat,
            lng,
            placeName: 'Custom Place'
          });
        }
      });
    }
  }
  