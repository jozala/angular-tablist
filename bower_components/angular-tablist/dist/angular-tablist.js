var app = angular.module("angular-tablist", []);

app.directive("tablist", function () {
    return {
        restrict: "E",
        replace: true,
        transclude: true,
        template: "<ol class='tabular-list' ng-transclude></ol>",
        controller: function($scope, $element, $attrs) {
            this.getIndent = function() {
                var indent = $attrs.indent;
                if (this.getLevel() > 0) {
                    indent = getIndentFromParent();
                }
                return indent;
            };
            this.getLevel = function() {
                return $element.parents('ol').length;
            };
            this.isExpandedAtInit = function() {
                var expanded = $attrs.expanded === "true";
                if (this.getLevel() > 0) {
                    expanded = getExpandedFromParent();
                }
                return expanded;
            };
            var getIndentFromParent = function() {
                return $element.parents('ol').last().attr("indent");
            };
            var getExpandedFromParent = function() {
                return $element.parents('ol').last().attr('expanded') === "true";
            };
        }
        
    };
});

app.directive("row", function () {
    return {
        restrict: "E",
        replace: true,
        require: ["^tablist", "row"],
        scope: {},
        template: "<li class='row'></li>",
        controller: function ($scope, $element) {
            this.setExpandedInit = function (isExpanded) {
                this.expanded = isExpanded;
                if (!isExpanded) {
                    this.collapse();
                }
            };
            this.hasChildren = function () {
                return $element.find("li").length > 0;
            };
            this.expand = function () {
                this.expanded = true;
                $element.find("ol").first().show();
            };
            this.collapse = function () {
                this.expanded = false;
                $element.find("ol").first().hide();
            };
            this.toggleExpand = function () {
                if (this.expanded === true) {
                    this.collapse();
                } else {
                    this.expand();
                }
            };
            this.isExpanded = function () {
                return this.expanded;
            };
            this.getIndent = function () {
                return $scope.tablistCtrl.getIndent();
            };
            this.getLevel = function () {
                return $element.parents('ol').length - 1;
            };
        },
        compile: function() {
            return  {
                pre: function($scope, $element, $attr, $controllers) {
                    $scope.tablistCtrl = $controllers[0];
                },
                post: function($scope, $element, $attr, $controllers) {
                    var tablistCtrl = $controllers[0];
                    var rowCtrl = $controllers[1];

                    rowCtrl.setExpandedInit(tablistCtrl.isExpandedAtInit());
                }
            };
        }
    };
});

app.directive("cell", function () {
    return {
        restrict: "E",
        require: "^row",
        replace: true,
        scope: true,
        transclude: true,
        template: "<span class='cell'><expander ng-if='isMainColumn() && rowCtrl.hasChildren()' /><span class='cell-content' ng-transclude></span></span>",
        controller: function($scope, $element) {
            $scope.isMainColumn = function() {
                return $element.hasClass("main-column");
            };
            $scope.expand = function() {
                $scope.rowCtrl.expand();
            }
        },
        link: function(scope, element, attrs, rowCtrl) {
            scope.rowCtrl = rowCtrl;
        }
    };
});

app.directive('mainColumn', function () {
    return {
        restrict: "C",
        require: "^row",
        link: function(scope, element, attrs, rowCtrl) {
            var indent = rowCtrl.getIndent();
            var level = rowCtrl.getLevel();

            if (level >= 1) {
                var levelIndentation = (indent * level) + "px";
                element.css("padding-left", "+=" + levelIndentation);
                element.css('width', "-=" + levelIndentation);
            }
        }
    }
});

app.directive("expander", function () {
    return {
        restrict: "E",
        replace: true,
        require: "^row",
        template: "<span ng-click='toggleExpand()' class='tablist-expander' ng-class='{expanded: rowCtrl.isExpanded(), collapsed: !rowCtrl.isExpanded()}'></span>",
        controller: function ($scope) {
            $scope.toggleExpand = function () {
                $scope.rowCtrl.toggleExpand();
            };
        },
        link: function (scope, element, attrs, rowCtrl) {
            scope.rowCtrl = rowCtrl;
        }
    };
});
