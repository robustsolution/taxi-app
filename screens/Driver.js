/* eslint-disable no-sparse-arrays */
import React, { Component } from 'react'
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Image,
  Linking,
  Platform,
  Alert,
} from 'react-native'
import MapView, { Polyline, Marker } from 'react-native-maps';
import BottomButton from '../components/BottomButton';
import { io } from 'socket.io-client'
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';
import { socketIoURL } from '../baseUrl'
export default class Driver extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lookingForPassengers: false,
      buttonText: 'FIND PASSENGER'
    };
    this.lookForPassengers = this.lookForPassengers.bind(this);
    this.acceptPassengerRequest = this.acceptPassengerRequest.bind(this);
    this.socket = null;
  }

  componentDidMount() {
    BackgroundGeolocation.configure({
      desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
      stationaryRadius: 50,
      distanceFilter: 50,
      debug: false,
      startOnBoot: false,
      stopOnTerminate: true,
      locationProvider: BackgroundGeolocation.ACTIVITY_PROVIDER,
      interval: 10000,
      fastestInterval: 5000,
      activitiesInterval: 10000,
      stopOnStillActivity: false
    });

    BackgroundGeolocation.on('authorization', (status) => {
      console.log(
        '[INFO] BackgroundGeolocation authorization status: ' + status
      );
      if (status !== BackgroundGeolocation.AUTHORIZED) {
        // we need to set delay or otherwise alert may not be shown
        setTimeout(
          () =>
            Alert.alert(
              'App requires location tracking permission',
              'Would you like to open app settings?',
              [
                {
                  text: 'Yes',
                  onPress: () => BackgroundGeolocation.showAppSettings()
                },
                {
                  text: 'No',
                  onPress: () => console.log('No Pressed'),
                  style: 'cancel'
                },
                ,
              ]
            ),
          1000
        );
      }
    });
  }

  async lookForPassengers() {
    if (this.state.lookingForPassengers) {
      this.setState({
        lookingForPassengers: false
      });
      return;
    }

    this.setState({
      lookingForPassengers: true,
      buttonText: 'FINDING PASSENGERS'
    });

    this.socket = io(socketIoURL);

    this.socket.on('connect', () => {
      this.socket.emit('lookingForPassengers');
    });

    this.socket.on('taxiRequest', async (routeResponse) => {
      await this.props.getRouteDirections(
        routeResponse.geocoded_waypoints[0].place_id
      );
      this.map.fitToCoordinates(this.props.pointCoords, {
        edgePadding: { top: 20, bottom: 20, left: 80, right: 80 }
      });
      this.setState({
        buttonText: 'PASSENGER FOUND! PRESS TO ACCEPT',
        lookingForPassengers: false,
        passengerFound: true,
      });
    });
  }

  acceptPassengerRequest() {
    const passengerLocation = this.props.pointCoords[
      this.props.pointCoords.length - 1
    ];
    // this.setState({
    //   lookingForPassengers: false,
    // });
    BackgroundGeolocation.checkStatus((status) => {
      console.log(
        '[INFO] BackgroundGeolocation service is running',
        status.isRunning
      )
      console.log(
        '[INFO] BackgroundGeolocation services enabled',
        status.locationServicesEnabled
      )
      console.log(
        '[INFO] BackgroundGeolocation auth status: ' + status.authorization
      );

      // you don't need to check status before start (this is just the example)
      if (!status.isRunning) {
        console.log('start', status.isRunning);
        BackgroundGeolocation.start(); //triggers start on start event
      }
    });
    BackgroundGeolocation.on('location', (location) => {
      //Send driver location to paseenger socket io backend
      this.socket.emit('driverLocation', {
        latitude: location.latitude,
        longitude: location.longitude
      });
    });

    if (Platform.OS === 'ios') {
      Linking.openURL(
        `http://maps.apple.com/?daddr=${passengerLocation.latitude},${passengerLocation.longitude}`
      );
    } else {
      Linking.openURL(
        `geo:0,0?q=${passengerLocation.latitude},${passengerLocation.longitude}(Passenger)`
      );
    }
  }

  render() {
    let endMarker = null;
    let startMarker = null;
    let findingPassengerActIndicator = null;
    let bottomButtonFunction = this.lookForPassengers;

    if (this.props.latitude === null) {
      return null;
    }

    if (this.state.lookingForPassengers) {
      findingPassengerActIndicator = (
        <ActivityIndicator
          size="large"
          animating={this.state.lookingForPassengers}
          color="white"
        />
      );
    }

    if (this.state.passengerFound) {
      //passengerSearchText = 'FOUND PASSENGER! PRESS TO ACCEPT RIDE?';
      bottomButtonFunction = this.acceptPassengerRequest;
    }

    if (this.props.pointCoords.length > 1) {
      endMarker = (
        <Marker
          coordinate={
            this.props.pointCoords[this.props.pointCoords.length - 1]
          }>
          <Image
            style={{ width: 40, height: 40 }}
            source={require('../images/person-marker.png')}
          />
        </Marker>
      );
    }

    return (
      <View style={styles.mapStyle}>
        <MapView
          ref={(map) => {
            this.map = map;
          }}
          style={styles.mapStyle}
          initialRegion={{
            latitude: this.props.latitude,
            longitude: this.props.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121
          }}
          showsUserLocation={true}>
          <Polyline
            coordinates={this.props.pointCoords}
            strokeWidth={2}
            strokeColor="red"
          />
          {endMarker}
          {startMarker}
        </MapView>

        <BottomButton
          onPressFunction={bottomButtonFunction}
          buttonText={this.state.buttonText}>
          {findingPassengerActIndicator}
        </BottomButton>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  bottomButton: {
    backgroundColor: 'black',
    padding: 20,
    paddingRight: 40,
    paddingLeft: 40,
    marginTop: 'auto',
    margin: 20,
    alignSelf: 'center'
  },
  bottomButtonText: {
    color: 'white',
    fontSize: 20
  },
  suggestions: {
    backgroundColor: 'white',
    fontSize: 14,
    padding: 5,
    borderWidth: 0.5,
    marginRight: 20,
    marginLeft: 20
  },
  destinationInput: {
    height: 40,
    borderWidth: 0.5,
    marginTop: 50,
    marginRight: 20,
    marginLeft: 20,
    padding: 5,
    backgroundColor: 'white'
  },
  mapStyle: {
    ...StyleSheet.absoluteFillObject
  }
});
