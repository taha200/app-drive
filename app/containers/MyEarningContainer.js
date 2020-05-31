import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  FlatList,
  SectionList
} from "react-native";
import { connect } from "react-redux";
import BaseContainer from "./BaseContainer";
import Assets from "../assets";
import { EDColors } from "../assets/Colors";
import { RESPONSE_SUCCESS, UPDATE_PROFILE, isRTLCheck, GET_EARNING_ORDER, INR_SIGN } from "../utils/Constants";
import { getUserToken, saveUserLogin } from "../utils/AsyncStorageHelper";
import { apiPostQs, apiPost } from "../api/ServiceManager";
import ProgressLoader from "../components/ProgressLoader";
import { showValidationAlert, showDialogue } from "../utils/CMAlert";
import { ETFonts } from "../assets/FontConstants";
import { Messages } from "../utils/Messages";
import ImagePicker from "react-native-image-picker";
import { netStatus } from "../utils/NetworkStatusConnection";
import EDText from "../components/EDText";
import metrics from '../utils/metrics';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import EDRTLView from "../components/EDRTLView";
import DeliveryDetailComponent from "../components/DeliveryDetailComponent";
import { strings } from "../locales/i18n";
import EDPlaceholderView from "../components/EDPlaceholderView";


class MyEarningContainer extends React.PureComponent {
  constructor(props) {
    super(props);
    this.userDetails = this.props.userData
    this.lastOrderArray = []
    this.previousOrderArray = []
    

    
  }
  state = {
    isLoading: false,
    txtFocus: false,
    isOpen: false,
    selectIndex: "",
    strOnScreenMessage: ''
  };

  componentDidMount() {
    this.myEarningAPI()
  }

  //R.K This is view for previous orders
  // sectionViewRender = ({ section}) => {

  //   console.log("ITEM :::::::: ", title)
  //   return (

  //     <EDRTLView 
  //       style={{ 
  //         backgroundColor: this.state.isOpen && this.state.selectIndex == title ? EDColors.primary : EDColors.lightGrey, 
  //         flex: 1, 
  //           borderTopLeftRadius: 5, 
  //           borderTopRightRadius: 5, 
  //           borderBottomLeftRadius : this.state.isOpen && this.state.selectIndex == title ? 0 : 5,
  //           borderBottomRightRadius : this.state.isOpen && this.state.selectIndex == title ? 0 : 5,
  //           marginTop: metrics.screenHeight * 0.021
  //         // borderRadius: this.state.isOpen && this.state.selectIndex == title ? 5 : 0, 
  //         // marginVertical: metrics.screenHeight * 0.003, 
  //         // borderWidth: 1 
  //         }}>

  //       {/* //Show middle Text */}
  //       <View style={{ flex: 5, flexDirection: "column", justifyContent: 'center', padding: 10 }}>
  //         <Text style={{ fontFamily: ETFonts.regular, fontSize: hp("2.0%"), color: this.state.isOpen && this.state.selectIndex == title ? EDColors.white : EDColors.black }}>
  //           {title}
  //         </Text>
  //       </View>

  //       {/* Show View button */}
  //       {/* Show image  */}
  //       <TouchableOpacity
  //         style={{ flex: 0.5, flexDirection: "column", justifyContent: 'center', paddingTop: 10, paddingBottom: 10}}
  //         onPress={() => {
  //           console.log("SECTION PRESS :::::::::: ", title)
  //           this.state.selectIndex === title ? this.setState({ isOpen: !this.state.isOpen }) :
  //             this.setState({
  //               isOpen: true,
  //               selectIndex: title
  //             })
  //         }}
  //       >
  //         <Image
  //           style={{ width: 15, height: 15, marginLeft: 5, marginRight: 5 }}
  //           source={this.state.isOpen && this.state.selectIndex == title ? Assets.minus_black : Assets.add_black}
  //           position="relative"
  //           resizeMode="contain"
  //         />
  //       </TouchableOpacity>

  //     </EDRTLView>

  //   );
  // };

  // orderDataRender = ({ item, index, section }) => {
  //   console.log("RENDER ITEM ::::::: ", section)
  //   return (
  //     <View>
  //       {this.state.isOpen && this.state.selectIndex === section.title ?
  //         <EDRTLView style={{ padding: metrics.screenHeight * 0.015, backgroundColor: EDColors.white, marginBottom: metrics.screenHeight * 0.015, borderBottomLeftRadius:5, borderBottomRightRadius:5 }}>
  //           <View style={{
  //             justifyContent: 'center',
  //             marginHorizontal: metrics.screenWidth * 0.04,

  //             // marginVertical:metrics.screenHeight * 0.015
  //           }}>
  //             <Image
  //               source={Assets.dummy_puff}
  //               style={{ width: metrics.screenWidth * 0.15, height: metrics.screenWidth * 0.15, borderRadius: 5 }}
  //             />
  //           </View>
  //           <View style={{ flex: 1.5, height: metrics.screenWidth * 0.15, alignSelf: 'center',justifyContent:'space-between' }}>
  //             <Text style={{ fontSize: hp("2.0%"), fontFamily: ETFonts.regular }}>{item}</Text>
  //             <Text style={{ fontSize: hp("1.5%"), fontFamily: ETFonts.regular, color: "green" }}>{"Delivered"}</Text>
  //             <Text style={{ fontSize: hp("1.8%"), fontFamily: ETFonts.light }}>{"Wednesday 10 June"}</Text>
  //           </View>
  //           <View style={{ flex: 1, height: metrics.screenWidth * 0.15, alignSelf: "center",justifyContent:'space-between' }}>
  //             <Text style = {{alignSelf:isRTLCheck() ? 'flex-start' :'flex-end'}}>{"$150.00"}</Text>
  //             <Text style={{ fontSize: hp("1.8%"), fontFamily: ETFonts.light }}>{"My Earnings - $10"}</Text>
  //           </View>
  //         </EDRTLView>
  //         : null}
  //     </View>
  //   )
  // }

  myEarningAPI = () => {
    this.setState({
      isLoading: true,
      strOnScreenMessage: ''
    })

    let param = {
      token: this.userDetails.PhoneNumber,
      user_id: this.userDetails.UserID,
    }

    netStatus(status => {
      if (status) {
        
        apiPost(
          GET_EARNING_ORDER,
          param,
          onSuccess => {
            this.previousOrderArray = onSuccess.CommissionList.unpaid
            // this.lastOrderArray = onSuccess.CommissionList.last

            // this.lastOrderArray.length !== 0 ? this.setState({
            //   isLoading: false
            // }) : 
            this.setState({
              isLoading: false,
            })
            console.log("EARNING SUCCESS :::::::::", onSuccess)
            
          },
          onFailure => {
            this.setState({
              isLoading: false
            })
          }
        )
      } else {
        // console.log("error", err)
        showValidationAlert(Messages.internetConnnection);
      }
    })
  }
  earningRenderView = ({ item, index }) => {
    console.log("ITEM :::::::: ", item, " :::::::: ", index)
    return (
      <View>
        <EDRTLView
          style={{
            backgroundColor: this.state.isOpen && this.state.selectIndex == index ? EDColors.primary : EDColors.lightGrey,
            flex: 1,
            borderTopLeftRadius: 5,
            borderTopRightRadius: 5,
            borderBottomLeftRadius: this.state.isOpen && this.state.selectIndex == index ? 0 : 5,
            borderBottomRightRadius: this.state.isOpen && this.state.selectIndex == index ? 0 : 5,
            marginTop: metrics.screenHeight * 0.021
            // borderRadius: this.state.isOpen && this.state.selectIndex == title ? 5 : 0, 
            // marginVertical: metrics.screenHeight * 0.003, 
            // borderWidth: 1 
          }}>

          {/* //Show middle Text */}
          <View style={{ flex: 5, flexDirection: "column", justifyContent: 'center', padding: 10 }}>
            <Text style={{ fontFamily: ETFonts.regular, fontSize: hp("2.0%"), color: this.state.isOpen && this.state.selectIndex == index ? EDColors.white : EDColors.black }}>
              {"Order id - " + item.order_id}
            </Text>
          </View>

          {/* Show View button */}
          {/* Show image  */}
          <TouchableOpacity
            style={{ flex: 0.5, flexDirection: "column", justifyContent: 'center', paddingTop: 10, paddingBottom: 10 }}
            onPress={() => {
              console.log("SECTION PRESS :::::::::: ", item, " ::::::::::: ", index)
              this.state.selectIndex === index ? this.setState({ isOpen: !this.state.isOpen }) :
              this.setState({
                isOpen: true,
                selectIndex: index
              })
            }}
          >
            <Image
              style={{ width: 15, height: 15, marginLeft: 5, marginRight: 5 }}
              source={this.state.isOpen && this.state.selectIndex == index ? Assets.minus_black : Assets.add_black}
              position="relative"
              resizeMode="contain"
            />
          </TouchableOpacity>
        </EDRTLView>

        {this.state.isOpen && this.state.selectIndex === index ?
          <EDRTLView style={{ padding: metrics.screenHeight * 0.015, 
          backgroundColor: EDColors.white,
          // marginBottom: metrics.screenHeight * 0.015, 
          borderBottomLeftRadius: 5, borderBottomRightRadius: 5 }}>
            <View style={{
              justifyContent: 'center',
              marginHorizontal: metrics.screenWidth * 0.04,

              // marginVertical:metrics.screenHeight * 0.015
            }}>
              <Image
                source={{uri: item.image}}
                style={{ width: metrics.screenWidth * 0.15, height: metrics.screenWidth * 0.15, borderRadius: 5 }}
              />
            </View>
            <View style={{ flex: 1.5, height: metrics.screenWidth * 0.15, alignSelf: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: hp("2.0%"), fontFamily: ETFonts.regular }}>{item.name}</Text>
              <Text style={{ fontSize: hp("1.5%"), fontFamily: ETFonts.regular, color: "green" }}>{item.order_status}</Text>
              <Text style={{ fontSize: hp("1.8%"), fontFamily: ETFonts.light }}>{item.date}</Text>
            </View>
            <View style={{ flex: 1, height: metrics.screenWidth * 0.15, alignSelf: "center", justifyContent: 'space-between' }}>
              <Text style={{ alignSelf: isRTLCheck() ? 'flex-start' : 'flex-end' }}>{`${INR_SIGN} ${` `} ${item.total_rate}`}</Text>
              {item.commission !== null ? <Text style={{ fontSize: hp("1.8%"), fontFamily: ETFonts.light }}>{`My Earnings - ${INR_SIGN} ${` `} ${200}`}</Text> : null}
            </View>
          </EDRTLView>
          : null}
      </View>


    )
  }
  render() {
    return (
      <BaseContainer
        title={strings("earning.title")}
        left={Assets.backWhite}
        onLeft={() => {
          this.props.navigation.goBack();
        }}
      isLoading={this.state.isLoading}
      >
        {/* {this.state.isLoading ? <ProgressLoader /> : null} */}

        <View style={{ flex: 1, backgroundColor: EDColors.background }}>
          {/* {this.lastOrderArray.length !== 0 ? */}
            <ScrollView style={{ flex: 1, padding: 10 }}>
              {/* //Main View */}
         
              {/* </View> */}

              <EDText style={{ flex: 1, 
                marginBottom: metrics.screenHeight * 0.007, 
                marginTop: metrics.screenHeight * 0.030 }} label={strings("earning.preorder")} />

              {/* Flat list view */}

              {/* <SectionList
              // sections={[
              //   { title: 'Title1', data: ['item1', 'item2'] },
              //   { title: 'Title2', data: ['item3', 'item4'] },
              //   { title: 'Title3', data: ['item5', 'item6'] },
              // ]}
              sections={[
                { title: 'ti', data: this.dummyData },
                // { title: 'Title2', data: ['item3', 'item4'] },
                // { title: 'Title3', data: ['item5', 'item6'] },
              ]}
              keyExtractor={(item, index) => item + index}
              renderItem={this.orderDataRender}
              renderSectionHeader={this.sectionViewRender}

            /> */}
              <FlatList
              style={{marginBottom:15}}
                // style={{ marginVertical: metrics.screenHeight * 0.028 }}
                extraData={this.state}
                showsVerticalScrollIndicator={true}
                showsHorizontalScrollIndicator={false}
                horizontal={false}
                data={this.previousOrderArray}
                renderItem={this.earningRenderView}
                keyExtractor={(item, index) => item + index}
                initialNumToRender={0}
                initialScrollIndex={0}

              />
            </ScrollView>
             {/* <EDPlaceholderView messageToDisplay={this.state.strOnScreenMessage} /> */}
        </View>
      </BaseContainer>
    );
  }
}

export default connect(
  state => {
    return {
      userData: state.userOperations.userData
    };
  },
  dispatch => {
    return {

    };
  }
)(MyEarningContainer);