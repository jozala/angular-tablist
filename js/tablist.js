var app = angular.module("TabList", []);


app.factory("TableService", function () {
    return [
        {"id": "1", "name": "Main Cell", "after": "sup-after", "children": []},
        {"id": "2", "name": "Second Cell", "after": "sup-after", "children": [
            {"id": "2.1", "name": "Second-one", "after": "sub-after", "children": [
                {"id": "2.1.1", "name": "Second one-one", "after": "sup-after", "children": []}
            ]},
            {"id": "2.2", "name": "Second-two", "after": "sup-after", "children": []}
        ]},
        {"id": "3", "name": "Third Cell", "after": "sup-after", "children": [
            {"id": "3.1", "name": "Third one", "after": "sub-after", "children": [
                {"id": "3.1.1", "name": "Third one-one", "after": "sup-after", "children": []}
            ]}
        ]}
    ];
});

function TabListCtrl($scope, TableService) {
    $scope.table = TableService;
    $scope.addElement = function() {
        var element = {"id": "1", "name": "Main Cell", "after": "sup-after", "children": []};
        $scope.table.push(element);
    };
    $scope.template = "<cell>{{ row.id }}</cell><cell>{{ row.name }}</cell><cell>{{ row.after }}</cell>";
};

app.directive("tablist", function () {
    return {
        restrict: "E",
        replace: true,
        transclude: true,
        scope: {
            template: "="
        },
        template: "<ul class='tabular-list' ng-transclude></ul>",
        controller: function($scope, $element, $attrs) {
            this.getMainColumnNumber = function() {
                var mainColumn = $attrs.mainColumn;
                if (this.getLevel() > 0) {
                    mainColumn = getMainColumnFromParent();
                }
                return mainColumn;
            };
            this.getIndent = function() {
                var indent = $attrs.indent;
                if (this.getLevel() > 0) {
                    indent = getIndentFromParent();
                }
                return indent;
            };
            this.getLevel = function() {
                return $element.parents('ul').length;
            };
            this.isExpandedAtInit = function() {
                var expanded = $attrs.expanded === "true";
                if (this.getLevel() > 0) {
                    expanded = getExpandedFromParent();
                }
                return expanded;
            };
            this.getTemplate = function() {
                return $scope.template;
            }

            var getIndentFromParent = function() {
                return $element.parents('ul').last().attr("indent");
            };
            var getMainColumnFromParent = function() {
                return $element.parents('ul').last().attr('main-column');
            };
            var getExpandedFromParent = function() {
                return $element.parents('ul').last().attr('expanded') === "true";
            };
        }
        
    };
});

app.directive("row", function ($compile) {
    return {
        restrict: "E",
        replace: true,
        require: ["^tablist", "row"],
        transclude: true,
        scope: {
            row: "=",
            children: "="
        },
        template: "<li><span ng-transclude></span></li>",
        controller: function ($scope, $element) {
            this.setExpandedInit = function (isExpanded) {
                this.expanded = isExpanded;
                if (this.hasParent() && !isExpanded) {
                    $element.parent("ul").hide();
                }
            };
            this.hasParent = function () {
                return $element.parent("ul").parent().is("li");
            };
            this.hasChildren = function () {
                return $scope.children.length > 0;
            };
            this.expand = function () {
                this.expanded = (!this.expanded);
                if (this.expanded === false) {
                    $element.children("ul").hide();
                } else {
                    $element.children("ul").show();
                }
            };
            this.isExpanded = function () {
                return this.expanded;
            };
            this.getMainColumnNumber = function () {
                return $scope.tablistCtrl.getMainColumnNumber();
            };
            this.getIndent = function () {
                return $scope.tablistCtrl.getIndent();
            };
            this.getLevel = function () {
                var result = $element.parents('ul').length - 1;
                return result;
            };
        },
        compile: function(tElement, tAttrs, linker) {
            return  {
                pre: function($scope, $element, $attr, $controllers) {
                        var tablistCtrl = $controllers[0];
                        var rowCtrl = $controllers[1];
                        $scope.tablistCtrl = tablistCtrl;
                        rowCtrl.setExpandedInit(tablistCtrl.isExpandedAtInit());  

                },
                post: function($scope, $element, $attr, $controllers) {
                    var tablistCtrl = $controllers[0];
                    $scope.template = tablistCtrl.getTemplate();
                    if (angular.isArray($scope.children) && $scope.children.length > 0) {
                        $compile("<tablist main-column='mainColumn' indent='indent' expanded='expanded' template='template'>"+
                                "<row children='row.children' row='row' ng-repeat='row in children'>" +
                                    $scope.template +
                                "</row>" +
                                "</tablist>")($scope, function(cloned) {
                            $element.append(cloned);
                        });
                    }
                }
            }
        }
    };
});

app.directive("cell", function () {
    return {
        restrict: "E",
        require: "^row",
        replace: true,
        transclude: true,
        template: "<span class='cell'><expander /><span ng-transclude></span></span>",
        controller: function($scope, $element) {
            $scope.isMainColumn = function() {
                return $scope.rowCtrl.getMainColumnNumber() == $element.index();
            };
        },
        compile: function(){
            return{
                post: function postLink(scope, iElement, iAttrs, rowCtrl){
                    scope.rowCtrl = rowCtrl;
                    // remove ng-transclude attribute to prevent error thrown when transcluded content is re-compiled
                    angular.element(iElement[0].querySelectorAll('[ng-transclude]')).removeAttr('ng-transclude');

                    var indent = rowCtrl.getIndent();
                    var level = rowCtrl.getLevel();
                    if (scope.isMainColumn() && level >= 1) {
                        var levelIndentation = (indent * level) + "px";
                        iElement.css("padding-left", "+=" + levelIndentation);
                        iElement.css('width', "-=" + levelIndentation);
                    }

                    if (!scope.isMainColumn() || !rowCtrl.hasChildren()) {
                         $(".tablist-expander", iElement).remove();
                }
                }
            };
        }
    };
});

app.directive("expander", function () {
    return {
        restrict: "E",
        replace: true,
        require: "^row",
        template: "<span ng-click='expand()' class='tablist-expander' ng-class='{expanded: rowCtrl.isExpanded(), collapsed: !rowCtrl.isExpanded()}'></span>",
        controller: function ($scope) {
            $scope.expand = function () {
                $scope.rowCtrl.expand();
            };
        },
        link: function (scope, element, attrs, rowCtrl) {
            scope.rowCtrl = rowCtrl;
        }
    };
});