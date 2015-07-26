var app = angular.module("testProject", ['angular-tablist']);


app.factory("TasksService", function () {
    return [
        {"title": "Do the shopping", "dueDate": 1437868800000, finished: false, "children": [
            {"title": "Book flight to London", "dueDate": 1437868800000, finished: false, "children": []},
            {"title": "Make a list of things to buy", "dueDate": 1437868800000, finished: false, "children": []},
            {"title": "Book a return flight from London", "dueDate": 1437868800000, finished: true, "children": []}
        ]},
        {"title": "Write an article about Java date/time library", "dueDate": 1437868800000, finished: false, "children": [
            {"title": "Create an example project with Instant", "dueDate": 1437868800000, finished: false, "children": []},
            {"title": "Write a draft of the article", "dueDate": 1437868800000, finished: false, "children": []},
            {"title": "Create short blog post", "dueDate": 1437868800000, finished: false, "children": []}
        ]},
        {"title": "Prepare for a bicycle trip", "dueDate": 1437868800000, finished: false, "children": [
            {"title": "Repair the break in bike", "dueDate": 1437868800000, finished: false, "children": [
                {"title": "Buy new pair of bicycle break", "dueDate": 1437868800000, finished: false, "children": []},
                {"title": "Find out how to replace the breaks", "dueDate": 1437868800000, finished: false, "children": []}
            ]},
            {"title": "Find the best route for the trip", "dueDate": 1437868800000, finished: false, "children": []},
            {"title": "Create a list of required items", "dueDate": 1437868800000, finished: false, "children": []}
        ]}
    ];
});

function ExampleCtrl($scope, TasksService, $log) {
    $scope.tasks = TasksService;

    $scope.taskFinished = function(task) {
        task.finished = true;
    };

    $scope.delete = function(task) {
        findItemRecursivelyAndRemoveIt(task, $scope.tasks);
    };

    $scope.createSubtask = function(parentTask) {
        parentTask.children.push({"title": "[Double click to add title]", "dueDate": new Date(), finished: false, "children": []})
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

    $scope.draggedTask = null;
    $scope.draggedTaskIndex = null;
    $scope.draggedTaskPosition = null;
    $scope.setDraggedTask = function(task) {
        $scope.draggedTask = task;
        $scope.draggedTaskPosition = findTaskPosition(task, $scope.tasks);
        if ($scope.draggedTaskPosition == -1) {
            throw "Dragged task's position not found" + task;
        }
    };

    var findTaskPosition = function(task, tasksArray) {
        for (var i in tasksArray) {
            if (tasksArray[i] == task) {
                return [i];
            }
            var inResult = findTaskPosition(task, tasksArray[i].children);
            if (inResult != -1) {
                inResult.push(i);
                return inResult;
            }
        }
        return -1;
    };

    var removeTaskOnPosition = function(draggedTaskPosition, tasksArray) {
        if (draggedTaskPosition.length == 1) {
            tasksArray.splice($scope.draggedTaskPosition.pop(), 1);
            $log.debug("Removing from old position finished");
            return;
        }
        var positionOnThisLevel = draggedTaskPosition.pop();
        removeTaskOnPosition(draggedTaskPosition, tasksArray[positionOnThisLevel].children);
    };

    $scope.removeDraggedTaskFromPreviousPosition = function() {
        removeTaskOnPosition($scope.draggedTaskPosition, $scope.tasks);
    };

    $scope.moveSubtaskToTask = function(movedTask, newParentTask) {
        $log.debug("Task '" + movedTask.title + "' moved to new parent task '" + newParentTask.title + "'");
        newParentTask.children.push($scope.draggedTask);
        $scope.removeDraggedTaskFromPreviousPosition();
        $scope.$apply();
    };

    $scope.moveSubtaskTopLevel = function(movedTask) {
        $log.debug("Task '" + movedTask.title + "' moved to top level");
        $scope.tasks.push($scope.draggedTask);
        $scope.removeDraggedTaskFromPreviousPosition();
        $scope.$apply();
    };

}

app.directive('draggable', function () {
    return {
        link: function (scope, element, attrs) {
            element.draggable({
                revert: "invalid",
                start: function(event, ui) {
                    scope.setDraggedTask(scope.$eval(attrs.draggable));
                    element.css("z-index", 1000);
                },
                stop: function(event, ui) {
                    element.css("z-index", 0);
                }
            });
        }
    }
});

app.directive('droppable', function () {
    return {
        link: function (scope, element, attrs) {
            var droppableValues = scope.$eval(attrs.droppable);
            element.droppable({
                accept: function(draggable) {
                    return draggable.hasClass("row")
                        &&
                        ((droppableValues.targetCollection == null && draggable.parents('.subtasks').length != 0)
                            ||
                            (droppableValues.targetCollection != null
                            && droppableValues.targetCollection.indexOf(scope.draggedTask) < 0
                            && draggable != element)
                        );
                },
                hoverClass: "drop-hover",
                greedy: true,
                drop: function(event,ui) {
                    droppableValues.onDrop(scope.draggedTask, droppableValues.target);
                }
            });
        }
    }
});


app.directive("quickEdit", function() {
    return {
        restrict: 'A',
        require: "?ngModel",
        link: function(scope, element, attrs, ngModel) {
            var internalElement = element.find(".cell-content");
            ngModel.$render = function() {
                internalElement.text(ngModel.$viewValue || '');
            };

            internalElement.dblclick(function() {
                $(this).attr("contentEditable", "true");
                $(this).focus();

            });

            internalElement.bind('keydown', function(event) {
                var keycode = (event.keyCode ? event.keyCode : event.which);
                if (keycode === 13) { // ENTER
                    $(this).attr("contentEditable", "false");
                    $(this).blur();
                    event.preventDefault();
                    scope.$apply(read);
                }
                if (keycode === 27) { // ESCAPE
                    internalElement.text(ngModel.$viewValue);
                    $(this).attr("contentEditable", "false");
                    $(this).blur();
                }
            });

            function read() {
                var text = internalElement.text();
                ngModel.$setViewValue(text);
            }
        }
    };
});