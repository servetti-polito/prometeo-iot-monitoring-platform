import React, { Component } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import AutoSizer from 'react-virtualized-auto-sizer';

import { GrafanaContext, GrafanaContextType } from 'app/core/context/GrafanaContext';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';
import { DashboardModel, PanelModel } from 'app/features/dashboard/state';
import { StoreState } from 'app/types';

import { MyDashboardPanel } from '../dashgrid/MyDashboardPanel';
import { initDashboard } from '../state/initDashboard';

export interface DashboardPageRouteParams {
  uid?: string;
  type?: string;
  slug?: string;
}

const mapStateToProps = (state: StoreState) => ({
  dashboard: state.dashboard.getModel(),
});

const mapDispatchToProps = {
  initDashboard,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type Props = GrafanaRouteComponentProps<DashboardPageRouteParams, { panelId: string; timezone?: string }> &
  ConnectedProps<typeof connector>;

export interface State {
  panel: PanelModel | null;
  notFound: boolean;
}

export class MySoloPanelPage extends Component<Props, State> {
  declare context: GrafanaContextType;
  static contextType = GrafanaContext;

  state: State = {
    panel: null,
    notFound: false,
  };

  componentDidMount() {
    const { match, route } = this.props;

    this.props.initDashboard({
      urlSlug: match.params.slug,
      urlUid: match.params.uid,
      urlType: match.params.type,
      routeName: route.routeName,
      fixUrl: false,
      keybindingSrv: this.context.keybindings,
    });
  }

  getPanelId(): number {
    return parseInt(this.props.queryParams.panelId ?? '0', 10);
  }

  componentDidUpdate(prevProps: Props) {
    const { dashboard, queryParams } = this.props;

    if (!dashboard) {
      return;
    }

    // we just got a new dashboard
    if (!prevProps.dashboard || prevProps.dashboard.uid !== dashboard.uid) {
      const panel = dashboard.getPanelByUrlId(this.props.queryParams.panelId);
      if (!panel) {
        this.setState({ notFound: true });
        return;
      }
      this.setState({ panel, notFound: false });
    }

    if (!prevProps.queryParams || prevProps.queryParams.panelId !== queryParams.panelId) {
      const panel = dashboard.getPanelByUrlId(this.getPanelId());

      if (!panel) {
        this.setState({ notFound: true });
        return;
      }

      this.setState({ panel, notFound: false });
    }

  }

  render() {
    return (
      <MySoloPanel
        dashboard={this.props.dashboard}
        notFound={this.state.notFound}
        panel={this.state.panel}
        panelId={this.getPanelId()}
        timezone={this.props.queryParams.timezone}
      />
    );
  }
}

export interface MySoloPanelProps extends State {
  dashboard: DashboardModel | null;
  panelId: number;
  timezone?: string;
}

export const MySoloPanel = ({ dashboard, notFound, panel, panelId, timezone }: MySoloPanelProps) => {
  //Qui ho ancora 6h come timeRange
  if (notFound) {
    return <div className="alert alert-error">Panel with id {panelId} not found</div>;
  }

  if (!panel || !dashboard) {
    return <div>Loading & initializing dashboard</div>;
  }

  return (
    <div className="panel-solo">
      <AutoSizer>
        {({ width, height }) => {
          if (width === 0) {
            return null;
          }
          return (
            <MyDashboardPanel
              stateKey={panel.key}
              width={width}
              height={height}
              dashboard={dashboard}
              panel={panel}
              isEditing={false}
              isViewing={true}
              lazy={false}
              timezone={timezone}
              hideMenu={true} // è il menù in alto a destra per modificare o fare lo share
            />
          );
        }}
      </AutoSizer>
    </div>
  );
};

export default connector(MySoloPanelPage);
