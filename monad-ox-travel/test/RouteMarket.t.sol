// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {TravelNFT} from "../src/TravelNFT.sol";
import {RouteMarket} from "../src/RouteMarket.sol";

contract RouteMarketTest is Test {
    TravelNFT private nft;
    RouteMarket private market;
    address private user = makeAddr("traveler");

    receive() external payable {}

    function setUp() public {
        nft = new TravelNFT();
        market = new RouteMarket(address(nft));
        nft.setMinter(address(market));
        market.createRoute("L1", "culture", TravelNFT.TravelLevel.Level1, 0.001 ether, "");
        market.createRoute("L2", "nature", TravelNFT.TravelLevel.Level2, 0.005 ether, "");
        vm.deal(user, 1 ether);
    }

    function testUnlockRefundAndCompleteLevelOne() public {
        uint256 beforeBalance = user.balance;
        vm.startPrank(user);
        market.unlockRoute{value: 0.002 ether}(0);
        market.completeRoute(0);
        vm.stopPrank();

        assertEq(user.balance, beforeBalance - 0.001 ether);
        assertTrue(nft.hasCompletedLevel(user, TravelNFT.TravelLevel.Level1));
        assertEq(market.points(user), 100);
    }

    function testLevelTwoRequiresLevelOne() public {
        vm.expectRevert(RouteMarket.PreviousLevelRequired.selector);
        vm.prank(user);
        market.unlockRoute{value: 0.005 ether}(1);
    }
}

