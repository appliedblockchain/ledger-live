// @flow
import { PureComponent } from "react";
import { connect } from "react-redux";
import { createStructuredSelector } from "reselect";
import { reportErrorsEnabledSelector } from "../reducers/settings";

let enabled = false;
export const getEnabled = () => enabled;

class HookSentry extends PureComponent<{ enabled: boolean }> {
  componentDidUpdate() {
    this.sync();
  }
  componentDidMount() {
    this.sync();
  }
  sync() {
    enabled = this.props.enabled;
  }
  render() {
    return null;
  }
}

export default connect(
  createStructuredSelector({
    enabled: reportErrorsEnabledSelector,
  }),
)(HookSentry);
