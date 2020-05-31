import React, { Component } from "react";
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native'
import { EDColors } from "../assets/Colors"
import { ETFonts } from "../assets/FontConstants"
import EDRTLView from "./EDRTLView";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default class EDButton extends Component {
    render() {
        return (

            <EDRTLView pointerEvents={this.props.pointerEvents || "auto"} style={this.props.containerStyle}>
                <TouchableOpacity pointerEvents={this.props.pointerEvents || "auto"} style={[stylesButtonPlain.themeButtonPlain, this.props.buttonStyle]}
                    onPress={this.props.onPress}
                >
                    <Text style={[stylesButtonPlain.themeButtonTextPlain, this.props.textStyle]}>{this.props.label}</Text>
                </TouchableOpacity>
            </EDRTLView>
        );
    }
}

const stylesButtonPlain = StyleSheet.create({
    themeButtonPlain: {
        borderRadius: 5,
    },
    themeButtonTextPlain: {
        color: EDColors.white,
        fontFamily: ETFonts.regular,
        fontSize: hp('2%'),
        
    }
})