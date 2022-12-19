import React, {Component} from 'react';
import {Keyboard, PermissionsAndroid, Platform} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import PolyLine from '@mapbox/polyline';
import apiKey from '../google_api_key';

function genericContainer(WrappedComponent) {
  return class extends Component {
    constructor(props) {
      super(props);
      this.state = {
        latitude: null,
        longitude: null,
        pointCoords: [],
        destination: '',
        routeResponse: {},
      };
      this.getRouteDirections = this.getRouteDirections.bind(this);
    }

    componentWillUnmount() {
      Geolocation.clearWatch(this.watchId);
    }

    async checkAndroidPermissions() {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Taxi App',
            message:
              'Taxi App needs to see you location to show routes and get taxis',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return true;
        } else {
          return false;
        }
      } catch (err) {
        console.warn('error permission', err);
      }
    }

    async componentDidMount() {
      let granted = false;
      if (Platform.OS === 'ios') {
        granted = true;
      } else {
        granted = await this.checkAndroidPermissions();
      }
      if (granted) {
        //Get current location and set initial region to this
        this.watchId = Geolocation.watchPosition(
          (position) => {
            this.setState({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
            //  this.getRouteDirections();
          },
          (error) => console.error(error),
          {enableHighAccuracy: true, timeout: 20000, maximumAge: 2000},
        );
      }
    }

    async getRouteDirections(placeId, destinationName) {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/directions/json?origin=${this.state.latitude},${this.state.longitude}&destination=place_id:${placeId}&key=${apiKey}`,
        );
        const json = await response.json();
        console.log('json getroutedirection', this.state.latitude);
        const points = PolyLine.decode(json.routes[0].overview_polyline.points);
        const pointCoords = points.map((point) => {
          return {latitude: point[0], longitude: point[1]};
        });
        this.setState({
          pointCoords,
          routeResponse: json,
        });
        Keyboard.dismiss();
        return destinationName;
      } catch (err) {
        console.log('Lol', err);
      }
    }

    render() {
      return (
        <WrappedComponent
          getRouteDirections={this.getRouteDirections}
          latitude={this.state.latitude}
          longitude={this.state.longitude}
          pointCoords={this.state.pointCoords}
          destination={this.state.destination}
          routeResponse={this.state.routeResponse}
        />
      );
    }
  };
}

export default genericContainer;
