const path = require("path");
var WebpackObfuscator = require("webpack-obfuscator");


module.exports = (env) => {
    process.env = {
        ...(process.env || {}),
        COMPARE_MIN_MAX_PRICES: true,
        DUPLICATED_TO_SBC: true,
        FILL_SBC_FROM_FUTBIN: true,
        GRID_MODE: true,
        WIDE_MODE: true,
        IMPROVED_PLAYER_SEARCH: true,
        MARK_DUPLICATED: true,
        MARKET_SEARCH_FILTERS: true,
        PLAYER_ACTIONS: true,
        SBC_SELECT_MULTIPLE_PLAYERS: true,
        SETTINGS_MENU: true,
        SNIPE: true,
        SELECT_CHEAPEST: true,
        TRANSFER_TARGETS_LIMBO: true,
        UNASSIGNED_LIMBO: true,
        FILTER_SBCS: true,
        SBC_TIMES_COMPLETED: true,
        CLUB_ANALYZER: true,
        SHOW_CONSOLE_OUTPUT: true,
        COUNT_MY_PACKS: true,
        GROUP_MY_PACKS: true,
        TRANSFER_LIST_SEND_ALL_TO_CLUB: true,
        SBC_BUILDER_ENHACER: true,
        SBC_SMART_BUILDER: false,
        CLUB_SEARCH_ENHACER: false,
        KEEP_PLAYER_SELL_VALUES: true,
        DISABLE_PACK_ANIMATIONS: true,
        XML_HTTP_REQUESTS: true,
        SELL_MULTIPLE: true,
        FX: false,
        ...env
    };

    return [
        {
            mode: "development",
            entry: "./src/index.js",
            output: {
                path: path.resolve(__dirname, "dist"),
                filename: "paletools.js"
            },
            module: {
                rules: [
                    {
                        test: /\.css$/i,
                        use: ["raw-loader"]
                    },
                    {
                        test: /\.js$/i,
                        exclude: [/node_modules/],
                        use: [path.resolve("webpack/loaders/conditional.js")]
                    }
                ]
            }
        },
        {
            mode: "production",
            entry: "./src/index.js",
            output: {
                path: path.resolve(__dirname, "dist"),
                filename: "paletools.prod.js"
            },
            plugins: [
                new WebpackObfuscator({ rotateStringArray: true, reservedStrings: ["\s*"] }, [])
            ],
            module: {
                rules: [
                    {
                        test: /\.css$/i,
                        use: ["raw-loader"]
                    },
                    {
                        test: /\.js$/i,
                        exclude: [/node_modules/],
                        use: [path.resolve("webpack/loaders/conditional.js")]
                    }
                ]
            }
        }
    ];
};