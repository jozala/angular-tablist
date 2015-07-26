var app = angular.module("testProject", ['angular-tablist']);


app.factory("ItemsService", function () {
    return [
        {"number": "1", "name": "Movies", "lastModified": 1437868800000, "children": [
            {"number": "6", "name": "Gattaca (1997)", "lastModified": 1437868800000, "children": []},
            {"number": "7", "name": "Jasminum (2006)", "lastModified": 1426032000000, "children": []},
            {"number": "8", "name": "Primal Fear (1996)", "lastModified": 1413158400000, "children": []}
        ]},
        {"number": "2", "name": "TV Shows", "lastModified": 1430006400000, "children": [
            {"number": "9", "name": "The Sopranos", "lastModified": 1437868800000, "children": []},
            {"number": "10", "name": "IT Crowd", "lastModified": 1430006400000, "children": []}
        ]},
        {"number": "3", "name": "Music", "lastModified": 1429488000000, "children": [
            {"number": "11", "name": "Adele", "lastModified": 1437868800000, "children": [
                {"number": "15", "name": "19", "lastModified": 1437868800000, "children": []},
                {"number": "16", "name": "21", "lastModified": 1437868800000, "children": []}
            ]},
            {"number": "12", "name": "Michael Buble", "lastModified": 1437868800000, "children": [
                {"number": "17", "name": "Caught in the act", "lastModified": 1437868800000, "children": []}
            ]},
            {"number": "13", "name": "Michael Jackson", "lastModified": 1437868800000, "children": [
                {"number": "18", "name": "Earth", "lastModified": 1437868800000, "children": []},
                {"number": "19", "name": "Thriller", "lastModified": 1437868800000, "children": []}
            ]},
            {"number": "14", "name": "Eva Cassidy", "lastModified": 1437868800000, "children": [
                {"number": "20", "name": "Song Bird", "lastModified": 1437868800000, "children": []}
            ]}
        ]},
        {"number": "4", "name": "Photos", "lastModified": 1429574400000, "children": [
            {"number": "21", "name": "Paris.jpg", "lastModified": 1437868800000, "children": []},
            {"number": "22", "name": "Stockholm.jpg", "lastModified": 1437868800000, "children": []},
            {"number": "23", "name": "Wroclaw.jpg", "lastModified": 1437868800000, "children": []},
            {"number": "24", "name": "London.jpg", "lastModified": 1437868800000, "children": []},
            {"number": "25", "name": "Malaga.jpg", "lastModified": 1437868800000, "children": []}
        ]}

    ];
});

function ExampleCtrl($scope, ItemsService) {
    $scope.items = ItemsService;
    $scope.startNumber = 26;

    $scope.delete = function(item) {
        findItemRecursivelyAndRemoveIt(item, $scope.items);
    };

    $scope.addSubItem = function(parentItem) {
        var name = Math.random().toString(36).substring(7);
        parentItem.children.push({"number": $scope.startNumber++, "name": name, "lastModified": new Date(), "children": []})
    };

    var findItemRecursivelyAndRemoveIt = function(item, itemsArray) {
        for (var i in itemsArray) {
            if (itemsArray[i] == item) {
                itemsArray.splice(i, 1);
                return;
            }
            findItemRecursivelyAndRemoveIt(item, itemsArray[i].children);
        }
    };

}