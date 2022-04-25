import PropTypes from 'prop-types';
import semver from 'semver';
import React, { PureComponent } from 'react';
import { Button } from 'react-bootstrap';
import Toggle from 'react-toggle';
import SortableTable from 'app/components/SortableTable';
import i18n from 'app/lib/i18n';
import Space from 'app/components/Space';
import store from 'app/store';

export default class PostProcessors extends PureComponent {
    static propTypes = {
        state: PropTypes.object,
        actions: PropTypes.object
    };

    state = {
        ignore: store.get('containers.settings.posts.ignore') ?? {}
    };

    handleIgnoreChanged = (id, event) => {
        const { ignore } = this.state;
        // eslint-disable-next-line no-unused-vars
        const { [id]: _, ...oldIgnore } = ignore;

        const newIgnore = { [id]: event.target.checked, ...oldIgnore };

        this.setState({ ignore: newIgnore });

        store.set('containers.settings.posts.ignore', newIgnore);
    }

    componentDidMount() {
        const { actions } = this.props;

        actions.fetchRecords();
    }

    render() {
        const { state, actions } = this.props;
        const { ignore } = this.state;

        const records = state.records.map((record) => {
            const { application, applicationVersion } = record;
            const id = `${application}:${applicationVersion}`;

            return {
                ignore: ignore[id] ?? false,
                ...record
            };
        });

        return (
            <div>
                <SortableTable
                    bordered={true}
                    justified={false}
                    data={(state.api.err || state.api.fetching) ? [] : records}
                    emptyText={() => {
                        if (state.api.err) {
                            return (
                                <span className="text-danger">
                                    {i18n._('An unexpected error has occurred.')}
                                </span>
                            );
                        }

                        if (state.api.fetching) {
                            return (
                                <span>
                                    <i className="fa fa-fw fa-spin fa-circle-o-notch" />
                                    <Space width="8" />
                                    {i18n._('Loading...')}
                                </span>
                            );
                        }

                        return i18n._('No data to display');
                    }}
                    columns={[
                        {
                            title: i18n._('Application'),
                            key: 'application',
                            sortable: true,
                            render: (_value, record, _index) => {
                                return record.application;
                            }
                        },
                        {
                            title: i18n._('Application Version'),
                            key: 'applicationVersion',
                            render: (_value, record, _index) => {
                                return record.applicationVersion;
                            }
                        },
                        {
                            title: i18n._('Post Processor'),
                            key: 'postProcessor',
                            render: (_value, record, _index) => {
                                const { postProcessor } = record;

                                return postProcessor;
                            }
                        },
                        {
                            title: i18n._('Post Processor Version'),
                            key: 'postProcessorVersion',
                            render: (_value, record, _index) => {
                                const { postProcessorVersion } = record;

                                return postProcessorVersion ?? i18n._('Not Installed');
                            }
                        },
                        {
                            title: i18n._('Post Version'),
                            key: 'installedPostVersion',
                            render: (_value, record, _index) => {
                                const { installedPostVersion } = record;

                                return installedPostVersion ?? i18n._('Not Installed');
                            }
                        },
                        {
                            title: i18n._('Install'),
                            className: 'text-nowrap',
                            key: 'action',
                            width: 200,
                            render: (_value, record, _index) => {
                                const { application, applicationVersion, postProcessorVersion, minimumPostProcessorVersion, installedPostVersion, postVersion } = record;

                                const supported = !postProcessorVersion || postProcessorVersion === 'unknown' || Number(postProcessorVersion) >= Number(minimumPostProcessorVersion);
                                const newer = !installedPostVersion || installedPostVersion === 'unknown' || semver.gt(postVersion, installedPostVersion);

                                return (
                                    <div>
                                        {supported && newer && (
                                            <Button
                                                title={`${i18n._('Install')} ${postVersion}`}
                                                size="m"
                                                style={{ width: '100%' }}
                                                onClick={() => {
                                                    actions.install({ application, applicationVersion });
                                                }}
                                            >
                                                {`${i18n._('Install')} ${postVersion}`}
                                            </Button>
                                        )}
                                        {supported && !newer && (
                                            <div>Already latest</div>
                                        )}
                                        {!supported && (
                                            <div>Not supported</div>
                                        )}
                                    </div>
                                );
                            }
                        },
                        {
                            title: i18n._('Ignore'),
                            key: 'ignore',
                            render: (_value, record, _index) => {
                                const { application, applicationVersion, ignore } = record;
                                const id = `${application}:${applicationVersion}`;

                                return (
                                    <Toggle
                                        size="sm"
                                        icons={false}
                                        checked={ignore}
                                        onChange={(event) => this.handleIgnoreChanged(id, event)}
                                    />
                                );
                            }
                        }
                    ]}
                />
            </div>
        );
    }
}
