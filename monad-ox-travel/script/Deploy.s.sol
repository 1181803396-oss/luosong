// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {TravelNFT} from "../src/TravelNFT.sol";
import {RouteMarket} from "../src/RouteMarket.sol";

contract Deploy is Script {
    function run() external returns (TravelNFT travelNFT, RouteMarket routeMarket) {
        vm.startBroadcast();

        travelNFT = new TravelNFT();
        routeMarket = new RouteMarket(address(travelNFT));
        travelNFT.setMinter(address(routeMarket));

        routeMarket.createRoute(
            unicode"古城漫步·非遗体验",
            unicode"人文",
            TravelNFT.TravelLevel.Level1,
            0.001 ether,
            ""
        );
        routeMarket.createRoute(
            unicode"城市后山·轻徒步",
            unicode"风景",
            TravelNFT.TravelLevel.Level1,
            0.001 ether,
            ""
        );
        routeMarket.createRoute(
            unicode"周末古镇·深度人文",
            unicode"人文",
            TravelNFT.TravelLevel.Level2,
            0.005 ether,
            ""
        );
        routeMarket.createRoute(
            unicode"周末秘境·原始森林",
            unicode"风景",
            TravelNFT.TravelLevel.Level2,
            0.005 ether,
            ""
        );
        routeMarket.createRoute(
            unicode"长假丝路·文化溯源",
            unicode"人文",
            TravelNFT.TravelLevel.Level3,
            0.01 ether,
            ""
        );
        routeMarket.createRoute(
            unicode"长假雪山·徒步朝圣",
            unicode"风景",
            TravelNFT.TravelLevel.Level3,
            0.01 ether,
            ""
        );

        vm.stopBroadcast();

        console2.log("TravelNFT:", address(travelNFT));
        console2.log("RouteMarket:", address(routeMarket));
    }
}

