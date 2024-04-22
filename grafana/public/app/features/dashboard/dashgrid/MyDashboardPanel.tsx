import React, { PureComponent } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { StoreState } from 'app/types';

import { initPanelState } from '../../panel/state/actions';
import { setPanelInstanceState } from '../../panel/state/reducers';
import { DashboardModel, PanelModel } from '../state';


import { MyPanelStateWrapper } from './MyPanelStateWrapper';

export interface OwnProps {
  panel: PanelModel;
  stateKey: string;
  dashboard: DashboardModel;
  isEditing: boolean;
  isViewing: boolean;
  isDraggable?: boolean;
  width: number;
  height: number;
  lazy?: boolean;
  timezone?: string;
  hideMenu?: boolean;
}

const mapStateToProps = (state: StoreState, props: OwnProps) => {
  const panelState = state.panels[props.stateKey];
  if (!panelState) {
    return { plugin: null };
  }

  return {
    plugin: panelState.plugin,
    instanceState: panelState.instanceState,
  };
};

const mapDispatchToProps = {
  initPanelState,
  setPanelInstanceState,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type Props = OwnProps & ConnectedProps<typeof connector>;

export class MyDashboardPanelUnconnected extends PureComponent<Props> {
  static defaultProps: Partial<Props> = {
    lazy: true,
  };

  componentDidMount() {
    this.props.panel.isInView = !this.props.lazy;
    if (!this.props.lazy) {
      this.onPanelLoad();
    }
  }

  onInstanceStateChange = (value: any) => {
    this.props.setPanelInstanceState({ key: this.props.stateKey, value });
  };

  onVisibilityChange = (v: boolean) => {
    this.props.panel.isInView = v;
  };

  onPanelLoad = () => {
    if (!this.props.plugin) {
      this.props.initPanelState(this.props.panel);
    }
  };

  componentDidUpdate(prevProps: Props) {
    const { panel } = this.props;
    if (!prevProps.panel || prevProps.panel.id !== panel.id) {
      this.props.panel.isInView = !this.props.lazy;
      if (!this.props.lazy) {
        this.onPanelLoad();
      }    }
  }

  render() {
    const {
      dashboard,
      panel,
      isViewing,
      isEditing,
      width,
      height,
      plugin,
      timezone,
      hideMenu,
      isDraggable = true,
    } = this.props;

    //Qui è ancora 6h
    if (!plugin) {
      return null;
    }

    return (
      <MyPanelStateWrapper
        plugin={plugin}
        panel={panel}
        dashboard={dashboard}
        isViewing={isViewing}
        isEditing={isEditing}
        isInView={true}
        isDraggable={isDraggable}
        width={width}
        height={height}
        onInstanceStateChange={this.onInstanceStateChange}
        timezone={timezone}
        hideMenu={hideMenu}
      />
    );
  }
}

export const MyDashboardPanel = connector(MyDashboardPanelUnconnected);
