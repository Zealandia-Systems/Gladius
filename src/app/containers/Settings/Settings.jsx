//import classNames from 'classnames';
import ensureArray from 'ensure-array';
import i18next from 'i18next';
import Uri from 'jsuri';
import PropTypes from 'prop-types';
//import _camelCase from 'lodash/camelCase';
import _find from 'lodash/find';
import _findIndex from 'lodash/findIndex';
import _get from 'lodash/get';
import _isEqual from 'lodash/isEqual';
import pubsub from 'pubsub-js';
import React, { PureComponent } from 'react';
import { Button, Nav, NavItem } from 'react-bootstrap';
import api from 'app/api';
import {
    ERR_CONFLICT,
    ERR_PRECONDITION_FAILED
} from 'app/api/constants';
import settings from 'app/config/settings';
//import Breadcrumbs from 'app/components/Breadcrumbs';
import Modal from 'app/components/Modal';
import i18n from 'app/lib/i18n';
import controller from 'app/lib/controller';
import store from 'app/store';
//import General from './General';
//import Workspace from './Workspace';
//import MachineProfiles from './MachineProfiles';
//import UserAccounts from './UserAccounts';
//import Controller from './Controller';
//import Commands from './Commands';
//import Machine from './Machine';
import CoordinateSystems from './CoordinateSystems';
import Tools from './Tools';
import Pockets from './Pockets';
import Posts from './PostProcessors';
import Events from './Events';
import About from './About';
//import styles from './index.styl';

class Settings extends PureComponent {
    static propTypes = {
        port: PropTypes.string.isRequired,
        section: PropTypes.string
    };

    handleClose = () => {
        this.setState({ show: false });
    };

    sections = [
        /*{
            id: 'general',
            path: 'general',
            title: i18n._('General'),
            component: (props) => <General {...props} />
        },
        {
            id: 'workspace',
            path: 'workspace',
            title: i18n._('Workspace'),
            component: (props) => <Workspace {...props} />
        },
        {
                id: 'machineProfiles',
                path: 'machine-profiles',
                title: i18n._('Machine Profiles'),
                component: (props) => <MachineProfiles {...props} />
        },
        {
                id: 'userAccounts',
                path: 'user-accounts',
                title: i18n._('User Accounts'),
                component: (props) => <UserAccounts {...props} />
        },
        {
            id: 'machine',
            path: 'machine',
            title: i18n._('Machine'),
            component: (props) => <Machine {...props} />
        },*/
        {
            id: 'wcs',
            path: 'wcs',
            title: i18n._('Coordinate Systems'),
            available: (controllerSettings) => true,
            component: (props) => <CoordinateSystems {...props} />
        },
        {
            id: 'tools',
            path: 'tools',
            title: i18n._('Tools'),
            available: (controllerSettings) => true,
            component: (props) => <Tools {...props} />
        },
        {
            id: 'pockets',
            path: 'pockets',
            title: i18n._('Pockets'),
            available: (controllerSettings) => {
                return controllerSettings?.firmware?.hasATC ?? false;
            },
            component: (props) => <Pockets {...props} />
        },
        {
            id: 'posts',
            path: 'posts',
            title: i18n._('Posts'),
            available: (controllerSettings) => true,
            component: (props) => <Posts {...props} />
        },
        /*{
            id: 'commands',
            path: 'commands',
            title: i18n._('Commands'),
            component: (props) => <Commands {...props} />
        },*/
        {
            id: 'events',
            path: 'events',
            title: i18n._('Events'),
            available: (controllerSettings) => true,
            component: (props) => <Events {...props} />
        },
        {
            id: 'about',
            path: 'about',
            title: i18n._('About'),
            available: (controllerSettings) => true,
            component: (props) => <About {...props} />
        }
    ];

    initialState = this.getInitialState();

    state = this.getInitialState();

    createActions = (name, canCreate = true, canDelete = true) => {
        let actions = {
            fetchRecords: (options) => {
                const { port } = this.props;

                if (!port) {
                    this.setState({
                        [name]: {
                            ...this.state[name],
                            alertMessage: 'Must be connected to edit ' + name + '.'
                        }
                    });
                } else {
                    const state = this.state[name];
                    const {
                        page = state.pagination.page,
                        paging = true,
                        pageLength = state.pagination.pageLength,
                        sorting = true,
                        sortColumn = state.sorting.sortColumn,
                        sortOrder = state.sorting.sortOrder
                    } = { ...options };

                    this.setState({
                        [name]: {
                            ...this.state[name],
                            api: {
                                ...this.state[name].api,
                                err: false,
                                fetching: true
                            },
                            alertMessage: null
                        }
                    });

                    api[name].fetch({ port, paging, page, pageLength, sorting, sortColumn, sortOrder })
                        .then((res) => {
                            const { pagination, sorting, records } = res.body;

                            this.setState({
                                [name]: {
                                    ...this.state[name],
                                    api: {
                                        ...this.state[name].api,
                                        err: false,
                                        fetching: false
                                    },
                                    pagination: {
                                        page: pagination.page,
                                        pageLength: pagination.pageLength,
                                        totalRecords: pagination.totalRecords
                                    },
                                    sorting: {
                                        sortColumn: sorting.sortColumn,
                                        sortOrder: sorting.sortOrder
                                    },
                                    records: records
                                }
                            });
                        })
                        .catch((res) => {
                            this.setState({
                                [name]: {
                                    ...this.state[name],
                                    api: {
                                        ...this.state[name].api,
                                        err: true,
                                        fetching: false
                                    },
                                    records: []
                                }
                            });
                        });
                }
            },
            updateRecord: (id, record) => {
                const { port } = this.props;
                const actions = this.actions[name];

                api[name].update(port, id, record)
                    .then((res) => {
                        actions.closeModal();
                        actions.fetchRecords();
                    })
                    .catch((res) => {
                        const fallbackMsg = i18n._('An unexpected error has occurred.');
                        const msg = res.body.message || fallbackMsg;

                        actions.updateModalParams({ alertMessage: msg });
                    });
            },
            openModal: (modalName = '', params = {}) => {
                this.setState({
                    [name]: {
                        ...this.state[name],
                        modal: {
                            name: modalName,
                            params: params
                        }
                    }
                });
            },
            closeModal: () => {
                this.setState({
                    [name]: {
                        ...this.state[name],
                        modal: {
                            name: '',
                            params: {}
                        }
                    }
                });
            },
            updateModalParams: (params = {}) => {
                this.setState({
                    [name]: {
                        ...this.state[name],
                        modal: {
                            ...this.state[name].modal,
                            params: {
                                ...this.state[name].modal.params,
                                ...params
                            }
                        }
                    }
                });
            }
        };

        if (canCreate) {
            actions.createRecord = (record) => {
                const { port } = this.props;
                const actions = this.actions[name];

                api[name].create(port, record)
                    .then((res) => {
                        actions.closeModal();
                        actions.fetchRecords();
                    })
                    .catch((res) => {
                        const fallbackMsg = i18n._('An unexpected error has occurred.');
                        const msg = res.body.message || fallbackMsg;

                        actions.updateModalParams({ alertMessage: msg });
                    });
            };
        }

        if (canDelete) {
            actions.deleteRecord = (id) => {
                const { port } = this.props;
                const actions = this.actions[name];

                api[name].delete(port, id)
                    .then((res) => {
                        actions.fetchRecords();
                    })
                    .catch((res) => {
                        const fallbackMsg = i18n._('An unexpected error has occurred.');
                        const msg = res.body.message || fallbackMsg;

                        actions.updateModalParams({ alertMessage: msg });
                    });
            };
        }

        return actions;
    };

    actions = {
        // General
        general: {
            load: (options) => {
                this.setState({
                    general: {
                        ...this.state.general,
                        api: {
                            ...this.state.general.api,
                            err: false,
                            loading: true
                        }
                    }
                });

                api.getState()
                    .then((res) => {
                        const { checkForUpdates } = { ...res.body };

                        const nextState = {
                            ...this.state.general,
                            api: {
                                ...this.state.general.api,
                                err: false,
                                loading: false
                            },
                            // followed by data
                            checkForUpdates: !!checkForUpdates,
                            lang: i18next.language
                        };

                        this.initialState.general = nextState;

                        this.setState({ general: nextState });
                    })
                    .catch((res) => {
                        this.setState({
                            general: {
                                ...this.state.general,
                                api: {
                                    ...this.state.general.api,
                                    err: true,
                                    loading: false
                                }
                            }
                        });
                    });
            },
            save: () => {
                const { lang = 'en' } = this.state.general;

                this.setState({
                    general: {
                        ...this.state.general,
                        api: {
                            ...this.state.general.api,
                            err: false,
                            saving: true
                        }
                    }
                });

                const data = {
                    checkForUpdates: this.state.general.checkForUpdates
                };

                api.setState(data)
                    .then((res) => {
                        const nextState = {
                            ...this.state.general,
                            api: {
                                ...this.state.general.api,
                                err: false,
                                saving: false
                            }
                        };

                        // Update settings to initialState
                        this.initialState.general = nextState;

                        this.setState({ general: nextState });
                    })
                    .catch((res) => {
                        this.setState({
                            general: {
                                ...this.state.general,
                                api: {
                                    ...this.state.general.api,
                                    err: true,
                                    saving: false
                                }
                            }
                        });
                    })
                    .then(() => {
                        if (lang === i18next.language) {
                            return;
                        }

                        i18next.changeLanguage(lang, (err, t) => {
                            const uri = new Uri(window.location.search);
                            uri.replaceQueryParam('lang', lang);
                            window.location.search = uri.toString();
                        });
                    });
            },
            restoreSettings: () => {
                // Restore settings from initialState
                this.setState({
                    general: this.initialState.general
                });
            },
            toggleCheckForUpdates: () => {
                const { checkForUpdates } = this.state.general;
                this.setState({
                    general: {
                        ...this.state.general,
                        checkForUpdates: !checkForUpdates
                    }
                });
            },
            changeLanguage: (lang) => {
                this.setState({
                    general: {
                        ...this.state.general,
                        lang: lang
                    }
                });
            }
        },
        // Workspace
        workspace: {
            openModal: (name = '', params = {}) => {
                this.setState({
                    workspace: {
                        ...this.state.workspace,
                        modal: {
                            name: name,
                            params: params
                        }
                    }
                });
            },
            closeModal: () => {
                this.setState({
                    workspace: {
                        ...this.state.workspace,
                        modal: {
                            name: '',
                            params: {}
                        }
                    }
                });
            }
        },
        // Controller
        controller: {
            load: (options) => {
                this.setState(state => ({
                    controller: {
                        ...state.controller,
                        api: {
                            ...state.controller.api,
                            err: false,
                            loading: true
                        }
                    }
                }));

                api.getState().then((res) => {
                    const ignoreErrors = _get(res.body, 'controller.exception.ignoreErrors');

                    const nextState = {
                        ...this.state.controller,
                        api: {
                            ...this.state.controller.api,
                            err: false,
                            loading: false
                        },
                        // followed by data
                        ignoreErrors: !!ignoreErrors
                    };

                    this.initialState.controller = nextState;

                    this.setState({ controller: nextState });
                }).catch((res) => {
                    this.setState(state => ({
                        controller: {
                            ...state.controller,
                            api: {
                                ...state.controller.api,
                                err: true,
                                loading: false
                            }
                        }
                    }));
                });
            },
            save: () => {
                this.setState(state => ({
                    controller: {
                        ...state.controller,
                        api: {
                            ...state.controller.api,
                            err: false,
                            saving: true
                        }
                    }
                }));

                const data = {
                    controller: {
                        exception: {
                            ignoreErrors: this.state.controller.ignoreErrors
                        }
                    }
                };

                api.setState(data).then((res) => {
                    const nextState = {
                        ...this.state.controller,
                        api: {
                            ...this.state.controller.api,
                            err: false,
                            saving: false
                        }
                    };

                    // Update settings to initialState
                    this.initialState.controller = nextState;

                    this.setState({ controller: nextState });
                }).catch((res) => {
                    this.setState(state => ({
                        controller: {
                            ...state.controller,
                            api: {
                                ...state.controller.api,
                                err: true,
                                saving: false
                            }
                        }
                    }));
                });
            },
            restoreSettings: () => {
                // Restore settings from initialState
                this.setState({
                    controller: this.initialState.controller
                });
            },
            toggleIgnoreErrors: () => {
                this.setState(state => ({
                    controller: {
                        ...state.controller,
                        ignoreErrors: !state.controller.ignoreErrors
                    }
                }));
            }
        },
        // Machine Profiles
        machineProfiles: {
            fetchRecords: (options) => {
                const state = this.state.machineProfiles;
                const {
                    page = state.pagination.page,
                    pageLength = state.pagination.pageLength
                } = { ...options };

                this.setState({
                    machineProfiles: {
                        ...this.state.machineProfiles,
                        api: {
                            ...this.state.machineProfiles.api,
                            err: false,
                            fetching: true
                        }
                    }
                });

                api.machines.fetch({ paging: true, page, pageLength })
                    .then((res) => {
                        const { pagination, records } = res.body;

                        this.setState({
                            machineProfiles: {
                                ...this.state.machineProfiles,
                                api: {
                                    ...this.state.machineProfiles.api,
                                    err: false,
                                    fetching: false
                                },
                                pagination: {
                                    page: pagination.page,
                                    pageLength: pagination.pageLength,
                                    totalRecords: pagination.totalRecords
                                },
                                records: records
                            }
                        });

                        // FIXME: Use redux store
                        const machineProfiles = ensureArray(records);
                        pubsub.publish('updateMachineProfiles', machineProfiles);
                    })
                    .catch((res) => {
                        this.setState({
                            machineProfiles: {
                                ...this.state.machineProfiles,
                                api: {
                                    ...this.state.machineProfiles.api,
                                    err: true,
                                    fetching: false
                                },
                                records: []
                            }
                        });
                    });
            },
            createRecord: (options) => {
                const actions = this.actions.machineProfiles;

                api.machines.create(options)
                    .then((res) => {
                        actions.closeModal();
                        actions.fetchRecords();
                    })
                    .catch((res) => {
                        const fallbackMsg = i18n._('An unexpected error has occurred.');
                        const msg = {
                            // TODO
                        }[res.status] || fallbackMsg;

                        actions.updateModalParams({ alertMessage: msg });
                    });
            },
            updateRecord: (id, options, forceReload = false) => {
                const actions = this.actions.machineProfiles;

                api.machines.update(id, options)
                    .then((res) => {
                        actions.closeModal();

                        if (forceReload) {
                            actions.fetchRecords();
                            return;
                        }

                        const records = [...this.state.machineProfiles.records];
                        const index = _findIndex(records, { id: id });

                        if (index >= 0) {
                            records[index] = {
                                ...records[index],
                                ...options
                            };

                            this.setState({
                                machineProfiles: {
                                    ...this.state.machineProfiles,
                                    records: records
                                }
                            });
                        }
                    })
                    .catch((res) => {
                        const fallbackMsg = i18n._('An unexpected error has occurred.');
                        const msg = {
                            // TODO
                        }[res.status] || fallbackMsg;

                        actions.updateModalParams({ alertMessage: msg });
                    })
                    .then(() => {
                        try {
                            // Fetch machine profiles
                            api.machines.fetch()
                                .then(res => {
                                    const { records: machineProfiles } = res.body;
                                    return ensureArray(machineProfiles);
                                })
                                .then(machineProfiles => {
                                    // Update matched machine profile
                                    const currentMachineProfile = store.get('workspace.machineProfile');
                                    const currentMachineProfileId = _get(currentMachineProfile, 'id');
                                    const matchedMachineProfile = _find(machineProfiles, { id: currentMachineProfileId });

                                    if (matchedMachineProfile) {
                                        store.replace('workspace.machineProfile', matchedMachineProfile);
                                    }
                                });
                        } catch (err) {
                            // Ignore
                        }
                    });
            },
            deleteRecord: (id) => {
                const actions = this.actions.machineProfiles;

                api.machines.delete(id)
                    .then((res) => {
                        actions.fetchRecords();
                    })
                    .catch((res) => {
                        // Ignore error
                    })
                    .then(() => {
                        try {
                            // Fetch machine profiles
                            api.machines.fetch()
                                .then(res => {
                                    const { records: machineProfiles } = res.body;
                                    return ensureArray(machineProfiles);
                                })
                                .then(machineProfiles => {
                                    // Remove matched machine profile
                                    const currentMachineProfile = store.get('workspace.machineProfile');
                                    const currentMachineProfileId = _get(currentMachineProfile, 'id');
                                    if (currentMachineProfileId === id) {
                                        store.replace('workspace.machineProfile', { id: null });
                                    }
                                });
                        } catch (err) {
                            // Ignore
                        }
                    });
            },
            openModal: (name = '', params = {}) => {
                this.setState({
                    machineProfiles: {
                        ...this.state.machineProfiles,
                        modal: {
                            name: name,
                            params: params
                        }
                    }
                });
            },
            closeModal: () => {
                this.setState({
                    machineProfiles: {
                        ...this.state.machineProfiles,
                        modal: {
                            name: '',
                            params: {}
                        }
                    }
                });
            },
            updateModalParams: (params = {}) => {
                this.setState({
                    machineProfiles: {
                        ...this.state.machineProfiles,
                        modal: {
                            ...this.state.machineProfiles.modal,
                            params: {
                                ...this.state.machineProfiles.modal.params,
                                ...params
                            }
                        }
                    }
                });
            }
        },
        // User Accounts
        userAccounts: {
            fetchRecords: (options) => {
                const state = this.state.userAccounts;
                const {
                    page = state.pagination.page,
                    pageLength = state.pagination.pageLength
                } = { ...options };

                this.setState({
                    userAccounts: {
                        ...this.state.userAccounts,
                        api: {
                            ...this.state.userAccounts.api,
                            err: false,
                            fetching: true
                        }
                    }
                });

                api.users.fetch({ paging: true, page, pageLength })
                    .then((res) => {
                        const { pagination, records } = res.body;

                        this.setState({
                            userAccounts: {
                                ...this.state.userAccounts,
                                api: {
                                    ...this.state.userAccounts.api,
                                    err: false,
                                    fetching: false
                                },
                                pagination: {
                                    page: pagination.page,
                                    pageLength: pagination.pageLength,
                                    totalRecords: pagination.totalRecords
                                },
                                records: records
                            }
                        });
                    })
                    .catch((res) => {
                        this.setState({
                            userAccounts: {
                                ...this.state.userAccounts,
                                api: {
                                    ...this.state.userAccounts.api,
                                    err: true,
                                    fetching: false
                                },
                                records: []
                            }
                        });
                    });
            },
            createRecord: (options) => {
                const actions = this.actions.userAccounts;

                api.users.create(options)
                    .then((res) => {
                        actions.closeModal();
                        actions.fetchRecords();
                    })
                    .catch((res) => {
                        const fallbackMsg = i18n._('An unexpected error has occurred.');
                        const msg = {
                            [ERR_CONFLICT]: i18n._('The account name is already being used. Choose another name.')
                        }[res.status] || fallbackMsg;

                        actions.updateModalParams({ alertMessage: msg });
                    });
            },
            updateRecord: (id, options, forceReload = false) => {
                const actions = this.actions.userAccounts;

                api.users.update(id, options)
                    .then((res) => {
                        actions.closeModal();

                        if (forceReload) {
                            actions.fetchRecords();
                            return;
                        }

                        const records = [...this.state.userAccounts.records];
                        const index = _findIndex(records, { id: id });

                        if (index >= 0) {
                            records[index] = {
                                ...records[index],
                                ...options
                            };

                            this.setState({
                                userAccounts: {
                                    ...this.state.userAccounts,
                                    records: records
                                }
                            });
                        }
                    })
                    .catch((res) => {
                        const fallbackMsg = i18n._('An unexpected error has occurred.');
                        const msg = {
                            [ERR_CONFLICT]: i18n._('The account name is already being used. Choose another name.'),
                            [ERR_PRECONDITION_FAILED]: i18n._('Passwords do not match.')
                        }[res.status] || fallbackMsg;

                        actions.updateModalParams({ alertMessage: msg });
                    });
            },
            deleteRecord: (id) => {
                const actions = this.actions.userAccounts;

                api.users.delete(id)
                    .then((res) => {
                        actions.fetchRecords();
                    })
                    .catch((res) => {
                        // Ignore error
                    });
            },
            openModal: (name = '', params = {}) => {
                this.setState({
                    userAccounts: {
                        ...this.state.userAccounts,
                        modal: {
                            name: name,
                            params: params
                        }
                    }
                });
            },
            closeModal: () => {
                this.setState({
                    userAccounts: {
                        ...this.state.userAccounts,
                        modal: {
                            name: '',
                            params: {}
                        }
                    }
                });
            },
            updateModalParams: (params = {}) => {
                this.setState({
                    userAccounts: {
                        ...this.state.userAccounts,
                        modal: {
                            ...this.state.userAccounts.modal,
                            params: {
                                ...this.state.userAccounts.modal.params,
                                ...params
                            }
                        }
                    }
                });
            }
        },
        // Commands
        commands: {
            fetchRecords: (options) => {
                const state = this.state.commands;
                const {
                    page = state.pagination.page,
                    pageLength = state.pagination.pageLength
                } = { ...options };

                this.setState({
                    commands: {
                        ...this.state.commands,
                        api: {
                            ...this.state.commands.api,
                            err: false,
                            fetching: true
                        }
                    }
                });

                api.commands.fetch({ paging: true, page, pageLength })
                    .then((res) => {
                        const { pagination, records } = res.body;

                        this.setState({
                            commands: {
                                ...this.state.commands,
                                api: {
                                    ...this.state.commands.api,
                                    err: false,
                                    fetching: false
                                },
                                pagination: {
                                    page: pagination.page,
                                    pageLength: pagination.pageLength,
                                    totalRecords: pagination.totalRecords
                                },
                                records: records
                            }
                        });
                    })
                    .catch((res) => {
                        this.setState({
                            commands: {
                                ...this.state.commands,
                                api: {
                                    ...this.state.commands.api,
                                    err: true,
                                    fetching: false
                                },
                                records: []
                            }
                        });
                    });
            },
            createRecord: (options) => {
                const actions = this.actions.commands;

                api.commands.create(options)
                    .then((res) => {
                        actions.closeModal();
                        actions.fetchRecords();
                    })
                    .catch((res) => {
                        const fallbackMsg = i18n._('An unexpected error has occurred.');
                        const msg = {
                            // TODO
                        }[res.status] || fallbackMsg;

                        actions.updateModalParams({ alertMessage: msg });
                    });
            },
            updateRecord: (id, options, forceReload = false) => {
                const actions = this.actions.commands;

                api.commands.update(id, options)
                    .then((res) => {
                        actions.closeModal();

                        if (forceReload) {
                            actions.fetchRecords();
                            return;
                        }

                        const records = [...this.state.commands.records];
                        const index = _findIndex(records, { id: id });

                        if (index >= 0) {
                            records[index] = {
                                ...records[index],
                                ...options
                            };

                            this.setState({
                                commands: {
                                    ...this.state.commands,
                                    records: records
                                }
                            });
                        }
                    })
                    .catch((res) => {
                        const fallbackMsg = i18n._('An unexpected error has occurred.');
                        const msg = {
                            // TODO
                        }[res.status] || fallbackMsg;

                        actions.updateModalParams({ alertMessage: msg });
                    });
            },
            deleteRecord: (id) => {
                const actions = this.actions.commands;

                api.commands.delete(id)
                    .then((res) => {
                        actions.fetchRecords();
                    })
                    .catch((res) => {
                        // Ignore error
                    });
            },
            openModal: (name = '', params = {}) => {
                this.setState({
                    commands: {
                        ...this.state.commands,
                        modal: {
                            name: name,
                            params: params
                        }
                    }
                });
            },
            closeModal: () => {
                this.setState({
                    commands: {
                        ...this.state.commands,
                        modal: {
                            name: '',
                            params: {}
                        }
                    }
                });
            },
            updateModalParams: (params = {}) => {
                this.setState({
                    commands: {
                        ...this.state.commands,
                        modal: {
                            ...this.state.commands.modal,
                            params: {
                                ...this.state.commands.modal.params,
                                ...params
                            }
                        }
                    }
                });
            }
        },
        // Events
        events: {
            fetchRecords: (options) => {
                const state = this.state.events;
                const {
                    page = state.pagination.page,
                    pageLength = state.pagination.pageLength
                } = { ...options };

                this.setState({
                    events: {
                        ...this.state.events,
                        api: {
                            ...this.state.events.api,
                            err: false,
                            fetching: true
                        }
                    }
                });

                api.events.fetch({ paging: true, page, pageLength })
                    .then((res) => {
                        const { pagination, records } = res.body;

                        this.setState({
                            events: {
                                ...this.state.events,
                                api: {
                                    ...this.state.events.api,
                                    err: false,
                                    fetching: false
                                },
                                pagination: {
                                    page: pagination.page,
                                    pageLength: pagination.pageLength,
                                    totalRecords: pagination.totalRecords
                                },
                                records: records
                            }
                        });
                    })
                    .catch((res) => {
                        this.setState({
                            events: {
                                ...this.state.events,
                                api: {
                                    ...this.state.events.api,
                                    err: true,
                                    fetching: false
                                },
                                records: []
                            }
                        });
                    });
            },
            createRecord: (options) => {
                const actions = this.actions.events;

                api.events.create(options)
                    .then((res) => {
                        actions.closeModal();
                        actions.fetchRecords();
                    })
                    .catch((res) => {
                        const fallbackMsg = i18n._('An unexpected error has occurred.');
                        const msg = {
                            // TODO
                        }[res.status] || fallbackMsg;

                        actions.updateModalParams({ alertMessage: msg });
                    });
            },
            updateRecord: (id, options, forceReload = false) => {
                const actions = this.actions.events;

                api.events.update(id, options)
                    .then((res) => {
                        actions.closeModal();

                        if (forceReload) {
                            actions.fetchRecords();
                            return;
                        }

                        const records = [...this.state.events.records];
                        const index = _findIndex(records, { id: id });

                        if (index >= 0) {
                            records[index] = {
                                ...records[index],
                                ...options
                            };

                            this.setState({
                                events: {
                                    ...this.state.events,
                                    records: records
                                }
                            });
                        }
                    })
                    .catch((res) => {
                        const fallbackMsg = i18n._('An unexpected error has occurred.');
                        const msg = {
                            // TODO
                        }[res.status] || fallbackMsg;

                        actions.updateModalParams({ alertMessage: msg });
                    });
            },
            deleteRecord: (id) => {
                const actions = this.actions.events;

                api.events.delete(id)
                    .then((res) => {
                        actions.fetchRecords();
                    })
                    .catch((res) => {
                        // Ignore error
                    });
            },
            openModal: (name = '', params = {}) => {
                this.setState({
                    events: {
                        ...this.state.events,
                        modal: {
                            name: name,
                            params: params
                        }
                    }
                });
            },
            closeModal: () => {
                this.setState({
                    events: {
                        ...this.state.events,
                        modal: {
                            name: '',
                            params: {}
                        }
                    }
                });
            },
            updateModalParams: (params = {}) => {
                this.setState({
                    events: {
                        ...this.state.events,
                        modal: {
                            ...this.state.events.modal,
                            params: {
                                ...this.state.events.modal.params,
                                ...params
                            }
                        }
                    }
                });
            }
        },
        // About
        about: {
            checkLatestVersion: () => {
                this.setState({
                    about: {
                        ...this.state.about,
                        version: {
                            ...this.state.about.version,
                            checking: true
                        }
                    }
                });

                api.getLatestVersion()
                    .then((res) => {
                        if (!this.mounted) {
                            return;
                        }

                        const { version, time } = res.body;
                        this.setState({
                            about: {
                                ...this.state.about,
                                version: {
                                    ...this.state.about.version,
                                    checking: false,
                                    latest: version,
                                    lastUpdate: time
                                }
                            }
                        });
                    })
                    .catch(res => {
                        // Ignore error
                    });
            }
        },
        wcs: this.createActions('wcs', false, false),
        tools: this.createActions('tools'),
        pockets: this.createActions('pockets'),
        posts: {
            fetchRecords: (options) => {
                //const state = this.state.posts;

                this.setState({
                    posts: {
                        ...this.state.posts,
                        api: {
                            ...this.state.posts.api,
                            err: false,
                            fetching: true
                        },
                        alertMessage: null
                    }
                });

                api.posts.fetch()
                    .then((res) => {
                        const records = res.body;

                        this.setState({
                            posts: {
                                ...this.state.posts,
                                api: {
                                    ...this.state.posts.api,
                                    err: false,
                                    fetching: false
                                },
                                records: records
                            }
                        });
                    })
                    .catch((res) => {
                        console.log(res);
                        this.setState({
                            posts: {
                                ...this.state.posts,
                                api: {
                                    ...this.state.posts.api,
                                    err: true,
                                    fetching: false
                                },
                                records: []
                            }
                        });
                    });
            },
            install: (options) => {
                api.posts.install(options)
                    .then((res) => {
                        const records = res.body;

                        this.setState({
                            posts: {
                                ...this.state.posts,
                                api: {
                                    ...this.state.posts.api,
                                    err: false,
                                    fetching: false
                                },
                                records: records
                            }
                        });
                    })
                    .catch((res) => {
                        this.setState({
                            posts: {
                                ...this.state.posts,
                                api: {
                                    ...this.state.posts.api,
                                    err: true,
                                    fetching: false
                                },
                                records: []
                            }
                        });
                    });
            }
        }
    };

    controllerEvents = {
        'serialport:open': (options) => {
            const { port } = options;
            this.setState({ port: port });
        },
        'serialport:close': () => {
            this.setState({ port: null });
        },
        'controller:settings': (_controllerType, controllerSettings) => {
            this.setState({ controllerSettings });
        }
    };

    handleTabClick = (_event, key) => {
        this.setState({ activeSection: key });
    }

    componentDidMount() {
        this.mounted = true;

        this.addControllerEvents();

        this.state.port = controller.port === '' ? null : controller.port;
    }

    componentWillUnmount() {
        this.mounted = false;

        this.removeControllerEvents();
    }

    addControllerEvents() {
        Object.keys(this.controllerEvents).forEach(eventName => {
            const callback = this.controllerEvents[eventName];
            controller.addListener(eventName, callback);
        });
    }

    removeControllerEvents() {
        Object.keys(this.controllerEvents).forEach(eventName => {
            const callback = this.controllerEvents[eventName];
            controller.removeListener(eventName, callback);
        });
    }

    getInitialState() {
        return {
            show: true,
            port: null,
            activeSection: this.props.section ?? this.sections[0].id,

            controllerSettings: controller.settings,

            // General
            general: {
                api: {
                    err: false,
                    loading: true, // defaults to true
                    saving: false
                },
                checkForUpdates: true,
                lang: i18next.language
            },
            // Workspace
            workspace: {
                modal: {
                    name: '',
                    params: {
                    }
                }
            },
            // Machine Profiles
            machineProfiles: {
                api: {
                    err: false,
                    fetching: false
                },
                pagination: {
                    page: 1,
                    pageLength: 10,
                    totalRecords: 0
                },
                records: [],
                modal: {
                    name: '',
                    params: {
                    }
                }
            },
            // User Accounts
            userAccounts: {
                api: {
                    err: false,
                    fetching: false
                },
                pagination: {
                    page: 1,
                    pageLength: 10,
                    totalRecords: 0
                },
                records: [],
                modal: {
                    name: '',
                    params: {
                        alertMessage: '',
                        changePassword: false
                    }
                }
            },
            // Controller
            controller: {
                api: {
                    err: false,
                    loading: true, // defaults to true
                    saving: false
                },
                ignoreErrors: false
            },
            // Work Coordinate Systems
            wcs: {
                name: 'Coordinate Systems',
                recordName: 'Coordinate System',
                api: {
                    err: false,
                    fetching: false
                },
                pagination: {
                    page: 1,
                    pageLength: 10,
                    totalRecords: 0
                },
                sorting: {
                    sortColumn: 'index',
                    sortOrder: 'asc'
                },
                records: [],
                modal: {
                    name: '',
                    params: {
                    }
                }
            },
            // Tools
            tools: {
                name: 'Tools',
                recordName: 'Tool',
                api: {
                    err: false,
                    fetching: false
                },
                pagination: {
                    page: 1,
                    pageLength: 10,
                    totalRecords: 0
                },
                sorting: {
                    sortColumn: 'index',
                    sortOrder: 'asc'
                },
                records: [],
                modal: {
                    name: '',
                    params: {
                    }
                }
            },
            posts: {
                name: 'Posts',
                api: {
                    err: false,
                    fetching: false
                },
                records: []
            },
            // Commands
            commands: {
                api: {
                    err: false,
                    fetching: false
                },
                pagination: {
                    page: 1,
                    pageLength: 10,
                    totalRecords: 0
                },
                records: [],
                modal: {
                    name: '',
                    params: {
                    }
                }
            },
            // Events
            events: {
                api: {
                    err: false,
                    fetching: false
                },
                pagination: {
                    page: 1,
                    pageLength: 10,
                    totalRecords: 0
                },
                records: [],
                modal: {
                    name: '',
                    params: {
                    }
                }
            },
            // About
            about: {
                version: {
                    checking: false,
                    current: settings.version,
                    latest: settings.version,
                    lastUpdate: ''
                }
            },
            // Pockets
            pockets: {
                name: 'Pockets',
                recordName: 'Pocket',
                api: {
                    err: false,
                    fetching: false
                },
                pagination: {
                    page: 1,
                    pageLength: 10,
                    totalRecords: 0
                },
                sorting: {
                    sortColumn: 'index',
                    sortOrder: 'asc'
                },
                records: [],
                modal: {
                    name: '',
                    params: {
                    }
                }
            }
        };
    }

    render() {
        const { show, activeSection } = this.state;
        const state = { ...this.state };

        const actions = {
            ...this.actions
        };

        const sectionItems = this.sections.filter((section) => section.available(state.controllerSettings)).map((section, index) => (
            <NavItem
                key={section.id}
                eventKey={section.id}
                onClick={(event) => this.handleTabClick(event, section.id)}
            >
                {section.title}
            </NavItem>
        ));

        const renderSection = (section, id) => {
            const Section = section.component;
            const sectionInitialState = this.initialState[section.id];
            const sectionState = state[section.id];
            const sectionStateChanged = !_isEqual(sectionInitialState, sectionState);
            const sectionActions = actions[section.id];

            return (
                <Section
                    initialState={sectionInitialState}
                    state={sectionState}
                    stateChanged={sectionStateChanged}
                    actions={sectionActions}
                    port={this.state.port}
                />
            );
        };

        const getSection = (id) => {
            return this.sections.find(section => section.id === id);
        };

        const section = renderSection(getSection(activeSection), activeSection);

        return (
            <Modal
                size="lg"
                style={{
                    width: '1000px'
                }}
                onClose={this.handleClose}
                show={show}
                showCloseButton={false}
            >
                <Modal.Header>
                    <Modal.Title>{i18n._('Settings')}</Modal.Title>
                    <Nav
                        bsStyle="pills"
                        size="sm"
                        activeKey={activeSection}
                        style={{ marginRight: '50px', float: 'right' }}
                    >
                        {sectionItems}
                    </Nav>
                </Modal.Header>
                <Modal.Body padding={false}>
                    {section}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        onClick={this.handleClose}
                    >
                        {i18n._('OK')}
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default Settings;
