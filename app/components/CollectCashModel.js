import React, { Component } from "react";
import { StyleSheet, Modal, Text, View, Image, TextInput, TouchableOpacity } from "react-native";
import { EDColors } from "../assets/Colors";
import { ETFonts } from "../assets/FontConstants";
import { strings } from "../locales/i18n";
import EDRTLView from "./EDRTLView";
import EDThemeButton from "./EDThemeButton";
import Metrics from "../utils/metrics";
import { isRTLCheck } from "../utils/Constants";
import EDTextInput from "./EDTextInput";
import EditText from "../components/EditText";
import metrics from "../utils/metrics";
import EDText from "./EDText";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

import Assets from "../assets";

export default class CollectCashModel extends React.Component {
  constructor(props) {
    super(props);
  }

  state = {
    isVisible: this.props.isVisible,
  
  };

  componentWillReceiveProps(props) {
    this.setState({ isVisible: props.isVisible });
  }

 


  render() {
    return (
      <Modal
        visible={this.state.isVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          this.props.onNoClick("No Click");
        }}
      >
        <View style={style.modalContainer}>
          <View style={style.modalSubContainer}>
            {/* <View>
              {this.props.isNoHide ? (<View>) : null }
            </View> */}
            <View style = {{width: metrics.screenWidth * 0.72}}>
              {this.props.isNoHide ? <TouchableOpacity
              onPress={() => {
                this.setState({ isVisible: false }, () => {
                  this.props.onNoClick("No Click");
                });
              }}
              >
                <Image
                style = {{width: metrics.screenWidth * 0.042, height: metrics.screenWidth * 0.042, marginHorizontal:10, alignSelf: isRTLCheck() ? "flex-start" : 'flex-end' }}
                source = {Assets.cancel}
                />
                 </TouchableOpacity> : null}
            </View>

            <EDText
              style={{ fontSize: hp("3.0%"), fontFamily: ETFonts.satisfy, color: EDColors.primary }}
              label={this.props.label}
            />
    

        <TextInput
            keyboardType={"number-pad"}
              placeholder={this.props.placeholder}
              value={this.props.value}
              onChangeText={this.props.onChangeText}
              style={this.props.style}
            />

            
            <EDRTLView style={style.optionContainer}>

              <EDThemeButton
                style={[{
                  height: metrics.screenHeight * 0.056,
                  width: Metrics.screenWidth * 0.4,
                  // borderRadius: 10,
                  overflow: "hidden",
                  marginTop: metrics.screenHeight * 0.015,
                  // marginRight: isRTLCheck() ? 10 : 0,
                  // marginLeft: isRTLCheck() ? 0 : 10,
                }, this.props.buttonstyle]}
                label={this.props.YesTitle || strings("dialog.yes")}
                colors={this.props.colors}
                activeOpacity = {this.props.activeOpacity}
                onPress={() => {
                  this.setState({ isVisible: true }, 
                    () => {
                    this.props.onYesClick("Yes Click");
                  }
                  );
                }}
              />

            </EDRTLView>
          </View>
        </View>
      </Modal>
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
    padding: metrics.screenHeight * 0.015,
    width: metrics.screenWidth * 2,
    height: metrics.screenHeight * 0.37,
    // marginLeft: 20,
    // marginRight: 20,
    borderRadius: 6,
    // marginTop: 20,
    // marginBottom: 20,
    alignItems: "center",
    alignSelf: 'center',
    // borderWidth: 1
  },
  optionContainer: {
    justifyContent: "center",
    alignItems: 'center',
    // marginTop: 20,
    // borderWidth: 1
  },
  deleteOption: {
    fontFamily: ETFonts.bold,
    fontSize: 12,
    color: "#fff",
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 30,
    paddingRight: 30,
    margin: 5,
    backgroundColor: EDColors.primary
  }
});
