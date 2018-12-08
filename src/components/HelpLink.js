// @flow

import React, { PureComponent } from "react";
import { StyleSheet, Linking } from "react-native";
import { Trans } from "react-i18next";
import Touchable from "./Touchable";
import LText from "./LText";
import colors from "../colors";
import { urls } from "../config/urls";
import Help from "../icons/Help";

class HelpLink extends PureComponent<{ style?: * }> {
  render() {
    const { style } = this.props;
    return (
      <Touchable
        event="HelpLink"
        style={[styles.linkContainer, style]}
        onPress={() => Linking.openURL(urls.faq)}
      >
        <Help size={16} color={colors.live} />
        <LText style={styles.linkText} semiBold>
          <Trans i18nKey="common.needHelp" />
        </LText>
      </Touchable>
    );
  }
}

export default HelpLink;

const styles = StyleSheet.create({
  linkContainer: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  linkText: {
    color: colors.live,
    marginLeft: 6,
  },
});
