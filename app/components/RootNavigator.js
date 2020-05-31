import { createStackNavigator, createAppContainer, createDrawerNavigator } from "react-navigation";
import React from "react";
import SplashContainer from "../containers/SplashConainer";
import LoginContainer from "../containers/LoginContainer";
import MainContainer from "../containers/MainContainer";
import OTPContainer from "../containers/OTPContainer";
import SideBar from "./SideBar";
import AddressListContainer from "../containers/AddressListContainer";
import ProfileContainer from "../containers/ProfileContainer";
import ChangePasswordContainer from "../containers/ChangePasswordContainer";
import InitialContainer from "../containers/InitialContainer";
import MyOrderContainer from "../containers/MyOrderContainer";
import OrderDetailContainer from "../containers/OrderDetailContainer";
import ForgotPasswordContainer from "../containers/ForgotPasswordContainer";
import MyEarningContainer from "../containers/MyEarningContainer";
import CurrentOrderContainer from '../containers/CurrentOrderContainer';
import OrderDeliveredContainer from '../containers/OrderDeliveredContainer';

// export const MAIN_NAVIGATOR = createStackNavigator(
//   {

//     MainContainer: {
//       screen: MainContainer
//     },

//     // PromoCodeContainer: {
//     //   screen: PromoCode
//     // },
//     // AddressListContainer: {
//     //   screen: AddressListContainer
//     // },
//     // CMSContainer: {
//     //   screen: CMSContainer
//     // },
//     // // AddressMapContainer: {
//     // //   screen: AddressMapContainer
//     // // },
//     // PaymentContainer: {
//     //   screen: PaymentContainer
//     // },
//     // InitialContainer: {
//     //   screen: InitialContainer
//     // },
//     // SplashContainer: {
//     //   screen: SplashContainer
//     // },
//     // LoginContainer: {
//     //   screen: LoginContainer
//     // },
//     CurrentOrderContainer: {
//       screen: CurrentOrderContainer
//     },
//     MyEarningContainer: {
//       screen:MyEarningContainer
//     },
//     OrderDeliveredContainer: {
//       screen: OrderDeliveredContainer
//     }

//     // Home: {
//     //   screen: HOME_SCREEN_DRAWER
//     // },
//     // HomeRight: {
//     //   screen: HOME_SCREEN_DRAWER_RIGHT
//     // },
//   },
//   {
//     initialRouteName: "MainContainer",
//     headerMode: "none"
//   }
// );
// export const PROFILE_NAVIGATOR = createStackNavigator(
//   {
//     ProfileContainer: {
//       screen: ProfileContainer
//     },
//   },
//   {
//     initialRouteName: "ProfileContainer",
//     headerMode: "none"
//   }
// );
// export const MY_EARNING_NAVIGATOR = createStackNavigator(
//   {
//     MyEarningContainer: {
//       screen:MyEarningContainer
//     }
//   },
//   {
//     initialRouteName: "MyEarningContainer",
//     headerMode: "none"
//   }
// );
// export const MY_ORDER_NAVIGATOR = createStackNavigator(
//   {
//     MyOrderContainer: {
//       screen: MyOrderContainer
//     },
//     AddressListContainer: {
//       screen: AddressListContainer
//     },
//     // AddressMapContainer: {
//     //   screen: AddressMapContainer
//     // },
//     OrderDetailContainer: {
//       screen: OrderDetailContainer
//     }
//   },
//   {
//     initialRouteName: "MyOrderContainer",
//     headerMode: "none"
//   }
// );
// export const CMS_NAVIGATOR = createStackNavigator(
//   {
//     PrivacyPolicy: {
//       screen: PrivacyPolicy
//     },
//   },
//   {
//     initialRouteName: "PrivacyPolicy",
//     headerMode: "none"
//   }
// );
// export const CHANGE_PASSWORD_NAVIGATOR = createStackNavigator(
//   {
//     ChangePasswordContainer: {
//       screen: ChangePasswordContainer
//     },
//   },
//   {
//     initialRouteName: "ChangePasswordContainer",
//     headerMode: "none"
//   }
// );

export const HOME_SCREEN_DRAWER = createDrawerNavigator(
  {

    Home: {
      screen: MainContainer
    },
    MyProfile: {
      screen: ProfileContainer
    },
    MyEarning: {
      screen: MyEarningContainer
    },
    changePassword: {
      screen: ChangePasswordContainer
    },
    CurrentOrderContainer: {
      screen: CurrentOrderContainer
    },
    MyEarningContainer: {
      screen: MyEarningContainer
    },
    OrderDeliveredContainer: {
      screen: OrderDeliveredContainer
    }
  },
  {
    initialRouteName: "Home",
    initialRouteParams: "Home",
    drawerLockMode: "locked-closed",
    drawerPosition: "left",
    backBehavior: "initialRoute",
    contentComponent: props => <SideBar {...props} />
  }
);

export const HOME_SCREEN_DRAWER_RIGHT = createDrawerNavigator(
  {

    HomeRight: {
      screen: MainContainer
    },
    MyProfile: {
      screen: ProfileContainer
    },
    MyEarning: {
      screen: MyEarningContainer
    },
    changePassword: {
      screen: ChangePasswordContainer
    },
    CurrentOrderContainer: {
      screen: CurrentOrderContainer
    },
    MyEarningContainer: {
      screen: MyEarningContainer
    },
    OrderDeliveredContainer: {
      screen: OrderDeliveredContainer
    }
  },
  {
    initialRouteName: "HomeRight",
    initialRouteParams: "HomeRight",
    drawerLockMode: "locked-closed",
    drawerPosition: "right",
    backBehavior: "initialRoute",
    contentComponent: props => <SideBar {...props} />
  }
);

export const BASE_STACK_NAVIGATOR = createStackNavigator(
  {
    InitialContainer: {
      screen: InitialContainer
    },
    SplashContainer: {
      screen: SplashContainer
    },
    LoginContainer: {
      screen: LoginContainer
    },

    Home: {
      screen: HOME_SCREEN_DRAWER
    },
    HomeRight: {
      screen: HOME_SCREEN_DRAWER_RIGHT
    },
    OTPContainer: {
      screen: OTPContainer
    },
    MY_ORDER_NAVIGATOR: {
      screen: MyOrderContainer
    },
    ForgotPasswordContainer: {
      screen: ForgotPasswordContainer
    }
  },
  {
    initialRouteName: "SplashContainer",
    headerMode: "none"
  }
);

// class BaseNavigator extends React.Component {
//   render() {

//     return <RootNavigator />;
//   }
// }

// export const AppNavigator = createAppContainer(RootNavigator);
