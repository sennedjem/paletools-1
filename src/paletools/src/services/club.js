import { triggerEvent } from "../events";
import delay from "../utils/delay";
import promiseState from "../utils/promiseState";
import { randomInt } from "../utils/random";
import http from "./http";
import sendPinEvents from "./pinEvents";

const MAX_ITEMS_REQUEST = 150;

export function getClubPlayersCount() {
    return new Promise(resolve => {
        http("club/stats/club").then(stats => {
            resolve(stats.stat.find(x => x.type == "players").typeValue);
        });
    });
}

export function getClubPlayers(playerIds) {
    return new Promise(resolve => {
        const players = [];
        const promises = [];
        for (const playerId of playerIds) {
            promises.push(getAllClubPlayers(true, playerId));
        }

        Promise.all(promises).then(results => {
            for (const result of results) {
                players.push(result[0]);
            }

            resolve(players);
        });
    });
}

let getAllClubPlayersExecutingPromise = null;

export function getAllClubPlayers(filterLoaned, playerId, onBatchLoadedCallback) {
    return new Promise(resolve => {
        if (getAllClubPlayersExecutingPromise) {
            promiseState(getAllClubPlayersExecutingPromise, state => {
                if (state !== "pending") {
                    getAllClubPlayersExecutingPromise = internalGetAllClubPlayers(filterLoaned, playerId, onBatchLoadedCallback);
                }

                getAllClubPlayersExecutingPromise.then(resolve);
            });
        }
        else {
            getAllClubPlayersExecutingPromise = internalGetAllClubPlayers(filterLoaned, playerId, onBatchLoadedCallback);
            getAllClubPlayersExecutingPromise.then(resolve);
        }
    });
};

export function quickRefreshClub() {
    return new Promise((resolve, reject) => {
        const searchCriteria = new UTItemSearchViewModel().searchCriteria;
        searchCriteria.count = MAX_ITEMS_REQUEST;
        searchCriteria.defId = [randomInt(1000, 10000)];
        const search = () => {
            services.Item.searchClub(searchCriteria).observe(
                this,
                async function (sender, response) {
                    resolve();
                }
            );
        };
        search();
    });
}

function internalGetAllClubPlayers(filterLoaned, playerId, onBatchLoadedCallback) {
    return new Promise((resolve, reject) => {
        const searchCriteria = new UTItemSearchViewModel().searchCriteria;
        if (playerId) {
            searchCriteria.defId = [parseInt(playerId)];
        }
        searchCriteria.count = MAX_ITEMS_REQUEST;
        let gatheredSquad = [];

        const getAllSquadMembers = () => {
            services.Item.searchClub(searchCriteria).observe(
                this,
                async function (sender, response) {
                    gatheredSquad = [
                        ...response.data.items.filter(
                            (item) => !filterLoaned || item.loans < 0
                        ),
                    ];
                    if (response.status !== 400 && !response.data.retrievedAll) {
                        searchCriteria.offset += searchCriteria.count;
                        if (onBatchLoadedCallback) {
                            (onBatchLoadedCallback)(searchCriteria.offset);
                        }
                        delay(100 + (Math.random() * 100)).then(() => getAllSquadMembers());
                    } else {
                        if (onBatchLoadedCallback) {
                            (onBatchLoadedCallback)(searchCriteria.offset, gatheredSquad);
                        }
                        resolve(gatheredSquad);
                    }
                }
            );
        };
        getAllSquadMembers();
    });
}

export function getUnnasignedPlayers() {
    //return http('purchased/items');
    sendPinEvents("Unassigned Items - List View");
    return new Promise((resolve) => {
        services.Item.requestUnassignedItems().observe(this, (sender, response) => {
            resolve(response.data.items);
        });
    });

}
