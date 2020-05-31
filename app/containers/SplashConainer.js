import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  AsyncStorage,Platform
} from "react-native";
import Assets from "../assets";
import {
  saveLanguageInRedux,
  saveUserDetailsInRedux,
  saveUserFCMInRedux
} from "../redux/actions/User";
import {
  getLanguage,
  getUserLoginDetails,
  getUserTokenDetail,
  getUserFCM
} from "../utils/AsyncStorageHelper";
import { connect } from "react-redux";
import I18n from "react-native-i18n";
import EDThemeButton from "../components/EDThemeButton";
import { showNotImplementedAlert } from "../utils/CMAlert";
import EDSkipButton from "../components/EDSkipButton";
import LoginContainer from "./LoginContainer";
import { PermissionsAndroid } from "react-native";
import { getUserToken } from "../utils/AsyncStorageHelper";
import { StackActions, NavigationActions } from "react-navigation";
import { Messages } from "../utils/Messages";
import { getIsRTL, isRTLCheck } from "../utils/Constants";

class SplashContainer extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
  //  getUserToken(success => {}, failure => {});
  this.setLanguage()

  }

  async componentWillMount() {
    if(Platform.OS == "ios") {
      return
    }
    await requestLocationPermission();

    setTimeout(() => {
      this.props.navigation.dispatch(
        StackActions.reset({
          index: 0,
          routeName: "LoginContainer",
          actions: [NavigationActions.navigate({ routeName: "LoginContainer" })]
        })
      );
    }, 3000);
    
  }

  navigateToHomeScreen = () => {
    setTimeout(() => {
      this.props.navigation.dispatch(
        StackActions.reset({
          index: 0,
          routeName: "LoginContainer",
          actions: [
            NavigationActions.navigate({ routeName: isRTLCheck() ? "HomeRight" : "Home" })
          ]
        })
      );
    }, 3000);
  }

  navigateToLoginScreen = () => {
    setTimeout(() => {
      this.props.navigation.dispatch(
        StackActions.reset({
          index: 0,
          // routeName: "LoginContainer",
          actions: [NavigationActions.navigate({ routeName: "LoginContainer" })]
        })
      );
    }, 3000);
  }

  setLanguage() {
    getLanguage(
      success => {
        console.log("Check lan", success);
        if (success != null && success != undefined) {
          I18n.locale = success;
        } else {
          I18n.locale = "en";
        }

        getIsRTL();

        this.props.saveLanguageRedux(success);
        
        getUserToken(
          success => {
            getUserFCM(
              success => {
                this.props.saveToken(success)
                console.log("FCM TOKEN :::::::: ", success)
                this.navigateToHomeScreen();
              },
              failure => {

              }
            )
            console.log("check data", success);
            this.props.saveDetailsOnSuccessfullLogin(success);
            
            
          },
          error => {
            this.navigateToLoginScreen();
          }
        );
        
      },
      error => {}
    );
  }
  render() {
    return (
      <View style={{ flex: 1 }}>
        <Image
          source={Assets.bgHome}
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%"
          }}
        />
  
      </View>
    );
  }

  _onPressSignIn() {
    this.props.navigation.navigate("LoginContainer");
  }
  _onPressSkip() {
    // this.props.navigation.navigate("MainContainer");

    this.props.navigation.dispatch(
      StackActions.reset({
        index: 0,
        routeName: "MainContainer",
        actions: [NavigationActions.navigate({ routeName: "MainContainer" })]
      })
    );
  }
  _onPressSignUp() {
    this.props.navigation.navigate("SignupContainer");
  }
}

export async function requestLocationPermission() {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: "Eatance-Delivery",
        message: "Eatance-Delivery App access to your location "
      }
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
    } else {
    }
  } catch (err) {
    console.warn(err);
  }
}

export default connect(
  state => {
    return {};
  },
  dispatch => {
    return {
      saveDetailsOnSuccessfullLogin: userObject => {
        dispatch(saveUserDetailsInRedux(userObject));
      },
      saveLanguageRedux: language => {
        dispatch(saveLanguageInRedux(language));
      },
      saveToken: token => {
        dispatch(saveUserFCMInRedux(token))
      }
    };
  }
)(SplashContainer);