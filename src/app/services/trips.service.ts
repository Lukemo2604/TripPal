import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FamilyAttendee {
  familyMemberId: string;
  name: string;
  attending: boolean;
}

export interface ItineraryItem {
  placeName: string;
  placeId?: string;
  lat: number;
  lng: number;
}

export interface Trip {
  _id: string;
  userId: string;
  location: string;
  startDate?: string;
  endDate?: string;
  flights?: string;
  accommodation?: string;
  familyAttending?: FamilyAttendee[];
  budget?: number;
  notes?: string;
  itinerary?: ItineraryItem[];
}

@Injectable({
  providedIn: 'root'
})
export class TripsService {
  private baseUrl = 'http://localhost:5000/api';  // adjust if needed

  constructor(private http: HttpClient) {}

  // Get ALL trips for current user
  getTrips(): Observable<Trip[]> {
    return this.http.get<Trip[]>(`${this.baseUrl}/trips`);
  }

  // Get single trip by ID
  getTrip(tripId: string): Observable<Trip> {
    return this.http.get<Trip>(`${this.baseUrl}/trips/${tripId}`);
  }

  // Create a new trip
  createTrip(tripData: Partial<Trip>): Observable<Trip> {
    return this.http.post<Trip>(`${this.baseUrl}/trips`, tripData);
  }

  // Update an existing trip (PATCH)
  updateTrip(tripId: string, updates: Partial<Trip>): Observable<Trip> {
    return this.http.patch<Trip>(`${this.baseUrl}/trips/${tripId}`, updates);
  }

  // Delete a trip
  deleteTrip(tripId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/trips/${tripId}`);
  }
}

