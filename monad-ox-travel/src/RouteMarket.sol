// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {TravelNFT} from "./TravelNFT.sol";

contract RouteMarket is Ownable, ReentrancyGuard {
    struct Route {
        uint256 id;
        string name;
        string category;
        TravelNFT.TravelLevel level;
        uint256 price;
        string contentHash;
        bool isActive;
    }

    TravelNFT public travelNFT;
    mapping(uint256 => Route) public routes;
    mapping(uint256 => mapping(address => bool)) public routeUnlocked;
    mapping(address => uint256) public points;
    uint256 public nextRouteId;
    address public admin;

    event RouteCreated(uint256 id, string name, TravelNFT.TravelLevel level, uint256 price);
    event RouteUnlocked(uint256 id, address user);
    event RouteCompleted(
        uint256 id,
        address user,
        TravelNFT.TravelLevel level,
        uint256 pointsEarned
    );
    event PointsEarned(address user, uint256 amount, string reason);

    error InvalidNFTAddress();
    error InvalidPrice();
    error RouteNotActive();
    error RouteAlreadyUnlocked();
    error RouteNotUnlocked();
    error LevelAlreadyCompleted();
    error PreviousLevelRequired();
    error InsufficientPayment();
    error PaymentTransferFailed();
    error RefundFailed();

    constructor(address _travelNFT) Ownable(msg.sender) {
        if (_travelNFT == address(0)) revert InvalidNFTAddress();
        travelNFT = TravelNFT(_travelNFT);
        admin = msg.sender;
    }

    function createRoute(
        string calldata name,
        string calldata category,
        TravelNFT.TravelLevel level,
        uint256 price,
        string calldata contentHash
    ) external onlyOwner {
        if (price == 0) revert InvalidPrice();
        uint256 routeId = nextRouteId++;
        routes[routeId] = Route({
            id: routeId,
            name: name,
            category: category,
            level: level,
            price: price,
            contentHash: contentHash,
            isActive: true
        });
        emit RouteCreated(routeId, name, level, price);
    }

    function unlockRoute(uint256 routeId) external payable nonReentrant {
        Route storage route = routes[routeId];
        if (!route.isActive) revert RouteNotActive();
        if (routeUnlocked[routeId][msg.sender]) revert RouteAlreadyUnlocked();
        if (route.level != TravelNFT.TravelLevel.Level1) {
            TravelNFT.TravelLevel previousLevel =
                TravelNFT.TravelLevel(uint256(route.level) - 1);
            if (!travelNFT.hasCompletedLevel(msg.sender, previousLevel)) {
                revert PreviousLevelRequired();
            }
        }
        if (msg.value < route.price) revert InsufficientPayment();

        routeUnlocked[routeId][msg.sender] = true;

        (bool paid,) = payable(admin).call{value: route.price}("");
        if (!paid) revert PaymentTransferFailed();
        if (msg.value > route.price) {
            (bool refunded,) = payable(msg.sender).call{value: msg.value - route.price}("");
            if (!refunded) revert RefundFailed();
        }

        emit RouteUnlocked(routeId, msg.sender);
    }

    function completeRoute(uint256 routeId) external nonReentrant {
        Route storage route = routes[routeId];
        if (!route.isActive) revert RouteNotActive();
        if (!routeUnlocked[routeId][msg.sender]) revert RouteNotUnlocked();
        if (travelNFT.hasCompletedLevel(msg.sender, route.level)) {
            revert LevelAlreadyCompleted();
        }

        uint256 earned = (uint256(route.level) + 1) * 100;
        points[msg.sender] += earned;
        travelNFT.mintTravelNFT(msg.sender, route.level);

        emit PointsEarned(msg.sender, earned, unicode"完成旅行路线");
        emit RouteCompleted(routeId, msg.sender, route.level, earned);
    }

    function getRoute(uint256 routeId) external view returns (Route memory) {
        return routes[routeId];
    }

    function getRouteCount() external view returns (uint256) {
        return nextRouteId;
    }

    function getUserUnlockedRoutes(address user) external view returns (uint256[] memory) {
        uint256 unlockedCount;
        for (uint256 i; i < nextRouteId; ++i) {
            if (routeUnlocked[i][user]) ++unlockedCount;
        }

        uint256[] memory result = new uint256[](unlockedCount);
        uint256 cursor;
        for (uint256 i; i < nextRouteId; ++i) {
            if (routeUnlocked[i][user]) result[cursor++] = i;
        }
        return result;
    }

    function getRoutesByLevel(TravelNFT.TravelLevel level)
        external
        view
        returns (Route[] memory)
    {
        uint256 routeCount;
        for (uint256 i; i < nextRouteId; ++i) {
            if (routes[i].isActive && routes[i].level == level) ++routeCount;
        }

        Route[] memory result = new Route[](routeCount);
        uint256 cursor;
        for (uint256 i; i < nextRouteId; ++i) {
            if (routes[i].isActive && routes[i].level == level) {
                result[cursor++] = routes[i];
            }
        }
        return result;
    }
}

