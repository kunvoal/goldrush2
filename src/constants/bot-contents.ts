type TTabsTitle = {
    [key: string]: string | number;
};

type TDashboardTabIndex = {
    [key: string]: number;
};

export const tabs_title: TTabsTitle = Object.freeze({
    WORKSPACE: 'Workspace',
    CHART: 'Chart',
});

export const DBOT_TABS: TDashboardTabIndex = Object.freeze({
    CUSTOM_BOTS: 0,
    BOT_BUILDER: 1,
    CHART: 2,
});

export const MAX_STRATEGIES = 10;

export const TAB_IDS = ['id-custom-bots', 'id-bot-builder', 'id-charts'];

export const DEBOUNCE_INTERVAL_TIME = 500;
