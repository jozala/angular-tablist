var app = angular.module("tablistExample", ['angular-tablist']);


app.factory("TableService", function () {
    return [
        {"id": "1", "name": "Main Cell", "after": "sup-after-1", "children": []},
        {"id": "2", "name": "Second Cell", "after": "sup-after-2", "children": [
            {"id": "2.1", "name": "Second-one", "after": "sub-after-3", "children": [
                {"id": "2.1.1", "name": "Second one-one", "after": "sup-after-4", "children": []}
            ]},
            {"id": "2.2", "name": "Second-two", "after": "sup-after-5", "children": []}
        ]},
        {"id": "3", "name": "Third Cell", "after": "sup-after-6", "children": [
            {"id": "3.1", "name": "Third one", "after": "sub-after-7", "children": [
                {"id": "3.1.1", "name": "Third one-one", "after": "sup-after-8", "children": []}
            ]}
        ]}
    ];
});

function TabListCtrl($scope, TableService) {
    $scope.table = TableService;
    $scope.startId = 4;

    $scope.addElement = function() {
        var element = {"id": $scope.startId++, "name": "Main Cell", "after": "sup-after", "children": []};
        $scope.table.push(element);
    };

    $scope.addChildRow = function(parentRow) {
        var id = parentRow.id.toString() + '.' + (parentRow.children.length + 1).toString();
        var name = Math.random().toString(36).substring(7);
        parentRow.children.push({"id": id, "name": name, "after": "added element", "children": []})
    }
}