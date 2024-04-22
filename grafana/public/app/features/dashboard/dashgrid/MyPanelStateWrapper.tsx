import React, { PureComponent } from 'react';
import { Subscription } from 'rxjs';

import {
  AbsoluteTimeRange,
  AnnotationChangeEvent,
  AnnotationEventUIModel,
  CoreApp,
  DashboardCursorSync,
  DataFrame,
  EventFilterOptions,
  FieldConfigSource,
  getDataSourceRef,
  getDefaultTimeRange,
  LoadingState,
  PanelData,
  PanelPlugin,
  PanelPluginMeta,
  TimeRange,
  toDataFrameDTO,
  toUtc,
  TypedVariableModel,
} from '@grafana/data';
import { RefreshEvent, getTemplateSrv } from '@grafana/runtime';
import { VizLegendOptions } from '@grafana/schema';
import {
  ErrorBoundary,
  PanelChrome,
  PanelContext,
  PanelContextProvider,
  SeriesVisibilityChangeMode,
  AdHocFilterItem,
} from '@grafana/ui';
import { profiler } from 'app/core/profiler';
import { applyPanelTimeOverrides } from 'app/features/dashboard/utils/panel';
import { getDatasourceSrv } from 'app/features/plugins/datasource_srv';
import { applyFilterFromTable } from 'app/features/variables/adhoc/actions';
import { onUpdatePanelSnapshotData } from 'app/plugins/datasource/grafana/utils';
import { changeSeriesColorConfigFactory } from 'app/plugins/panel/timeseries/overrides/colorSeriesConfigFactory';
import { dispatch } from 'app/store/store';
import { RenderEvent } from 'app/types/events';

import { deleteAnnotation, saveAnnotation, updateAnnotation } from '../../annotations/api';
import { getDashboardQueryRunner } from '../../query/state/DashboardQueryRunner/DashboardQueryRunner';
import { getTimeSrv, TimeSrv } from '../services/TimeSrv';
import { DashboardModel, PanelModel } from '../state';
import { getPanelChromeProps } from '../utils/getPanelChromeProps';
import { loadSnapshotData } from '../utils/loadSnapshotData';

import { PanelHeaderMenuWrapper } from './PanelHeader/PanelHeaderMenuWrapper';
import { seriesVisibilityConfigFactory } from './SeriesVisibilityConfigFactory';
import { liveTimer } from './liveTimer';

const DEFAULT_PLUGIN_ERROR = 'Error in plugin';

export interface Props {
  panel: PanelModel;
  dashboard: DashboardModel;
  plugin: PanelPlugin;
  isViewing: boolean;
  isEditing: boolean;
  isInView: boolean;
  isDraggable?: boolean;
  width: number;
  height: number;
  onInstanceStateChange: (value: any) => void;
  timezone?: string;
  hideMenu?: boolean;
}

export interface State {
  isFirstLoad: boolean;
  renderCounter: number;
  errorMessage?: string;
  refreshWhenInView: boolean;
  context: PanelContext;
  data: PanelData;
  liveTime?: TimeRange;
}

export class MyPanelStateWrapper extends PureComponent<Props, State> {
  private readonly timeSrv: TimeSrv = getTimeSrv();
  private subs = new Subscription();
  private eventFilter: EventFilterOptions = { onlyLocal: true };

  constructor(props: Props) {
    super(props);

    // Can this eventBus be on PanelModel?  when we have more complex event filtering, that may be a better option
    const eventBus = props.dashboard.events.newScopedBus(`panel:${props.panel.id}`, this.eventFilter);

    this.state = {
      isFirstLoad: true,
      renderCounter: 0,
      refreshWhenInView: false,
      context: {
        eventsScope: '__global_',
        eventBus,
        app: this.getPanelContextApp(),
        sync: this.getSync,
        onSeriesColorChange: this.onSeriesColorChange,
        onToggleSeriesVisibility: this.onSeriesVisibilityChange,
        onAnnotationCreate: undefined,
        onAnnotationUpdate: undefined,
        onAnnotationDelete: undefined, //Tolta possibilità di aggiungere annotazioni 
        onInstanceStateChange: this.onInstanceStateChange,
        onToggleLegendSort: this.onToggleLegendSort,
        canAddAnnotations: undefined,
        canEditAnnotations: undefined,
        canDeleteAnnotations: undefined,// Rimosso toggle annotazione 
        onAddAdHocFilter: this.onAddAdHocFilter,
        onUpdateData: this.onUpdateData,
      },
      data: this.getInitialPanelDataState(),
    };
  }

  // Due to a mutable panel model we get the sync settings via function that proactively reads from the model
  getSync = () => (this.props.isEditing ? DashboardCursorSync.Off : this.props.dashboard.graphTooltip);

  onInstanceStateChange = (value: any) => {
    this.props.onInstanceStateChange(value);

    this.setState({
      context: {
        ...this.state.context,
        instanceState: value,
      },
    });
  };

  getPanelContextApp() {
    if (this.props.isEditing) {
      return CoreApp.PanelEditor;
    }
    if (this.props.isViewing) {
      return CoreApp.PanelViewer;
    }

    return CoreApp.Dashboard;
  }

  onUpdateData = (frames: DataFrame[]): Promise<boolean> => {
    return onUpdatePanelSnapshotData(this.props.panel, frames);
  };

  onSeriesColorChange = (label: string, color: string) => {
    this.onFieldConfigChange(changeSeriesColorConfigFactory(label, color, this.props.panel.fieldConfig));
  };

  onSeriesVisibilityChange = (label: string, mode: SeriesVisibilityChangeMode) => {
    this.onFieldConfigChange(
      seriesVisibilityConfigFactory(label, mode, this.props.panel.fieldConfig, this.state.data.series)
    );
  };

  onToggleLegendSort = (sortKey: string) => {
    const legendOptions: VizLegendOptions = this.props.panel.options.legend;

    // We don't want to do anything when legend options are not available
    if (!legendOptions) {
      return;
    }

    let sortDesc = legendOptions.sortDesc;
    let sortBy = legendOptions.sortBy;
    if (sortKey !== sortBy) {
      sortDesc = undefined;
    }

    // if already sort ascending, disable sorting
    if (sortDesc === false) {
      sortBy = undefined;
      sortDesc = undefined;
    } else {
      sortDesc = !sortDesc;
      sortBy = sortKey;
    }

    this.onOptionsChange({
      ...this.props.panel.options,
      legend: { ...legendOptions, sortBy, sortDesc },
    });
  };

  getInitialPanelDataState(): PanelData {
    return {
      state: LoadingState.NotStarted,
      series: [],
      timeRange: getDefaultTimeRange(),
    };
  }

  initializePanel() {
    const { dashboard, panel } = this.props;

    // Subscribe to panel events
    this.subs.add(panel.events.subscribe(RefreshEvent, this.onRefresh));
    this.subs.add(panel.events.subscribe(RenderEvent, this.onRender));

    dashboard.panelInitialized(panel);

    // Move snapshot data into the query response
    //Qui non entra
    if (this.hasPanelSnapshot) {
      this.setState({
        data: loadSnapshotData(panel, dashboard),
        isFirstLoad: false,
      });
      return;
    }

    // Qui non entra
    if (!this.wantsQueryExecution) {
      this.setState({ isFirstLoad: false });
    }

    this.subs.add(
      panel
        .getQueryRunner()
        .getData({ withTransforms: true, withFieldConfig: true })
        .subscribe({
          next: (data) => this.onDataUpdate(data),
        })
    );

    // Listen for live timer events
    liveTimer.listen(this);
  }

  componentDidMount() {
    this.initializePanel();

    const receiveMessage = (event: any) => {
      if (event.data.variables != undefined) {
        const change = event.data.variables;
        const srv = getTemplateSrv();
        const variables = srv.getVariables();
        const newVariables: TypedVariableModel[] = [];
        let tmp: TypedVariableModel;
        let newV: TypedVariableModel;
        change.forEach((c) => {
          tmp = variables.find((v) => v.name === c.key);
          if (tmp != undefined) {
            newV = { ...tmp };
            newV.current = { ...tmp.current, value: c.value };
            newVariables.push(newV);
          }
        });
        if (newVariables.length > 0) {
          srv.init(newVariables);
          this.onRefresh();
        }
      }
      if (event.data.timeRange != undefined) {
        this.onChangeTimeRange(event.data.timeRange);
      }
    };

    window.addEventListener('message', receiveMessage);

    return () => {
      window.removeEventListener('message', receiveMessage);
    };

  }

  componentWillUnmount() {
    this.subs.unsubscribe();
    liveTimer.remove(this);
  }

  liveTimeChanged(liveTime: TimeRange) {
    const { data } = this.state;
    if (data.timeRange) {
      const delta = liveTime.to.valueOf() - data.timeRange.to.valueOf();
      if (delta < 100) {
        // 10hz
        console.log('Skip tick render', this.props.panel.title, delta);
        return;
      }
    }
    this.setState({ liveTime });
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const { isInView, width, panel } = this.props;
    const { context } = this.state;

    const app = this.getPanelContextApp();

    if (context.app !== app) {
      this.setState({
        context: {
          ...context,
          app,
        },
      });
    }

    // View state has changed
    if (isInView !== prevProps.isInView) {
      if (isInView) {
        // Check if we need a delayed refresh
        if (this.state.refreshWhenInView) {
          this.onRefresh();
        }
      }
    }

    // The timer depends on panel width
    if (width !== prevProps.width) {
      liveTimer.updateInterval(this);
    }

  }

  // Updates the response with information from the stream
  // The next is outside a react synthetic event so setState is not batched
  // So in this context we can only do a single call to setState
  onDataUpdate(data: PanelData) {
    const { dashboard, plugin, panel } = this.props;

    // Ignore this data update if we are now a non data panel
    if (plugin.meta.skipDataQuery) {
      this.setState({ data: this.getInitialPanelDataState() });
      return;
    }

    let { isFirstLoad } = this.state;
    let errorMessage: string | undefined;

    switch (data.state) {
      case LoadingState.Loading:
        // Skip updating state data if it is already in loading state
        // This is to avoid rendering partial loading responses
        if (this.state.data.state === LoadingState.Loading) {
          return;
        }
        break;
      case LoadingState.Error:
        const { error, errors } = data;
        if (errors?.length) {
          if (errors.length === 1) {
            errorMessage = errors[0].message;
          } else {
            errorMessage = 'Multiple errors found. Click for more details';
          }
        } else if (error) {
          if (errorMessage !== error.message) {
            errorMessage = error.message;
          }
        }
        break;
      case LoadingState.Done:
        // If we are doing a snapshot save data in panel model
        if (dashboard.snapshot) {
          panel.snapshotData = data.series.map((frame) => toDataFrameDTO(frame));
        }
        if (isFirstLoad) {
          isFirstLoad = false;
        }
        break;
    }

    this.setState({ isFirstLoad, errorMessage, data, liveTime: undefined });
  }

  onRefresh = () => {
    const { dashboard, isInView, width, panel } = this.props;
    if (!isInView) {
      this.setState({ refreshWhenInView: true });
      return;
    }

    //Qui è ancora 6h
    const timeData = applyPanelTimeOverrides(panel, this.timeSrv.timeRange());
    //Qui diventa 3h
    // Issue Query
    if (this.wantsQueryExecution) {
      if (width < 0) {
        return;
      }

      if (this.state.refreshWhenInView) {
        this.setState({ refreshWhenInView: false });
      }
      panel.runAllPanelQueries({
        dashboardUID: dashboard.uid,
        dashboardTimezone: dashboard.getTimezone(),
        timeData,
        width,
      });
    } else {
      // The panel should render on refresh as well if it doesn't have a query, like clock panel
      this.setState({
        data: { ...this.state.data, timeRange: this.timeSrv.timeRange() },
        renderCounter: this.state.renderCounter + 1,
        liveTime: undefined,
      });
    }
  };

  onRender = () => {
    const stateUpdate = { renderCounter: this.state.renderCounter + 1 };
    this.setState(stateUpdate);
  };

  onOptionsChange = (options: any) => {
    this.props.panel.updateOptions(options);
  };

  onFieldConfigChange = (config: FieldConfigSource) => {
    this.props.panel.updateFieldConfig(config);
  };

  onPanelError = (error: Error) => {
    const errorMessage = error.message || DEFAULT_PLUGIN_ERROR;
    if (this.state.errorMessage !== errorMessage) {
      this.setState({ errorMessage });
    }
  };

  onPanelErrorRecover = () => {
    this.setState({ errorMessage: undefined });
  };

  onAnnotationCreate = async (event: AnnotationEventUIModel) => {
    const isRegion = event.from !== event.to;
    const anno = {
      dashboardUID: this.props.dashboard.uid,
      panelId: this.props.panel.id,
      isRegion,
      time: event.from,
      timeEnd: isRegion ? event.to : 0,
      tags: event.tags,
      text: event.description,
    };
    await saveAnnotation(anno);
    getDashboardQueryRunner().run({ dashboard: this.props.dashboard, range: this.timeSrv.timeRange() });
    this.state.context.eventBus.publish(new AnnotationChangeEvent(anno));
  };

  onAnnotationDelete = async (id: string) => {
    await deleteAnnotation({ id });
    getDashboardQueryRunner().run({ dashboard: this.props.dashboard, range: this.timeSrv.timeRange() });
    this.state.context.eventBus.publish(new AnnotationChangeEvent({ id }));
  };

  onAnnotationUpdate = async (event: AnnotationEventUIModel) => {
    const isRegion = event.from !== event.to;
    const anno = {
      id: event.id,
      dashboardUID: this.props.dashboard.uid,
      panelId: this.props.panel.id,
      isRegion,
      time: event.from,
      timeEnd: isRegion ? event.to : 0,
      tags: event.tags,
      text: event.description,
    };
    await updateAnnotation(anno);

    getDashboardQueryRunner().run({ dashboard: this.props.dashboard, range: this.timeSrv.timeRange() });
    this.state.context.eventBus.publish(new AnnotationChangeEvent(anno));
  };

  get hasPanelSnapshot() {
    const { panel } = this.props;
    return panel.snapshotData && panel.snapshotData.length;
  }

  get wantsQueryExecution() {
    return !(this.props.plugin.meta.skipDataQuery || this.hasPanelSnapshot);
  }

  onChangeTimeRange = (timeRange: AbsoluteTimeRange) => {
    this.timeSrv.setTime({
      from: toUtc(timeRange.from),
      to: toUtc(timeRange.to),
    });
  };

  onChangeTimeRangeOverride = (timeRange: AbsoluteTimeRange) => {
    return;
  };

  shouldSignalRenderingCompleted(loadingState: LoadingState, pluginMeta: PanelPluginMeta) {
    return loadingState === LoadingState.Done || loadingState === LoadingState.Error || pluginMeta.skipDataQuery;
  }

  skipFirstRender(loadingState: LoadingState) {
    const { isFirstLoad } = this.state;
    return (
      this.wantsQueryExecution &&
      isFirstLoad &&
      (loadingState === LoadingState.Loading || loadingState === LoadingState.NotStarted)
    );
  }

  onAddAdHocFilter = (filter: AdHocFilterItem) => {
    const { key, value, operator } = filter;

    // When the datasource is null/undefined (for a default datasource), we use getInstanceSettings
    // to find the real datasource ref for the default datasource.
    const datasourceInstance = getDatasourceSrv().getInstanceSettings(this.props.panel.datasource);
    const datasourceRef = datasourceInstance && getDataSourceRef(datasourceInstance);
    if (!datasourceRef) {
      return;
    }

    dispatch(applyFilterFromTable({ datasource: datasourceRef, key, operator, value }));
  };

  renderPanelContent(innerWidth: number, innerHeight: number) {
    const { plugin, dashboard, panel } = this.props;
    const { renderCounter, data } = this.state;
    const { state: loadingState } = data;

    // do not render component until we have first data
    if (this.skipFirstRender(loadingState)) {
      return null;
    }

    // This is only done to increase a counter that is used by backend
    // image rendering to know when to capture image
    if (this.shouldSignalRenderingCompleted(loadingState, plugin.meta)) {
      profiler.renderingCompleted();
    }

    const PanelComponent = plugin.panel!;
    const timeRange = this.state.liveTime ?? data.timeRange ?? this.timeSrv.timeRange();
    const panelOptions = panel.getOptions();

    // Update the event filter (dashboard settings may have changed)
    // Yes this is called ever render for a function that is triggered on every mouse move
    this.eventFilter.onlyLocal = dashboard.graphTooltip === 0;
    // Qui viene restiutito il grafico
    return (
      <>
        <PanelContextProvider value={this.state.context}>
          <PanelComponent
            id={panel.id}
            data={data}
            title={panel.title}
            timeRange={timeRange}
            timeZone={this.props.dashboard.getTimezone()}
            options={panelOptions}
            fieldConfig={panel.fieldConfig}
            transparent={panel.transparent}
            width={innerWidth}
            height={innerHeight}
            renderCounter={renderCounter}
            replaceVariables={panel.replaceVariables}
            onOptionsChange={this.onOptionsChange}
            onFieldConfigChange={this.onFieldConfigChange}
            onChangeTimeRange={this.onChangeTimeRangeOverride} // Rimossa callback per cambiare il range di tempo
            eventBus={dashboard.events}
          />
        </PanelContextProvider>
      </>
    );
  }

  render() {
    const { dashboard, width, height, plugin, panel } = this.props;
    const { errorMessage, data } = this.state;
    const { transparent } = panel;

    // Aggiunto panel perché deve usare quello preso dallo stato e non dalle props
    const panelChromeProps = getPanelChromeProps({ ...this.props, data, panel });

    // Shift the hover menu down if it's on the top row so it doesn't get clipped by topnav
    const hoverHeaderOffset = (panel.gridPos?.y ?? 0) === 0 ? -16 : undefined;

    const menu = (
      <div data-testid="panel-dropdown">
        <PanelHeaderMenuWrapper panel={panel} dashboard={dashboard} loadingState={data.state} />
      </div>
    );

    // Questo è il componente che contiene il grafico
    return (
      <PanelChrome
        width={width}
        height={height}
        title={panelChromeProps.title}
        loadingState={data.state}
        statusMessage={errorMessage}
        statusMessageOnClick={panelChromeProps.onOpenErrorInspect}
        description={panelChromeProps.description}
        titleItems={panelChromeProps.titleItems}
        menu={this.props.hideMenu ? undefined : menu}
        dragClass={panelChromeProps.dragClass}
        dragClassCancel="grid-drag-cancel"
        padding={panelChromeProps.padding}
        hoverHeaderOffset={hoverHeaderOffset}
        hoverHeader={panelChromeProps.hasOverlayHeader()}
        displayMode={transparent ? 'transparent' : 'default'}
        onCancelQuery={panelChromeProps.onCancelQuery}
        onOpenMenu={panelChromeProps.onOpenMenu}
      >
        {(innerWidth, innerHeight) => (
          <>
            <ErrorBoundary
              dependencies={[data, plugin, panel.getOptions()]}
              onError={this.onPanelError}
              onRecover={this.onPanelErrorRecover}
            >
              {({ error }) => {
                if (error) {
                  return null;
                }
                return this.renderPanelContent(innerWidth, innerHeight);
              }}
            </ErrorBoundary>
          </>
        )}
      </PanelChrome>
    );
  }
}
