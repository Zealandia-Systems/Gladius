import constants from 'namespace-constants';

export const {
    MODAL_WATCH_DIRECTORY,
    NOTIFICATION_ECHO,
    NOTIFICATION_PROGRAM_ERROR,
    NOTIFICATION_M0_PROGRAM_PAUSE,
    NOTIFICATION_M1_PROGRAM_PAUSE,
    NOTIFICATION_M2_PROGRAM_END,
    NOTIFICATION_M30_PROGRAM_END,
    NOTIFICATION_M6_TOOL_CHANGE,
    NOTIFICATION_M109_SET_EXTRUDER_TEMPERATURE,
    NOTIFICATION_M190_SET_HEATED_BED_TEMPERATURE
} = constants('widgets/Visualizer', [
    'MODAL_WATCH_DIRECTORY',
    'NOTIFICATION_PROGRAM_ERROR',
    'NOTIFICATION_M0_PROGRAM_PAUSE',
    'NOTIFICATION_M1_PROGRAM_PAUSE',
    'NOTIFICATION_M2_PROGRAM_END',
    'NOTIFICATION_M30_PROGRAM_END',
    'NOTIFICATION_M6_TOOL_CHANGE',
    'NOTIFICATION_M109_SET_EXTRUDER_TEMPERATURE',
    'NOTIFICATION_M190_SET_HEATED_BED_TEMPERATURE'
]);

export const CAMERA_MODE_PAN = 'pan';
export const CAMERA_MODE_ROTATE = 'rotate';
