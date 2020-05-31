/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from "react";
// import { BASE_STACK_NAVIGATOR } from "./app/components/RootNavigator";
import {BASE_STACK_NAVIGATOR } from './app/components/RootNavigator';
import { createStore, combineReducers } from "redux";
import { Provider } from "react-redux";
import { userOperations } from "./app/redux/reducers/UserReducer";
import { navigationOperation } from "./app/redux/reducers/NavigationReducer";
import { checkoutDetailOperation } from "./app/redux/reducers/CheckoutReducer";
import firebase, { Notification, NotificationOpen } from "react-native-firebase";
import { View, Text } from "react-native";
import { showDialogue } from "./app/utils/CMAlert";
import { createStackNavigator } from "react-navigation";
import { AsyncStorage } from "react-native";
import NavigationService from "./NavigationService";
import {
  NOTIFICATION_TYPE,
  DEFAULT_TYPE,
  ORDER_TYPE,
  getIsRTL,
  isRTLCheck
} from "./app/utils/Constants";
import { getLanguage } from "./app/utils/AsyncStorageHelper";
import I18n from "react-native-i18n";

const rootReducer = combineReducers({
  userOperations: userOperations,
  navigationReducer: navigationOperation,
  checkoutReducer: checkoutDetailOperation
});

const eatanceGlobalStore = createStore(rootReducer);

class App extends React.Component {
  constructor(props) {
    super(props);
    this.isNotification = undefined;

    getLanguage(
      success => {
        if (success != undefined && success != null) {
          console.log("success lan", success);
          I18n.locale = success.value;
          getIsRTL();
          this.setState({
            isRTLInAppNavigator: isRTLCheck(),
            isLanguage: true
          });
          // this.props.saveLanguage(success);
        } else {
          console.log("success else lan", success);
          getIsRTL();
          this.setState({
            isRTLInAppNavigator: isRTLCheck(),
            isLanguage: true
          });
          // this.props.saveLanguage(this.props.lan);
        }
      },
      error => {
        console.log("error lan", error);
        getIsRTL();
        // this.props.saveLanguage(this.props.lan);
      }
    );
    
  }

  state = {
    isRefresh: false,
    isLanguage: undefined,
    isRTLInAppNavigator: false
  };

  //1
  async checkPermission() {
    const enabled = await firebase.messaging().hasPermission();
    // alert(enabled)
    if (enabled) {
      this.getToken();
    } else {
      this.requestPermission();
    }
  }

  //3
  async getToken() {
    fcmToken = await firebase.messaging().getToken();
  }

  //2
  async requestPermission() {
    try {
      await firebase.messaging().requestPermission();

      this.getToken();
    } catch (error) {
      // alert(error)
      // User has rejected permissions
    }
  }

  componentWillUnmount() {
    try {
      
      this.notificationListener();
      this.notificationOpenedListener();
    } catch (error) {
      alert(error)
    }
  }

  async createNotificationListeners() {


    /*
     * Triggered when a particular notification has been received in foreground
     * */
    this.notificationListener = firebase
      .notifications()
      .onNotification(notification => {
        const { title, body, data } = notification;

        console.log("PAYLOAD NOTIFICATION ::::::::::::: ", notification)

        // this.showAlertNew1(body, data);

        showDialogue(body,[],"",
          ()=>{
            if (data.screenType === "order") {
              NavigationService.navigate("Home")
              
              // this.setState({ isRefresh: !this.state.isRefresh },NavigationService.navigate("Home"));
              
            } 
            else
             if (data.screenType === "noti") 
             {
              NavigationService.navigate("Home");
              // this.props.navigation.navigate("Notification");
            }
          })
      });

    /*
     * If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
     * */
    this.notificationOpenedListener = firebase
      .notifications()
      .onNotificationOpened(notificationOpen => {
        const { title, body, data } = notificationOpen.notification;

        // this.showAlertNew1(body, data);
        console.log("PAYLOAD ::::::::::::: ", notificationOpen)
        if (data.screenType === "order") {
              
          // NavigationService.navigate("Home");
          NavigationService.navigate("Home")
          
        } 
        else
         if (data.screenType === "noti") 
         {
          NavigationService.navigate("Home");
          
        }
        // showDialogue(body,[],"",
        //   ()=>{
        //     if (data.screenType === "order") {
              
        //       // NavigationService.navigate("Home");
        //       NavigationService.navigate("Home")
              
        //     } 
        //     else
        //      if (data.screenType === "noti") 
        //      {
        //       NavigationService.navigate("Home");
              
        //     }
        //   })
      });

    /*
     * If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
     * */
    const notificationOpen = await firebase
      .notifications()
      .getInitialNotification();
    if (notificationOpen) {
      const {
        title,
        body,
        data,
        notificationId
      } = notificationOpen.notification;

      const lastNotification = await AsyncStorage.getItem("lastNotification");

      if (lastNotification !== notificationId) {
        if (data.screenType === "order") {
          this.isNotification = ORDER_TYPE;
          
          this.setState({ isRefresh: this.state.isRefresh ? false : true });
        } else if (data.screenType === "noti") {
          this.isNotification = NOTIFICATION_TYPE;
          
          this.setState({ isRefresh: this.state.isRefresh ? false : true });
        }
        await AsyncStorage.setItem("lastNotification", notificationId);
      }
    }
    /*
     * Triggered for data only payload in foreground
     * */
    this.messageListener = firebase.messaging().onMessage(message => {
      //process data message
    });


    if (this.isNotification == undefined) {
      this.isNotification = DEFAULT_TYPE;
      
      this.setState({ isRefresh: this.state.isRefresh ? false : true });
    }
  }

  showAlertNew1(noti, data) {
    showDialogue(noti, [
      {
        // text: "Ok",
        onPress: () => {
          if (data.screenType === "order") {
            // this.props.navigation.dispatch(
            //   StackActions.push({

            //     actions: [
            //       NavigationActions.navigate({ routeName: "Order" })
            //     ]
            //   })
            // );
            // this.props.navigation.navigate("Order");
            // isRTLCheck() ? NavigationService.navigate("HomeRight") : NavigationService.navigate("Home");
            NavigationService.navigate("Home");
            
          } 
          else
           if (data.screenType === "noti") 
           {
            NavigationService.navigate("Home");
            // this.props.navigation.navigate("Notification");
          }
        }
      }
    ]);
  }

  async componentDidMount() {
    // alert(this.isNotification)
    this.checkPermission();

    // alert(await firebase.messaging().hasPermission())
    // const enabled = await firebase.messaging().hasPermission();
    // // alert(enabled)
    // console.log("ENABLE VALUE ::::::::::: ", enabled)
    // if (enabled) {
    //   this.getToken();
    // } else {
    //   this.requestPermission();
    // }

    this.createNotificationListeners();
  }


  
  render() {
    return (
      <Provider store={eatanceGlobalStore}>
        {/* {this.isNotification != undefined ? ( */}
          <BASE_STACK_NAVIGATOR
          isRTLFromAppNavigator={this.state.isRTLInAppNavigator}
            ref={navigatorRef => {
              NavigationService.setTopLevelNavigator(navigatorRef);
            }}
            screenProps={this.isNotification}
          />
          {/* ) */}
         {/* : (
          <View>
            <Text>Hiiiiiiii</Text>
          </View>
        )}  */}
      </Provider>
    );
  }
}

export default (DEFAULT_NAVIGATOR = createStackNavigator(
  {
    App: {
      screen: App
    }
  },
  {
    initialRouteName: "App",
    headerMode: "none"
  }
));
