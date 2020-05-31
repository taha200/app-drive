import React from "react";
import {
  View,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  StyleSheet,
  Text,
  Modal
} from "react-native";
import { NavigationEvents, StackActions, NavigationActions } from 'react-navigation'
import Geocoder from "react-native-geocoding";
import RNRestart from "react-native-restart";
import I18n from "react-native-i18n";
import {
  GOOGLE_API_KEY,
  REGISTRATION_HOME,
  RESPONSE_SUCCESS,
  SEARCH_PLACEHOLDER,
  isRTLCheck,
  getIsRTL,
  GET_ALL_ORDER,
  LOGIN_URL,
  LOGOUT_API,
  CHANGE_TOKEN,
  DRIVER_TRACKING
} from "../utils/Constants";
import Assets from "../assets";
import BaseContainer from "./BaseContainer";
import HomeCategoryCard from "../components/HomeCategoryCard";
import PopularRestaurantCard from "../components/PopularRestaurantCard";
import { apiPost, apiGet } from "../api/ServiceManager";
import { EDColors } from "../assets/Colors";
import ETextViewNormalLable from "../components/ETextViewNormalLable";
import { getUserToken, getCartList, saveLanguage, flushAllData } from "../utils/AsyncStorageHelper";
import { showValidationAlert, showDialogue } from "../utils/CMAlert";
import { connect } from "react-redux";
import { saveNavigationSelection } from "../redux/actions/Navigation";
import BannerImages from "../components/BannerImages";
import DataNotAvailableContainer from "../components/DataNotAvailableContainer";
import { netStatus } from "../utils/NetworkStatusConnection";
import { Messages } from "../utils/Messages";
import { ETFonts } from "../assets/FontConstants";
import SegmentedControlTab from 'react-native-segmented-control-tab'
import { saveLanguageInRedux, saveLogoutInRedux, removeUserDetailsOnLogout, saveUserDetailsInRedux, saveUserTokenInRedux } from "../redux/actions/User";
import EDRTLView from "../components/EDRTLView";
import metrics from "../utils/metrics";
import EDThemeButton from "../components/EDThemeButton";
import EDButton from "../components/EDButton";
import EDText from '../components/EDText';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { strings } from "../locales/i18n";
import SegmentComponent from "../components/SegmentComponent";
import { saveOrderDetailsInRedux } from "../redux/actions/Order";
import EDPlaceholderView from "../components/EDPlaceholderView";
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';

class MainContainer extends React.Component {
  constructor(props) {
    super(props);
    this.userDetails = this.props.userData
    headerPhoneNum = "";
    strSearch = "";
    this.foodType = "";
    this.distance = "";
    this.modelSelected = "";
    this.currentOrderArray = [];
    this.pastOrderArray = [];
    this.accepted=[];
    // this.count = 0;
  }

  state = {
    latitude: 0.0,
    longitude: 0.0,
    error: null,
    isLoading: false,
    strAddress: null,
    isNetConnected: true,
    count: 0,
    selectedIndex: 0,
    strOnMessage: 'No Orders'
  };
  handleIndexChange = (index) => {
    this.setState({
      ...this.state,
      selectedIndex: index,
    });
  }
  componentDidMount() {
      
    BackgroundGeolocation.configure({
      desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
      distanceFilter: 5,
      debug: false,
      startOnBoot: false,
      stopOnTerminate: true,
      notificationsEnabled: false,
      locationProvider: BackgroundGeolocation.DISTANCE_FILTER_PROVIDER,
      interval: 2000,
      fastestInterval: 2000,
      activitiesInterval: 10000,
      stopOnStillActivity: false
  },
  success =>{
      console.log("Configure Success ::::::: ", success)
  },
  fail => {
      console.log("Configure fail :::::::")
  }
  );
  BackgroundGeolocation.getCurrentLocation(location => {
    console.log("CURRENT LOCATION ::::::::: ", location)
    //  alert(JSON.stringify(location))
    this.latitude = location.latitude,
    this.longitude = location.longitude
    this.fetchHomeData(this.latitude, this.longitude)
})
 setInterval(()=>{
  BackgroundGeolocation.getCurrentLocation(location => {
    console.log("CURRENT LOCATION ::::::::: ", location)
    //  alert(JSON.stringify(location))
    this.latitude = location.latitude,
    this.longitude = location.longitude
    this.fetchHomeData(this.latitude, this.longitude)
});

 },15000)

  }

  lanSelectClick = () => {
    let lan = I18n.currentLocale();
    // if (this.state.lanImage == Assets.ar_selected) {
    if (isRTLCheck()) {
      lan = "en";
      I18n.locale = "en";
    } else {
      lan = "ar";
      I18n.locale = "ar";
    }

    this.props.saveLanguageRedux(lan);

    saveLanguage(
      lan,
      success => {
        getIsRTL();
        RNRestart.Restart();
      },
      error => { }
    );
  };

  changeTokenAPI = () => {
    let params = {
      token: this.userDetails.PhoneNumber,
      user_id: this.userDetails.UserID,
      firebase_token: this.props.token
    }
    apiPost(
      CHANGE_TOKEN,
      params,
      success => {
        console.log("Change Token success ::::::::::: ", success)
      },
      failure => {
        console.log("Change Token failure ::::::::::: ", failure)
      }

    )
  }

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
                },
                onFailure => {
                    console.log("Location Unsuccessfully :::::::: ")
                }
            )
        } else {
            // console.log("error", err)
            showValidationAlert(Messages.internetConnnection);
        }
    })
  }

  fetchHomeData = (lat,lng) => {

    this.setState({
      isLoading: true
    })
    let param = {
      token : this.userDetails.PhoneNumber,
      user_id : this.userDetails.UserID,
      latitude:lat,
      longitude:lng
    }
    // apiPost(
    //   GET_ALL_ORDER,
    //   param,
    //   onSuccess => {
    //     this.currentOrderArray = onSuccess.order_list.current
    //     this.pastOrderArray = onSuccess.order_list.past
    //     this.accepted= onSuccess.order_list.accepted
    //     alert(this.accepted.length)
    //     console.log("CURRENT DATA ::::::::::::: ", this.currentOrderArray)
    //     console.log("PAST DATA :::::::::::: ", this.pastOrderArray)
    //     this.props.saveOrder(this.pastOrderArray)

    //     this.currentOrderArray.length !==0 || this.currentOrderArray.length !== 0 ? 
    //     this.setState({
    //       isLoading: false
    //     }) : this.setState({
    //       strOnMessage: strings("order.noorder"),
    //       isLoading: false
    //     })
    //   },
    //   onFailure => {
    //     console.log("FAILURE :::::::::::: ", onFailure)
    //     this.setState({
    //       strOnMessage: strings("order.noorder"),
    //       isLoading: false
    //     })
    //   }
    // )
    
    netStatus(status => {

      if (status) {
        apiPost(
          GET_ALL_ORDER,
          param,
          onSuccess => {
              this.currentOrderArray = onSuccess.order_list.current
        this.pastOrderArray = onSuccess.order_list.past
        this.accepted= onSuccess.order_list.accepted
    //  alert(JSON.stringify(onSuccess))
            console.log("CURRENT DATA ::::::::::::: ", this.currentOrderArray)
            console.log("PAST DATA :::::::::::: ", this.pastOrderArray)
            this.props.saveOrder(this.pastOrderArray)

            this.pastOrderArray.length !==0 || this.currentOrderArray.length !== 0 || this.accepted.length !== 0 ? 
            this.setState({
              isLoading: false
            }) : this.setState({
              strOnMessage: strings("order.noorder"),
              isLoading: false
            })
          },
          onFailure => {
            console.log("FAILURE :::::::::::: ", onFailure)
            this.setState({
              strOnMessage: strings("order.noorder"),
              isLoading: false
            })
          }
        )
      } else {
        // console.log("error", err)
        showValidationAlert(Messages.internetConnnection);
      }
    });
  }

  navigateToCurrentOrderContainer = (orderData) => {
    this.props.navigation.navigate("CurrentOrderContainer", {
      currentOrder: orderData
    })
  }

  navigateToPastOrderContainer = (pastData) => {
    this.props.navigation.navigate("MyEarningContainer")
  }

  createCurrentView = () => {
    return (

      <FlatList
        // style={{ marginTop: 10}}
        extraData={this.state}
        data={this.currentOrderArray}
        // data={isRTLCheck() ? this.state.selectedIndex == 0 ? this.arrayPastCategories : this.arrayCategories : this.state.selectedIndex == 0 ? this.arrayCategories : this.arrayPastCategories}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => item + index}
        // renderItem={this.state.selectedIndex == 0 ? this.createPastView : this.createCurrentView}
        renderItem={({ item, index }) => (


          <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            {/* This is main view */}
            <EDRTLView style={{ backgroundColor: 'white', marginVertical: 5, justifyContent: 'space-evenly', borderRadius: 2, width: metrics.screenWidth * 0.93, height: metrics.screenHeight * 0.12 }}>

              {/* Show image  */}
              <View style={{ justifyContent: 'center', marginHorizontal: metrics.screenWidth * 0.04, marginVertical: metrics.screenHeight * 0.015 }}>
                <Image
                  style={{ width: metrics.screenWidth * 0.15, height: metrics.screenWidth * 0.15, borderRadius: 5, borderWidth: 1 }}
                  source={{uri : item.image}}
                  // position="relative"
                  // resizeMode="contain"
                />
              </View>

              {/* //Show middle Text */}
              <View style={{ flex: 2, flexDirection: "column", justifyContent: 'space-evenly', height: metrics.screenWidth * 0.15, alignSelf: 'center' }}>
                <EDText style={{ flex: 1, fontFamily: ETFonts.bold, fontSize: hp("2.0%") }} label={item.name} />

                {/* </Text> */}
                <EDText style={{ flex: 1, fontFamily: ETFonts.regular, fontSize: hp("1.8%"), color: "grey" }} label={"#Order id - " + item.order_id} />
                {/* <Text style={{ fontFamily: ETFonts.regular, fontSize: hp("1.8%"), fontWeight: "200", color: "grey", marginTop: 10 }}>
              {item.Order_ID}
            </Text> */}
              </View>

              {/* Show View button */}
              <TouchableOpacity style={{ width: metrics.screenWidth * 0.2, height: metrics.screenWidth * 0.07, backgroundColor: EDColors.primary, borderRadius: 2, alignSelf: 'center', justifyContent: 'center', alignItems: 'center', marginHorizontal: metrics.screenWidth * 0.04 }} 
              onPress={() => this.navigateToCurrentOrderContainer(item)}>
                <Text style={{ fontFamily: ETFonts.bold, fontSize: hp("1.8%"), color: "white" }}>
                  {strings("Profile.view")}
                </Text>
              </TouchableOpacity>

            </EDRTLView>
          </View>
        )}
      />
    );
  };
  acceptedOrders = () => {
    return (

      <FlatList
        // style={{ marginTop: 10}}
        extraData={this.state}
        data={this.accepted}
        // data={isRTLCheck() ? this.state.selectedIndex == 0 ? this.arrayPastCategories : this.arrayCategories : this.state.selectedIndex == 0 ? this.arrayCategories : this.arrayPastCategories}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => item + index}
        // renderItem={this.state.selectedIndex == 0 ? this.createPastView : this.createCurrentView}
        renderItem={({ item, index }) => (
   
          <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            {/* This is main view */}
            <EDRTLView style={{ backgroundColor: 'white', marginVertical: 5, justifyContent: 'space-evenly', borderRadius: 2, width: metrics.screenWidth * 0.93, height: metrics.screenHeight * 0.12 }}>

              {/* Show image  */}
              <View style={{ justifyContent: 'center', marginHorizontal: metrics.screenWidth * 0.04, marginVertical: metrics.screenHeight * 0.015 }}>
                <Image
                  style={{ width: metrics.screenWidth * 0.15, height: metrics.screenWidth * 0.15, borderRadius: 5, borderWidth: 1 }}
                  source={{uri : item.image}}
                  // position="relative"
                  // resizeMode="contain"
                />
              </View>

              {/* //Show middle Text */}
              <View style={{ flex: 2, flexDirection: "column", justifyContent: 'space-evenly', height: metrics.screenWidth * 0.15, alignSelf: 'center' }}>
                <EDText style={{ flex: 1, fontFamily: ETFonts.bold, fontSize: hp("2.0%") }} label={item.name} />

                {/* </Text> */}
                <EDText style={{ flex: 1, fontFamily: ETFonts.regular, fontSize: hp("1.8%"), color: "grey" }} label={"#Order id - " + item.order_id} />
                {/* <Text style={{ fontFamily: ETFonts.regular, fontSize: hp("1.8%"), fontWeight: "200", color: "grey", marginTop: 10 }}>
              {item.Order_ID}
            </Text> */}
              </View>

              {/* Show View button */}
              <TouchableOpacity style={{ width: metrics.screenWidth * 0.2, height: metrics.screenWidth * 0.07, backgroundColor: EDColors.primary, borderRadius: 2, alignSelf: 'center', justifyContent: 'center', alignItems: 'center', marginHorizontal: metrics.screenWidth * 0.04 }} 
              onPress={() => this.navigateToCurrentOrderContainer(item)}>
                <Text style={{ fontFamily: ETFonts.bold, fontSize: hp("1.8%"), color: "white" }}>
                  {strings("Profile.view")}
                </Text>
              </TouchableOpacity>

            </EDRTLView>
          </View>
        )}
      />
    );
  };

  createPastView = () => {
    return (

      <FlatList
        // style={{ marginTop: 10}}
        extraData={this.state}
        data={this.pastOrderArray}
        // data={isRTLCheck() ? this.state.selectedIndex == 0 ? this.arrayPastCategories : this.arrayCategories : this.state.selectedIndex == 0 ? this.arrayCategories : this.arrayPastCategories}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => item + index}
        // renderItem={this.state.selectedIndex == 0 ? this.createPastView : this.createCurrentView}
        renderItem={({ item, index }) => (


          <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            {/* This is main view */}
            <EDRTLView style={{ backgroundColor: 'white', marginVertical: 5, justifyContent: 'space-evenly', borderRadius: 2, width: metrics.screenWidth * 0.93, height: metrics.screenHeight * 0.12 }}>

              {/* Show image  */}
              <View style={{ justifyContent: 'center', marginHorizontal: metrics.screenWidth * 0.04, marginVertical: metrics.screenHeight * 0.015 }}>
                <Image
                  style={{ width: metrics.screenWidth * 0.15, height: metrics.screenWidth * 0.15, borderRadius: 5, borderWidth: 1 }}
                  source={{uri : item.image}}
                  // position="relative"
                  // resizeMode="contain"
                />
              </View>

              {/* //Show middle Text */}
              <View style={{ flex: 2, flexDirection: "column", justifyContent: 'space-evenly', height: metrics.screenWidth * 0.15, alignSelf: 'center' }}>
                <EDText style={{ flex: 1, fontFamily: ETFonts.bold, fontSize: hp("2.0%") }} label={item.name} />

                {/* </Text> */}
                <EDText style={{ flex: 1, fontFamily: ETFonts.regular, fontSize: hp("1.8%"), color: "grey" }} label={"#Order id - " + item.order_id} />
                {/* <Text style={{ fontFamily: ETFonts.regular, fontSize: hp("1.8%"), fontWeight: "200", color: "grey", marginTop: 10 }}>
              {item.Order_ID}
            </Text> */}
              </View>

              {/* Show View button */}
              <TouchableOpacity style={{ width: metrics.screenWidth * 0.2, height: metrics.screenWidth * 0.07, backgroundColor: EDColors.primary, borderRadius: 2, alignSelf: 'center', justifyContent: 'center', alignItems: 'center', marginHorizontal: metrics.screenWidth * 0.04 }} onPress={()=>this.navigateToPastOrderContainer(item)}>
                <Text style={{ fontFamily: ETFonts.bold, fontSize: hp("1.8%"), color: "white" }}>
                  {strings("Profile.view")}
                </Text>
              </TouchableOpacity>

            </EDRTLView>
          </View>

        )}
      />
    );
  };

  logoutDialog() {
    return (
      <Modal
        visible={this.props.isLogout}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          this.setState({ isLogout: false });
        }}
      >
        <View style={style.modalContainer}>
          <View style={style.modalSubContainer}>
            <Text style={style.deleteTitle}>
              Are you sure you want to log out?
            </Text>

            <View style={style.optionContainer}>
              <Text
                style={style.deleteOption}
                onPress={() => {
                  this.setState({
                    isLoading: true
                  })
                  let params = {
                    token:this.props.token,
                    user_id: this.userDetails.UserID
                  }
                  apiPost(
                    LOGOUT_API,
                    params,
                    onSuccess => {
                      this.props.saveLogout(false)
                      // this.props.removeDetailFromRedux([]);
                      
                      flushAllData(
                        response => {
                          // this.props.saveCartCount(0);
                          this.props.navigation.popToTop()
                          this.props.navigation.dispatch(
                            StackActions.reset({
                              index: 0,
                              actions: [NavigationActions.navigate({ routeName: "LoginContainer" })]
                            })
                          );
                          this.setState({
                            isLoading: false
                          })
                        },
                        error => { 
                          this.setState({
                            isLoading: false
                          })
                        }
                      );
                    },
                    onFailure => {
                      this.setState({
                        isLoading: false
                      })
                      showDialogue(strings("general.generalWebServiceError"))
                    }
                    )
                  
                }}
              >
                Yes
              </Text>

              <Text
                style={style.deleteOption}
                onPress={() => {
                  this.props.saveLogout(false)
                }}
              >
                No
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  render() {

    return (
      <BaseContainer
        title={"Orders"}
        left={Assets.menu}
        onLeft={() => {
          this.props.navigation.openDrawer();
        }}
        // right={isRTLCheck() ? Assets.ar_selected : Assets.en_selected}
        // onRight={this.lanSelectClick}
        isLoading={this.state.isLoading}
      >
        <NavigationEvents
        onDidFocus={payload => {
          this.fetchHomeData(this.latitude, this.longitude)
          this.changeTokenAPI()
        }
        }
          onDidBlur={payload => {
            
            getIsRTL();
            this.forceUpdate();
            this.fetchHomeData(this.latitude, this.longitude)
            this.props.saveNavigationSelection(isRTLCheck() ? "HomeRight" : "Home");
          }} />

        <SegmentComponent
          // style={{ flexDirection: isRTLCheck() ? 'row-reverse' : 'row' }}
          arrayList={["Upcoming","Past","Active"]}

          firstView={this.currentOrderArray.length > 0 ? this.createCurrentView() : <EDPlaceholderView messageToDisplay={this.state.strOnMessage} />}
          secondView={this.pastOrderArray.length > 0 ? this.createPastView() : <EDPlaceholderView messageToDisplay={this.state.strOnMessage} />}
          thirdView={this.accepted.length > 0 ? this.acceptedOrders() : <EDPlaceholderView messageToDisplay={this.state.strOnMessage} />}

       />
        {/* <View style={{ flex: 1, backgroundColor: EDColors.background }}>
          <View style={{ padding: metrics.screenWidth * 0.05 }}>
            <SegmentedControlTab
              values={isRTLCheck() ? [strings("home.pastorder"), strings("home.currentorder")] : [strings("home.currentorder"), strings("home.pastorder")]}
              selectedIndex={this.state.selectedIndex}
              onTabPress={this.handleIndexChange}
              tabStyle={{ width: metrics.screenWidth * 0.855, height: metrics.screenHeight * 0.076, borderColor: EDColors.primary }}
              activeTabStyle={{ backgroundColor: EDColors.primary }}
              tabTextStyle={{ color: EDColors.primary, fontFamily: ETFonts.regular, fontSize: hp('2.5%') }}
            />
          </View>

          <View style={{ flex: 1 }}>
            {this.state.selectedIndex == 0 ?
              <FlatList
                // style={{ marginTop: 10}}
                extraData={this.state}
                data={isRTLCheck() ? this.arrayPastCategories : this.arrayCategories}
                // data={isRTLCheck() ? this.state.selectedIndex == 0 ? this.arrayPastCategories : this.arrayCategories : this.state.selectedIndex == 0 ? this.arrayCategories : this.arrayPastCategories}
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => item + index}
                // renderItem={this.state.selectedIndex == 0 ? this.createPastView : this.createCurrentView}
                renderItem={isRTLCheck() ? this.createPastView : this.createCurrentView}
              />
              :
              <FlatList
                // style={{ marginTop: 10}}
                extraData={this.state}
                data={isRTLCheck() ? this.arrayCategories : this.arrayPastCategories}
                // data={isRTLCheck() ? this.state.selectedIndex == 0 ? this.arrayPastCategories : this.arrayCategories : this.state.selectedIndex == 0 ? this.arrayCategories : this.arrayPastCategories}
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => item + index}
                // renderItem={this.state.selectedIndex == 0 ? this.createPastView : this.createCurrentView}
                renderItem={isRTLCheck() ? this.createCurrentView : this.createPastView}
              />
            }
          </View>
        </View> */}
        {this.logoutDialog()}
      </BaseContainer>
    );
  }
}

export const style = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.50)"
  },
  modalSubContainer: {
    backgroundColor: "#fff",
    padding: 10,
    marginLeft: 20,
    marginRight: 20,
    borderRadius: 6,
    marginTop: 20,
    marginBottom: 20
  },
  deleteTitle: {
    fontFamily: ETFonts.bold,
    fontSize: 15,
    color: "#000",
    marginTop: 10,
    alignSelf: "center",
    textAlign: "center",
    marginLeft: 20,
    marginRight: 20,
    padding: 10
  },
  optionContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20
  },
  deleteOption: {
    fontFamily: ETFonts.bold,
    fontSize: 12,
    color: "#fff",
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 30,
    paddingRight: 30,
    margin: 10,
    backgroundColor: EDColors.primary
  },
  navHeader: {
    flex: 1,
    height: (metrics.screenHeight * 0.267),
    // flexDirection: "column-reverse",
    backgroundColor: EDColors.primary,
    alignItems: "center",
    // paddingRight: 20,
    // borderWidth:1
  }
});

export default connect(
  state => {
    console.log("state values :::::::::: ",state)
    return {
      userData: state.userOperations.userData,
      isLogout: state.userOperations.isLogout,
      token: state.userOperations.token
    };
  },
  dispatch => {
    return {
      saveNavigationSelection: dataToSave => {
        dispatch(saveNavigationSelection(dataToSave));
      },
      saveLanguageRedux: language => {
        dispatch(saveLanguageInRedux(language));
      },
      saveLogout: data => {
        dispatch(saveLogoutInRedux(data));
      },
      removeDetailFromRedux: data => {
        dispatch(saveUserDetailsInRedux());
      },
      saveOrder: data => {
        dispatch(saveOrderDetailsInRedux())
      },
      saveToken: token => {
        dispatch(saveUserTokenInRedux(token))
      }
    };
  }
)(MainContainer);