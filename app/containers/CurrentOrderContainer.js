
import React from "react";
import {
    View,
    Text,
    KeyboardAvoidingView,
    Image,
    TouchableOpacity,
    Modal,
    TextInput,
    StyleSheet,
    Platform,
    NativeModules,
    NativeEventEmitter, Dimensions, Linking, AppState
} from "react-native";
import Assets from "../assets";
import { connect } from "react-redux";
import BaseContainer from "./BaseContainer";
import { saveUserDetailsInRedux } from "../redux/actions/User";
import MapView, { Marker, Polyline, Circle, PROVIDER_GOOGLE, Callout, AnimatedRegion } from 'react-native-maps';
import stylesheet from "../stylesheet/stylesheet";
import EDRTLView from "../components/EDRTLView";
import metrics from "../utils/metrics";
import EDText from "../components/EDText";
import EDThemeButton from '../components/EDThemeButton'
import DateComponent from "../components/DeliveryDetailComponent";
import DeliveryDetailComponent from "../components/DeliveryDetailComponent";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { colors } from "react-native-elements";
import { EDColors } from "../assets/Colors";
import { ETFonts } from "../assets/FontConstants";
import { strings } from "../locales/i18n";
import GeneralModel from "../components/GeneralModel";
import { NavigationEvents } from "react-navigation";
import MyCustomCallout from "../components/MyCustomCallout";
import { GET_PICKUP_ORDER, GET_DELIVERED_ORDER, GOOGLE_API_KEY, REVIEW_API, DRIVER_TRACKING, RESPONSE_SUCCESS, INR_SIGN, ACCEPTORDER } from "../utils/Constants";
import { apiPost } from "../api/ServiceManager";
import { apiGet } from '../api/APIManager'
import { showValidationAlert, showDialogue } from "../utils/CMAlert";
import { Messages } from "../utils/Messages";
import Moment, { relativeTimeThreshold } from "moment";
import { netStatus } from "../utils/NetworkStatusConnection";
import Geocoder from "react-native-geocoding";
import { isLocationEnable } from "../utils/LocationCheck";
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';
import PolylineDirection from '@react-native-maps/polyline-direction';

//AIzaSyD8DFmgyvYcEyrtPcx3kAhGh5s0wWYTSq4

let { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;
// const LATITUDE = 23.014785;
// const LONGITUDE = 72.5943723;
// const LATITUDE = 23.0694912;
// const LONGITUDE = 72.531968;
// const LATITUDE = 0.0;
// const LONGITUDE = 0.0;
const LATITUDE_DELTA = 0.05;
const LONGITUDE_DELTA = LATITUDE_DELTA * (width / height);

const LOCATION_UPDATE_INTERVAL = 15 * 1000

class CurrentOrderContainer extends React.Component {

    constructor(props) {
        super(props);
        this.currentOrderDict = this.props.navigation.state.params.currentOrder
        this.userDetails = this.props.userData
        console.log("CURRENT ORDER ::::::::: ", this.currentOrderDict)
        this.userData = this.props.userData
        this.watchID = null
        this.curr_longitude = 0.0
        this.curr_longitude = 0.0
        this.res_latitude = 0.0
        this.res_longitude = 0.0
        this.dest_latitude = 0.0
        this.dest_longitude = 0.0
        this.coords = {}
    }

    state = {
        isLoading: false,
        isModalVisible: false,
        strComment: "",
        isPickup: false,
        key: 1,
        // starRating: 0,
        curr_latitude: 23.0752311,
        curr_longitude: 72.5255534,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
    distance:"",
        res_distance: 0,
        // driver_distance: 0,
        // coords: {},
        appState: AppState.currentState
    }

    componentWillMount() {
        // BackgroundGeolocation.removeAllListeners();
    }

    componentDidMount() {
        BackgroundGeolocation.configure({
            desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
            // stationaryRadius: 50,
            distanceFilter: 5,
            notificationTitle: 'Background tracking',
            notificationText: 'enabled',
            debug: false,
            startOnBoot: false,
            stopOnTerminate: true,
            notificationsEnabled: true,
            locationProvider: BackgroundGeolocation.DISTANCE_FILTER_PROVIDER,
            interval: 10000,
            fastestInterval: 2000,
            activitiesInterval: 10000,
            stopOnStillActivity: false,
            url: DRIVER_TRACKING,
            httpHeaders: {
                'Content-Type': 'application/json'
            },
            // customize post properties
            postTemplate: {
                latitude: this.curr_latitude,
                longitude: this.curr_longitude,
                token: this.userDetails.PhoneNumber,
                user_id: this.userDetails.UserID  // you can also add your own properties
            }
        },
            success => {
                console.log("Configure Success ::::::: ", success)
            },
            fail => {
                console.log("Configure fail :::::::")
            }
        );

        // BackgroundGeolocation.on('motionchange', (motionchange) => {
        //     console.log("MOTION CHANGE ::::::::: ", motionchange);
        // })
        BackgroundGeolocation.getCurrentLocation(location => {
            console.log("CURRENT LOCATION ::::::::: ", location)
            this.setState({
                curr_latitude: location.latitude,
                curr_longitude: location.longitude
            })
            this.driverTracking(location.latitude, location.longitude)
        });
        BackgroundGeolocation.on('location', (location) => {
            console.log("LOCATION ::::::::: ", location)

            // this.curr_latitude = location.latitude
            // this.curr_longitude = location.longitude
            this.driverTracking(location.latitude, location.longitude)
            this.setState({
                curr_latitude: location.latitude,
                curr_longitude: location.longitude
            })

            // showDialogue(this.curr_latitude,[], this.curr_longitude)
            BackgroundGeolocation.startTask(taskKey => {
                console.log("TASK ::::::::: ", taskKey)
                // execute long running task
                // eg. ajax post location
                // IMPORTANT: task has to be ended by endTask
                BackgroundGeolocation.endTask(taskKey);
            });
        });

        BackgroundGeolocation.on('stationary', (stationaryLocation) => {
            // handle stationary locations here
            console.log("stationary ::::::::: ", stationaryLocation.latitude + " ---" + stationaryLocation.longitude)
            showDialogue(stationaryLocation.latitude, [], stationaryLocation.longitude)
            Actions.sendLocation(stationaryLocation);
        });

        BackgroundGeolocation.on('error', (error) => {
            console.log('[ERROR] BackgroundGeolocation error:', error);
        });

        BackgroundGeolocation.on('start', () => {
            console.log('[INFO] BackgroundGeolocation service has been started');
        });

        BackgroundGeolocation.on('stop', () => {
            console.log('[INFO] BackgroundGeolocation service has been stopped');
        });

        BackgroundGeolocation.on('authorization', (status) => {
            console.log('[INFO] BackgroundGeolocation authorization status: ' + status);
            if (status !== BackgroundGeolocation.AUTHORIZED) {
                // we need to set delay or otherwise alert may not be shown
                setTimeout(() =>
                    Alert.alert('App requires location tracking permission', 'Would you like to open app settings?', [
                        { text: 'Yes', onPress: () => BackgroundGeolocation.showAppSettings() },
                        { text: 'No', onPress: () => console.log('No Pressed'), style: 'cancel' }
                    ]), 1000);
            }
        });

        BackgroundGeolocation.on('background', () => {
            console.log('[INFO] App is in background');
        });

        BackgroundGeolocation.on('foreground', () => {
            console.log('[INFO] App is in foreground');
        });

        BackgroundGeolocation.on('abort_requested', () => {
            console.log('[INFO] Server responded with 285 Updates Not Required');
        });

        BackgroundGeolocation.on('http_authorization', () => {
            console.log('[INFO] App needs to authorize the http requests');
        });

        BackgroundGeolocation.checkStatus(status => {
            console.log('[INFO] BackgroundGeolocation service is running', status.isRunning);
            console.log('[INFO] BackgroundGeolocation services enabled', status.locationServicesEnabled);
            console.log('[INFO] BackgroundGeolocation auth status: ' + status.authorization);

            // you don't need to check status before start (this is just the example)
            if (!status.isRunning) {
                BackgroundGeolocation.start(); //triggers start on start event
            }
        });

        if (this.currentOrderDict.order_status.toLowerCase() === "preparing" || this.currentOrderDict.order_status.toLowerCase() === "ongoing") {
            // this.setState({ isLoading: true });
            // this.didFocusEventHandler();

            // this.setState({ isLoading: false });
            this.dest_latitude = parseFloat(this.currentOrderDict.latitude)
            this.dest_longitude = parseFloat(this.currentOrderDict.longitude)
            this.res_latitude = parseFloat(this.currentOrderDict.res_latitude)
            this.res_longitude = parseFloat(this.currentOrderDict.res_longitude)

            // this.getPolyline()

            // this.LocationTimer = setInterval(this.didFocusEventHandler,LOCATION_UPDATE_INTERVAL)
            // this.getLocationUpdates()

        }
        // else {
        //     this.didFocusEventHandler()
        // }


        this.trackArrivalTime(this.currentOrderDict.latitude,this.currentOrderDict.longitude,this.currentOrderDict.res_latitude,this.currentOrderDict.res_longitude)
        // this.didFocusEventHandler()

    }

    commentDidChange = setComment => {

        this.setstr = setComment
        // if (this.setstr.length === 0) {
            // this.state.isShow = false
            this.setState({
                strComment: this.setstr,
                // isShow: false
            })
        // } else {
            // this.setState({
            //     strComment: this.setstr,
                // isShow: true
            // })
        // }
    }

    // _handleAppStateChange = nextAppState => {
    //     console.log("app state", nextAppState);
    //     if (
    //         this.state.appState.match(/inactive|background/) &&
    //         nextAppState === "active"
    //     ) {
    //         console.log("App has come to the foreground!");

    //         if (this.isOpenSetting == true) {
    //             console.log("get back result successs");
    //             this.checkLocationIOS();
    //         }
    //     }
    //     this.setState({ appState: nextAppState });
    // };


    // didFocusEventHandler = (payload) => {
    //     if (Platform.OS === "android") {

    //         isLocationEnable(
    //             success => {


    //                 Geocoder.init(GOOGLE_API_KEY);

    //                 // this.setState({ isLoading: true });
    //                 navigator.geolocation.getCurrentPosition(
    //                     position => {
    //                         console.log("FUll LOCATION ::::::::::: ", position)
    //                         console.log('CURRENT ADDRESSS :::::: ', position.coords.latitude, " :::::::::: ", position.coords.longitude)

    //                         this.setState({
    //                             curr_latitude: position.coords.latitude,
    //                             curr_longitude: position.coords.longitude,
    //                             latitudeDelta: LATITUDE_DELTA,
    //                             longitudeDelta: LONGITUDE_DELTA,
    //                             // isLoading: false
    //                         }
    //                         );
    //                         // this.driverTracking(position.coords.latitude, position.coords.longitude)
    //                     },
    //                     error => {
    //                         console.log("ios DENIED");
    //                         showDialogue(strings("general.locationPermission"), [], "", () => {
    //                             this.isOpenSetting = true;
    //                             Linking.openURL("app-settings:");
    //                         });
    //                         // this.setState({ isLoading: false });
    //                         // this.setState({ error: error.message });
    //                     },
    //                     { enableHighAccuracy: false, timeout: 20000, maximumAge: 1000 }
    //                 );
    //             },
    //             error => {
    //                 console.log("error", error);
    //                 console.log("error", "Please allow location access from setting");
    //             },
    //             backPress => {
    //                 console.log(backPress);
    //             })
    //     } else {
    //         this.checkLocationIOS()
    //     }
    // }

    // checkLocationIOS() {
    //     Geocoder.init(GOOGLE_API_KEY);
    //     // this.setState({ isLoading: true });
    //     navigator.geolocation.getCurrentPosition(
    //         position => {
    //             console.log("FUll LOCATION ::::::::::: ", position)
    //             console.log('CURRENT ADDRESSS :::::: ', position.coords.latitude, " :::::::::: ", position.coords.longitude)

    //             this.setState({
    //                 curr_latitude: position.coords.latitude,
    //                 curr_longitude: position.coords.longitude,
    //                 latitudeDelta: LATITUDE_DELTA,
    //                 longitudeDelta: LONGITUDE_DELTA,
    //                 isLoading: false
    //             }
    //             );
    //             // this.driverTracking(position.coords.latitude, position.coords.longitude)
    //         },
    //         error => {
    //             console.log("ios DENIED");
    //             showDialogue(strings("general.locationPermission"), [], "", () => {
    //                 this.isOpenSetting = true;
    //                 Linking.openURL("app-settings:");
    //             });
    //             this.setState({ isLoading: false });
    //         },
    //         { enableHighAccuracy: true, distanceFilter: 1, timeout: 2000, maximumAge: 0 }
    //     );
    // }

    deliveredOrder = () => {
        // alert("Order Delivered")
        // this.removeLocationUpdates()

        // clearInterval(this.LocationTimer)
        this.props.navigation.navigate("OrderDeliveredContainer", {
            deliveryData: this.currentOrderDict
        })
    }
    trackArrivalTime = (sourceLat, sourcelong, destinationLat, destinationlong) => {
        // let arrival = `https://maps.googleapis.com/maps/api/directions/json?origin=${[this.state.rest_latitude, this.state.rest_longitude]}&destination=${[this.state.curr_latitude, this.state.curr_longitude]}&key=${GOOGLE_API_KEY}'
        let arrival = `https://maps.googleapis.com/maps/api/directions/json?origin=${[sourceLat, sourcelong]}&destination=${[destinationLat, destinationlong]}&key=${"AIzaSyD8DFmgyvYcEyrtPcx3kAhGh5s0wWYTSq4"}`
       fetch(arrival,{
           method:"GET"
       }).then(res=>res.json()).then(data=>{
           this.setState({
            distance:data.routes[0].legs[0].distance.text
           })
       }).catch(err=>{
           alert(err)
       })
    }
    pickUpOrderCheck = () => {
    var bcd=this.state.distance.split('')
    alert(bcd[0])
        console.log("PICK UP FUNCTION CALL :::::::::::::::::::::: ")
        let param = {
            token: this.userDetails.PhoneNumber,
            user_id: this.userDetails.UserID,
            order_id: this.currentOrderDict.order_id,
            KM:bcd[0]
        }
        this.setState({ isLoading: true })
        netStatus(status => {
            if (status) {

                apiPost(
                    ACCEPTORDER,
                    param,
                    onSuccess => {
                        // this.setState({ isLoading: false })
                        console.log("PICK UP DATA ::::::::::: ", onSuccess)
                        if (onSuccess.status == RESPONSE_SUCCESS) {
                            // alert(JSON.stringify(onSuccess))
                        //     this.acceptOrderArray = onSuccess.user_detail



                            // this.destination = {
                            this.dest_latitude = parseFloat(onSuccess.order_details.order_lat),
                                this.dest_longitude = parseFloat(onSuccess.order_details.order_long)
                            // }

                            // this.rest_Location = {
                            this.res_latitude = parseFloat(onSuccess.restaurant_address.latitude),
                                this.res_longitude = parseFloat(onSuccess.restaurant_address.longitude)
                            // }
                            this.props.navigation.goBack();


                            // this.getPolyline()
                            // this.isPickup = true

                            // this.distance(this.dest_latitude, this.dest_longitude, this.res_latitude, this.res_longitude, "K")

                            // this.LocationTimer = setInterval(this.didFocusEventHandler, LOCATION_UPDATE_INTERVAL)
                            // this.getLocationUpdates()
                        } 
                        else {
                            this.setState({ isLoading: false })
                            showDialogue(strings("order.pickup"), [], "",
                                () => {
                                    this.props.navigation.goBack();
                                }
                            )
                        }

                    },
                    onFailure => {
                        // alert(JSON.stringify(onFailure))
                        console.log("PickUp response fail :::::::: ")
                        this.setState({ isLoading: false })
                        showDialogue(strings("order.pickup"), [], "",
                            () => {
                                this.props.navigation.goBack();
                            }
                        )
                    }
                )
            } else {
                // console.log("error", err)
                showValidationAlert(Messages.internetConnnection);
            }
        })
    }

    // getPolyline = () => {

    //     console.log("CurrentLocation :::::: ", this.dest_latitude, " :::::::::: ", this.dest_longitude, " :::::::::: ", this.res_latitude, " ::::::::::::: ", this.res_longitude);
    //     this.mode = 'driving';
    //     this.url = `https://maps.googleapis.com/maps/api/directions/json?origin=${[this.dest_latitude, this.dest_longitude]}&destination=${[this.res_latitude, this.res_longitude]}&key=${GOOGLE_API_KEY}&mode=${this.mode}`;
    //     // this.url = `https://maps.googleapis.com/maps/api/directions/json?origin=${this.state.res_latitude},${this.state.res_longitude}&destination=${this.state.dest_latitude},${this.state.dest_longitude}&mode=driving&key=AIzaSyCAzKH0AVRyXkKrP6XEcK2i9bGMHwr771c`
    //     apiGet(
    //         this.url,
    //         onSuccess => {
    //             console.log("LOATIOn SUCCESS ::::::::: ", onSuccess)
    //             var routesArray = onSuccess.routes
                
                
    //             this.state.coords = this.decode(onSuccess.routes[0].overview_polyline.points)
    //             this.setState({ isLoading: false })


    //         },
    //         onFailure => {
    //             console.log("LOATIOn FAILURE ::::::::: ", onFailure)
    //             this.setState({ isLoading: false })
    //         }
    //     )
    // }

    decode = (t, e) => { for (var n, o, u = 0, l = 0, r = 0, d = [], h = 0, i = 0, a = null, c = Math.pow(10, e || 5); u < t.length;) { a = null, h = 0, i = 0; do a = t.charCodeAt(u++) - 63, i |= (31 & a) << h, h += 5; while (a >= 32); n = 1 & i ? ~(i >> 1) : i >> 1, h = i = 0; do a = t.charCodeAt(u++) - 63, i |= (31 & a) << h, h += 5; while (a >= 32); o = 1 & i ? ~(i >> 1) : i >> 1, l += n, r += o, d.push([l / c, r / c]) } return d = d.map(function (t) { return { latitude: t[0], longitude: t[1] } }) }

    // async getLocationUpdates() {

    //     this.watchID = navigator.geolocation.watchPosition(
    //         (position) => {

    //             console.log("DESTINATION :::::::::::: ", this.dest_latitude)
    //             this.driverTracking()

    //             this.setState({
    //                 curr_latitude: position.coords.latitude,
    //                 curr_longitude: position.coords.longitude,
    //                 latitudeDelta: LATITUDE_DELTA,
    //                 longitudeDelta: LONGITUDE_DELTA,
    //                 // region:{
    //                 //     latitude: position.coords.latitude,
    //                 //     longitude: position.coords.longitude,
    //                 //     latitudeDelta: LATITUDE_DELTA,
    //                 //     longitudeDelta: LONGITUDE_DELTA
    //                 // }
    //             }
    //             );

    //             console.log('getLocationUpdates=====>', position);
    //         },
    //         (error) => {

    //             this.setState({ location: error, isLoading: false });
    //             console.log(error);
    //         },
    //         { enableHighAccuracy: true, distanceFilter: 0, interval: LOCATION_UPDATE_INTERVAL, maximumAge:10000 }
    //     );
    // }

    driverTracking = (latitude, longitude) => {

        let param = {
            token: this.userDetails.PhoneNumber,
            user_id: this.userDetails.UserID,
            latitude: latitude,
            longitude: longitude,

        }

        netStatus(status => {
            if (status) {

                apiPost(
                    DRIVER_TRACKING,
                    param,
                    onSuccess => {

                        console.log("Location Successfully :::::::: ")
                        // this.setState({
                        //     // isLoading: false,
                        //     key: this.state.key + 1
                        // });
                    },
                    onFailure => {
                        console.log("Location Unsuccessfully :::::::: ")
                        // this.setState({
                        //     // isLoading: false
                        // });
                    }
                )
            } else {
                // console.log("error", err)
                showValidationAlert(Messages.internetConnnection);
            }
        })
    }

    distance = (lat1, lon1, lat2, lon2, unit) => {
        if ((lat1 == lat2) && (lon1 == lon2)) {
            return 0;
        }
        else {
            var radlat1 = Math.PI * lat1 / 180;
            var radlat2 = Math.PI * lat2 / 180;
            var theta = lon1 - lon2;
            var radtheta = Math.PI * theta / 180;
            var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
            if (dist > 1) {
                dist = 1;
            }
            dist = Math.acos(dist);
            dist = dist * 180 / Math.PI;
            dist = dist * 60 * 1.1515;
            if (unit == "K") { dist = dist * 1.609344 }
            if (unit == "N") { dist = dist * 0.8684 }
            console.log("KKKKKKKKKKKKKKKKKKKKKKKKKK ::::::::::::::::::::: ", dist)

            // this.state.driver_distance = dist

            this.state.res_distance = Math.ceil(dist)
            return dist;
        }
    }

    reviewAPI = () => {
        let param = {
            token: this.userDetails.PhoneNumber,
            user_id: this.userDetails.UserID,
            order_id: this.currentOrderDict.order_id,
            driver_map_id: this.currentOrderDict.driver_map_id,
            order_status: "cancel",
            cancel_reason: this.state.strComment
        }

        apiPost(
            GET_PICKUP_ORDER,
            param,
            onSuccess => {
                // this.removeLocationUpdates()

                // clearInterval(this.LocationTimer)
                this.setState({ isModalVisible: false });
            },
            onFailure => {
                this.setState({ isModalVisible: false });
            }
        )
    }

    connectToCall = (calls) => {
        let strLinkToOpen = "tel:" + calls;
        console.log("strLinkToOpen == " + strLinkToOpen);
        Linking.canOpenURL(strLinkToOpen).then(supported => {
            if (!supported) {
                showDialogue(Messages.callNotAccessible);
            } else {
                return Linking.openURL(strLinkToOpen).catch(err => {
                    showDialogue("SOS CALL ERROR " + err);
                });
            }
        });
    };


    removeLocationUpdates = () => {
        if (this.watchID !== null) {
            navigator.geolocation.clearWatch(this.watchID);
        }
    }

    reviewDialog() {
        return (
            <GeneralModel
                isVisible={this.state.isModalVisible}
                colors={EDColors.primary}
                value={this.state.strComment}
                buttonstyle={{ backgroundColor: this.state.strComment.trim() !== "" ? EDColors.primary : EDColors.buttonUnreserve }}
                placeholder={strings("general.cancelreview")}
                label={strings("general.reviewcancel")}
                numberOfLines={5}
                multiline={true}
                style={{ padding: 10, height: metrics.screenHeight * 0.145, width: metrics.screenWidth * 0.55, borderRadius: 2, borderColor: EDColors.borderColor, borderWidth: 1, fontFamily: ETFonts.regular, marginTop: metrics.screenHeight * 0.015 }}
                onChangeText={this.commentDidChange}
                isNoHide={true}
                YesTitle={strings("signUp.Submit")}
                activeOpacity={this.state.strComment.trim() !== "" ? 0 : 1}
                onYesClick={data => {
                    if (this.state.strComment.trim() !== "") {
                        BackgroundGeolocation.removeAllListeners();
                        this.reviewAPI()
                        this.props.navigation.goBack();
                    } else {
                        this.setState({
                            isModalVisible: true
                        })
                    }

                }}

                onNoClick={data => {
                    console.log(data);
                    this.setState({ isModalVisible: false })
                }}

            />
        );
    }


    render() {
        // console.log("ISDELIVER ::::::::::::::::: ", this.isPickup)
        // console.log("ORDER DDET ::::::::::::::::: ", this.state.coords)
        console.log("Current location ::::::: ", this.state.curr_latitude)
        console.log("res Location ::::::::::: ", this.res_latitude)
        console.log("dest Location ::::::::::: ", this.dest_latitude)
        return (
            <BaseContainer
                title={strings("home.currentorder")}
                left={Assets.backWhite}
                right={[]}
                onLeft={() => {
                    this.props.navigation.goBack();
                }}
                isLoading={this.state.isLoading}
            >
                <View style={{ flex: 1, backgroundColor: EDColors.white }}>



                    <MapView
                        // key={this.state.key}
                        // style={styles.map}
                        style={{ flex: 1, width: metrics.screenWidth * 0.916, marginVertical: 10, alignSelf: 'center' }}
                        // initialRegion={this.state.region}
                        region={{
                            latitude: this.state.curr_latitude,
                            longitude: this.state.curr_longitude,
                            latitudeDelta: this.state.latitudeDelta,
                            longitudeDelta: this.state.longitudeDelta
                        }}

                        // region={this.getMapRegion()}
                        // onRegionChangeComplete={region => this.setState({ region })}
                        provider={Platform.OS == "ios" ? null : PROVIDER_GOOGLE}
                        // zoomControlEnabled={true}
                        // zoomEnabled={true}
                        // followUserLocation
                        // showsUserLocation={this.acceptOrderArray !== undefined ? true : false}
                        zoom={100}
                    >
                        {/* Driver marker */}
                        {/* {this.state.curr_latitude !== 0 ?  */}
                        <Marker
                            // key={this.state.key}

                            coordinate={{
                                latitude: this.state.curr_latitude,
                                longitude: this.state.curr_longitude,
                                // latitudeDelta: this.state.latitudeDelta,
                                // longitudeDelta: this.state.longitudeDelta
                            }}
                            // coordinate={this.state.region}
                            image={Assets.driver}
                        />
                        {/* <Callout>
                                <MyCustomCallout
                                    title={this.currentOrderDict.name}
                                    discription={this.currentOrderDict.address}
                                />
                            </Callout>
                        </Marker> */}

                        {/* Destination Marker */}
                        {this.currentOrderDict.order_status === "placed" || this.currentOrderDict.order_status === "driver" || this.currentOrderDict.order_status === "preparing"?
                            // <Polyline
                            //     coordinates={
                            //         this.state.coords
                            //     }
                            //     strokeColor={EDColors.primary}
                            //     strokeWidth={2}
                            //     geodesic={true}
                            // />
                            <PolylineDirection
                            origin={{latitude:this.currentOrderDict.res_latitude,longitude:this.currentOrderDict.res_longitude}}
                            destination={{
                                latitude: this.state.curr_latitude,
                                longitude: this.state.curr_longitude
                            }}
                            apiKey={'AIzaSyD8DFmgyvYcEyrtPcx3kAhGh5s0wWYTSq4'}
                            strokeWidth={4}
                            strokeColor={EDColors.primary}
                          />
                    
                            
                            :
                            <PolylineDirection
                            origin={{latitude:this.currentOrderDict.latitude,longitude:this.currentOrderDict.longitude}}
                            destination={{
                                latitude: this.state.curr_latitude,
                                longitude: this.state.curr_longitude
                            }}
                            apiKey={'AIzaSyD8DFmgyvYcEyrtPcx3kAhGh5s0wWYTSq4'}
                            strokeWidth={4}
                            strokeColor={EDColors.primary}
                          />
                            }



                        {/* restaurant user */}

                        {/* {this.currentOrderDict.order_status !== "placed" || this.currentOrderDict.order_status !== "driver" ? */}
                            <Marker
                                coordinate={{
                                    latitude:parseFloat(this.currentOrderDict.latitude),
                                    longitude:parseFloat(this.currentOrderDict.longitude),
                                }}
                     

                            image={Assets.location_selected}
                            >



                                {/* <Callout>
                                    <MyCustomCallout
                                        title={this.currentOrderDict.name}
                                        discription={this.state.res_distance + " KM"}
                                        image={{ uri: this.currentOrderDict.image }}
                                        onPress={() => this.connectToCall(this.currentOrderDict.phone_number)}
                                    />
                                </Callout> */}




                            </Marker>

                        {/* {this.currentOrderDict.order_status !== "placed" || this.currentOrderDict.order_status !== "driver" ? */}
                            <Marker
                                coordinate={{
                                    latitude:parseFloat(this.currentOrderDict.res_latitude),
                                    longitude:parseFloat(this.currentOrderDict.res_longitude)
                                 }}
                                image={Assets.destination}
                            >
                                </Marker>
                            {/* : null} */}

                    </MapView>

                    {this.orderViewRender()}
                    {this.reviewDialog()}
                </View>
            </BaseContainer>
        )
    }

    orderViewRender() {
        return (
            <View style={styles.mainView}>
                <EDRTLView style={{ height: metrics.screenHeight * 0.06, backgroundColor: EDColors.backgroundLight, alignItems: 'center' }}>
                    <Text style={{ marginHorizontal: metrics.screenWidth * 0.036, fontSize: hp("2.5%"), fontFamily: ETFonts.bold }}>{"#Order id " + this.currentOrderDict.order_id}</Text>
                </EDRTLView>
                <EDRTLView>
                    <View style={{ flex: 6, marginHorizontal: metrics.screenWidth * 0.036 }}>
                        <EDText
                            style={{ fontFamily: ETFonts.light, fontSize: hp("2.0%"), marginVertical: metrics.screenHeight * 0.021 }}
                            label={"" + this.currentOrderDict.user_name + " delivery order"}
                        />
                        <DeliveryDetailComponent
                            style={{ marginBottom: metrics.screenHeight * 0.021 }}
                            source={Assets.location_selected} label={this.currentOrderDict.address} />
                        <DeliveryDetailComponent
                            style={{ marginBottom: metrics.screenHeight * 0.021 }}
                            source={Assets.calender}
                            label={"Date : " + Moment(this.currentOrderDict.date).format(
                                "DD MMMM YYYY"
                            )}
                        />
                        {(this.currentOrderDict.payment_type==="Cash on Delivery")
                        ?
                        <EDText
                        style={{ flex: 1, fontSize: hp("2.0%"), fontFamily: ETFonts.bold, marginVertical: metrics.screenHeight * 0.0107 }}
                        label={"Cash to Collect - " + INR_SIGN + this.currentOrderDict.total_rate}
                    />
                    :
                    null
                    }
                      
                    </View>
                    <View style={{ flex: 2, alignItems: 'center', }}>
                        <Image
                            style={{ width: metrics.screenWidth * 0.1111, height: metrics.screenWidth * 0.1111, marginTop: metrics.screenHeight * 0.022 }}
                            source={this.currentOrderDict.user_image === "" ? Assets.name : { uri: this.currentOrderDict.user_image }}
                            resizeMode='cover' />
                        <TouchableOpacity style={{ marginTop: - metrics.screenHeight * 0.025, marginLeft: metrics.screenWidth * 0.10, zIndex: 1000 }} onPress={() => this.connectToCall(this.currentOrderDict.phone_number)}>
                            <Image
                                style={{ width: 40, height: 40 }}
                                resizeMode='cover'
                                source={Assets.call_order} />
                        </TouchableOpacity>

                    </View>
                </EDRTLView>

                <View style={{ borderColor: EDColors.borderColor, marginVertical: metrics.screenHeight * 0.015, borderWidth: 0.9 }} />
                <EDRTLView style={{ justifyContent: 'space-evenly', marginBottom: metrics.screenHeight * 0.015 }}>
                    <EDThemeButton
                        label={this.currentOrderDict.order_status === "driver" ? "Order Accept" : "Order Delivered" }
                        textStyle={{ fontSize: hp("1.8%") }}
                        style={{
                            width: metrics.screenWidth * 0.4, height: metrics.screenHeight * 0.053,
                            backgroundColor: EDColors.primary

                        }}
                        fontSizeNew={10}

                        onPress={() => {
                            // alert(this.state.isOrderDeliver)
                            if (this.currentOrderDict.order_status === "driver") {
                                this.pickUpOrderCheck()

                            } else
                            //  if(this.state.isOrderDeliver === true)
                            {
                             
                                BackgroundGeolocation.removeAllListeners();
                                this.deliveredOrder()
                            }
                        }
                        }
                    // this.state.isOrderDeliver ? this.isPickup ? this.pickUpOrderCheck : this.deliveredOrder : this.pickUpOrderCheck}
                    />

                    <EDThemeButton
                        label={strings("general.cancel")}
                        textStyle={{ fontSize: hp("1.8%") }}
                        style={{ width: metrics.screenWidth * 0.4, height: metrics.screenHeight * 0.053, backgroundColor: this.currentOrderDict.status == "delivered" ? EDColors.buttonUnreserve : EDColors.primary }}
                        fontSizeNew={10}
                        onPress={() => {
                            this.setState({ isModalVisible: true })
                            // this.currentOrderDict.status == "delivered" ? this.setState({ isModalVisible: false }) :
                            // this.isPickup ? this.setState({ isModalVisible: true }) : this.setState({ isModalVisible: false })
                        }}
                    // onPress={() => {
                    //     // this.currentOrderDict.status == "delivered" ? 
                    //     this.props.navigation.navigate("OrderDeliveredContainer",{
                    //         orderDetail: this.currentOrderDict
                    //     })
                    // }}
                    // onPress = {this.pickUpOrderCheck}
                    // activeOpacity={this.currentOrderDict.status === "delivered" ? 1 : 0}
                    />
                </EDRTLView>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    map: {
        ...StyleSheet.absoluteFillObject
    },
    mainView: {
        width: metrics.screenWidth * 0.916,
        marginBottom: metrics.screenWidth * 0.042,
        alignSelf: 'center',
        backgroundColor: EDColors.white,
        borderWidth: 1,
        borderRadius: 6,
        borderColor: EDColors.borderColor
    }
})

export default connect(
    state => {
        return {
            userData: state.userOperations.userData
        };
    },
    dispatch => {
        return {
            saveCredentials: detailsToSave => {
                dispatch(saveUserDetailsInRedux(detailsToSave));
            }
        };
    }
)(CurrentOrderContainer);