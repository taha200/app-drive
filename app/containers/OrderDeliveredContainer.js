import React from "react";
import {
    View,
    Image,
    TextInput,
    TouchableOpacity,
    ScrollView,
    FlatList,
    Text,
    Alert
} from "react-native";
import { NavigationEvents } from 'react-navigation'
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
    GET_DELIVERED_ORDER,
    REVIEW_API,
    INR_SIGN,
    UPDATE_WALLET,
    GET_USER_ID
} from "../utils/Constants";
import Assets from "../assets";
import BaseContainer from "./BaseContainer";
import HomeCategoryCard from "../components/HomeCategoryCard";
import PopularRestaurantCard from "../components/PopularRestaurantCard";
import { apiPost } from "../api/ServiceManager";
import { EDColors } from "../assets/Colors";
import ETextViewNormalLable from "../components/ETextViewNormalLable";
import { getUserToken, getCartList, saveLanguage } from "../utils/AsyncStorageHelper";
import { showValidationAlert, showDialogue } from "../utils/CMAlert";
import { connect } from "react-redux";
import { saveNavigationSelection } from "../redux/actions/Navigation";
import BannerImages from "../components/BannerImages";
import DataNotAvailableContainer from "../components/DataNotAvailableContainer";
import { netStatus } from "../utils/NetworkStatusConnection";
import { Messages } from "../utils/Messages";
import { ETFonts } from "../assets/FontConstants";
import SegmentedControlTab from 'react-native-segmented-control-tab'
import { saveLanguageInRedux } from "../redux/actions/User";
import EDRTLView from "../components/EDRTLView";
import metrics from "../utils/metrics";
import EDThemeButton from "../components/EDThemeButton";
import EDButton from "../components/EDButton";
import EDText from '../components/EDText';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { strings } from "../locales/i18n";
import EditText from "../components/EditText";
import EDTextViewNormal from "../components/EDTextViewNormal";
import DeliveryDetailComponent from "../components/DeliveryDetailComponent";
import GeneralModel from "../components/GeneralModel";
import CollectCashModel from "../components/GeneralModel";
class OrderDeliveredContainer extends React.Component {
    constructor(props) {
        super(props);
        this.userDetails = this.props.userData
        this.currentOrderDict = this.props.navigation.state.params.deliveryData
        console.log("ORDER DETAIL :::::::::: ", this.currentOrderDict)
        
    }

    state = {
        phoneNumber: "",
        password: "",
        strComment: "",
        cashcollected:0,
        starRating: 0,
        isShow: false,
        isLoading: false,
        isModalVisible: false,
        isCollectcashVisible: false,
        order_user_id:"",
    };

    componentDidMount(){
        this.deliveredOrderAPI()
        if(this.currentOrderDict.payment_type==="Cash on Delivery"){

        }
        else{
    setTimeout(()=>{
        this.props.navigation.navigate("Home")
    },10000)
}
       // alert(JSON.stringify(this.currentOrderDict))
    }

    commentDidChange = setComment => {

        this.setstr = setComment
        // if(this.setstr.length === 0){
            // this.state.isShow = false
            this.setState({
                strComment: this.setstr,
                // isShow: false
            })
        // }else{
        //     this.setState({
        //         strComment: this.setstr,
        //         // isShow: true
        //     })
        // }
    }

    changeamount = setAmount => {
        this.setState({'cashcollected':setAmount})
    }

    deliveredOrderAPI = () => {
        
        let param = {
          token: this.userDetails.PhoneNumber,
          user_id: this.userDetails.UserID,
          order_id: this.currentOrderDict.order_id,
          status: "delivered",
          subtotal: this.currentOrderDict.subtotal
        }
    
        console.log("ORDER DELIVERED DATA ::::::::::: ", param)

        netStatus(status => {
          if (status) {
            this.setState({
                isLoading: true
              })
            apiPost(
              GET_DELIVERED_ORDER,
              param,
              onSuccess => {
                this.deliveredOrder = onSuccess.order_detail
                console.log("Delivered data display :::::::::: ", this.deliveredOrder)
                this.setState({
                  isLoading: false
                })
              },
              onFailure => {

                this.setState({
                  isLoading: false
                })
              }
            )
            let paramuserid={
                order_id: this.currentOrderDict.order_id,
            }
            apiPost(
                GET_USER_ID,
                paramuserid,
                onSuccess => {
                    if(onSuccess.status==1){
                            this.setState({order_user_id:onSuccess.user.user_id})
                    }
                }, 
                onFailure => {
                    showDialogue(strings(general.generalWebServiceError))
    
                }
            )
          } else {
            // console.log("error", err)
            showValidationAlert(Messages.internetConnnection);
          }
        })
      }

      reviewAPI = () => {
        let param = {
            rating: this.state.starRating,
            review: this.state.strComment,
            order_user_id: this.currentOrderDict.order_id,
            user_id: this.userDetails.UserID,
        }
        apiPost(
            REVIEW_API,
            paramuserid,
            onSuccess => {
                this.setState({ isModalVisible: false });
            }, 
            onFailure => {
                showDialogue(strings(general.generalWebServiceError))

            }
        )
      

    }

    cashcollectedAPI= () =>{

    }

    updatewallet=(amount,type) => {
        let param = {
            amount: amount,
            user_id: this.state.order_user_id,
            type: type,
            driver_id: this.userDetails.UserID,
            order_id: this.currentOrderDict.order_id,
            payed:this.state.cashcollected,
            total:this.currentOrderDict.total_rate,
        }
        apiPost(
            UPDATE_WALLET,
            param,
            onSuccess => {
                if(onSuccess.status==1){
                    Alert.alert(
                        'Done',
                        'Cash collected successfully',
                        [
                            {text: 'OK', onPress:()=>this.props.navigation.goBack() },
                        ],
                        { cancelable: false }
                    )
                    
                }
            }, 
            onFailure => {
                showDialogue(strings(general.generalWebServiceError))

            }
        )
        
    }

    orderItemRender = ({item, index}) => {
        console.log("ORDER DATA :::::::::: ", item)
        return(
            <EDRTLView style = {{marginVertical : metrics.screenHeight * 0.019}}>
                <Text style = {{flex:3,fontFamily: ETFonts.light, fontSize:hp("2.0%")}}>{item.item_name + "(x" + item.qty_no +")"}</Text>
                <Text style = {{flex:1,fontFamily: ETFonts.light, fontSize:hp("2.0%"), textAlign:isRTLCheck() ? 'left' : 'right'}}>{INR_SIGN + item.rate}</Text>
            </EDRTLView>
        )
    }

    reviewDialog() {
        return (
            <GeneralModel
                isVisible={this.state.isModalVisible}
                isRating = {true}
                colors={EDColors.primary}
                value={this.state.strComment}
                buttonstyle = {{backgroundColor: this.state.strComment.trim() !== "" && this.state.starRating !== 0 ? EDColors.primary : EDColors.buttonUnreserve}}
                placeholder={strings("general.comment")}
                label={strings("general.reviewtitle")}
                numberOfLines={5}
                multiline={true}
                style={{ padding: 10, height: metrics.screenHeight * 0.145, width: metrics.screenWidth * 0.55, borderRadius: 2, borderColor: EDColors.borderColor, borderWidth: 1, fontFamily: ETFonts.regular, marginTop: metrics.screenHeight * 0.015 }}
                onChangeText={this.commentDidChange}
                isNoHide={true}
                YesTitle={strings("signUp.Submit")}
                activeOpacity = {this.state.strComment.trim() !== "" && this.state.starRating !== 0 ? 0 : 1}
                starCount = {(star)=> {
                    this.setState({
                        starRating: star
                    })
                }}
                onYesClick={data => {
                    if(this.state.strComment.trim() !== "" && this.state.starRating !== 0){
                        this.reviewAPI()
                        this.props.navigation.goBack();
                    }else{
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


    CollectCashDialog() {
        return (
            <CollectCashModel
                isVisible={this.state.isCollectcashVisible}
                colors={EDColors.primary}
                value={this.state.cashcollected}
                buttonstyle = {{backgroundColor:EDColors.buttonUnreserve}}
                placeholder={"Amount"}
                label={"Collect " + INR_SIGN + this.currentOrderDict.total_rate}
                numberOfLines={2}
                multiline={false}
                style={{ padding: 10, width: metrics.screenWidth * 0.55, borderRadius: 2, borderColor: EDColors.borderColor, borderWidth: 1, fontFamily: ETFonts.regular, marginTop: metrics.screenHeight * 0.015 }}
                onChangeText={this.changeamount}
                isNoHide={true}
                YesTitle={"Done"}
                onYesClick={data => {
                   
                       /* this.reviewAPI()
                        this.props.navigation.goBack();*/
                        let remainingbalance=parseInt(this.currentOrderDict.total_rate)-parseInt(this.state.cashcollected)
                        if(remainingbalance!=0){                      
                            if(this.state.cashcollected< parseInt(this.currentOrderDict.total_rate)){
                                Alert.alert(
                                    'Confirm',
                                    'Amount is lower then total bill want to get remaining amount from users wallet '+(remainingbalance),
                                    [
                                        {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                                        {text: 'OK', onPress:()=>this.updatewallet(remainingbalance,"sub") },
                                    ],
                                    { cancelable: false }
                                )
                        
                            }else{
                                Alert.alert(
                                    'Confirm',
                                    'Amount is higher then total bill want to add remaining amount on users wallet '+(-remainingbalance),
                                    [
                                        {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                                        {text: 'OK', onPress:()=>this.updatewallet(-remainingbalance,"add") },
                                    ],
                                    { cancelable: false }
                                )
                                this.setState({
                                    isCollectcashVisible: true
                                })
                            }
                        }
                        else{
                            this.props.navigation.goBack();
                        }

                }}

                onNoClick={data => {
                    console.log(data);
                    this.setState({ isCollectcashVisible: false })
                }}

            />
        );
    }

    

    render() {
        return (
            <BaseContainer
                title={strings("order.orderdeliver")}
                left={Assets.backWhite}
                right={[]}
                onLeft={() => {
                    this.props.navigation.goBack();
                }}
                isLoading={this.state.isLoading}
            >
                <ScrollView>
                    < View
                        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
                    >
                        <Image
                            style={{ width: '100%', height: metrics.screenHeight * 0.40 }}
                            source={Assets.bg_login}
                            // position="relative"
                            resizeMode="cover"
                        />

                        <View
                            style={{
                                flex: 1,
                                marginTop: -70,
                                backgroundColor: 'transparent',
                                alignItems: 'center',
                                marginBottom: 10,
                                width: '100%',
                                // borderWidth:1
                            }}
                        >

                            <View
                                style={{
                                    backgroundColor: 'white',
                                    width: metrics.screenWidth * 0.93,
                                    borderRadius: 10,
                                    alignItems: "center",
                                    // borderWidth:1
                                }}
                            >
                                {this.deliveredOrder !== undefined ?
                                

                                <View
                                    style={{
                                        // marginLeft: 20,
                                        // marginRight: 20,
                                        marginTop: metrics.screenHeight * 0.027,
                                        width: metrics.screenWidth * 0.81,
                                        // borderWidth:1
                                    }}
                                >
                                    <EDText style = {{flex:1, fontSize: hp("2.5%"), fontFamily: ETFonts.bold}} label = {strings("order.orderdetail")}/>

                                    <FlatList 
                                        data = {this.deliveredOrder.order_detail}
                                        renderItem = {this.orderItemRender}
                                        keyExtractor={(item, index) => item + index}
                                        // ListFooterComponent = {}
                                    />
                                    <View style = {{width: metrics.screenWidth * 0.9,alignSelf:'center', borderWidth:0.5, borderColor: 'grey', marginVertical : metrics.screenHeight * 0.019}}/>

                                    <EDText style = {{flex:1, fontSize: hp("2.0%"), fontFamily: ETFonts.regular}} label = {"Address"}/>
                                    <DeliveryDetailComponent style = {{marginVertical: metrics.screenHeight * 0.026}} textStyle = {{marginHorizontal: metrics.screenWidth * 0.019, fontSize: hp("2.0%")}} source = {Assets.location_selected} label = {this.deliveredOrder.address}/>
                                    <View
                                        style={{
                                            alignSelf: "center",
                                            marginTop: metrics.screenHeight * 0.014,
                                            marginBottom: metrics.screenHeight * 0.04,
                                            // borderWidth:1
                                        }}
                                    >
                                        <EDThemeButton
                                            label={strings("order.write")}
                                            isRadius={true}
                                            style={{ width: metrics.screenWidth * 0.79, height: metrics.screenHeight * 0.076,marginBottom:20 }}
                                            onPress={() => {
                                                this.setState({ isModalVisible: true })
                                            }}
                                        />
                                        {(this.currentOrderDict.payment_type==="Cash on Delivery")?
                                         <EDThemeButton
                                         label={"Collect Cash"}
                                         isRadius={true}
                                         style={{ width: metrics.screenWidth * 0.79, height: metrics.screenHeight * 0.076 }}
                                         onPress={() => {
                                             this.setState({ isCollectcashVisible: true })
                                         }}
                                     />
                                     :
                                     null  
                                    }
                                     

                                    </View>
                                </View>
                                : null}
                            </View>
                        </View>
                    </View>
                    {this.CollectCashDialog()}
                    {this.reviewDialog()}
                </ScrollView>
            </BaseContainer>
        )
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
            saveNavigationSelection: dataToSave => {
                dispatch(saveNavigationSelection(dataToSave));
            },
            saveLanguageRedux: language => {
                dispatch(saveLanguageInRedux(language));
            }
        };
    }
)(OrderDeliveredContainer);