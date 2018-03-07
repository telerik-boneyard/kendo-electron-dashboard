function onTeamEfficiency() {
    var employeeAndTeamSales = [];
    var employeeAverageSales = [];
    var employeeQuarterSales = [];

    $.when(
        $.getJSON("./Content/employee-and-team-sales.json", function (data) {
            employeeAndTeamSales = data;
        }
        ),
        $.getJSON("./Content/employee-average-sales.json", function (data) {
            employeeAverageSales = data;
        }
        ),
        $.getJSON("./Content/employee-quarter-sales.json", function (data) {
            employeeQuarterSales = data;
        }
        )).then(function () {
            initWidgets();
        })



    $("[data-toggle=offcanvas]").click(function () {
        $(".row-offcanvas").toggleClass("active");
    });

    function initWidgets() {
        $("#StartDate").kendoDatePicker({
            value: new Date(1996, 0, 1),
            change: onCriteriaChange
        })

        $("#EndDate").kendoDatePicker({
            value: new Date(1998, 7, 1),
            change: onCriteriaChange
        })

        $("#employees-list").kendoListView({
            template: $('#employeeItemTemplate').html(),
            dataSource: {
                transport: {
                    read: {
                        dataType: "json",
                        url: './Content/employees-list.json',
                    }
                },
                pageSize: 9
            },
            selectable: "single",
            dataBound: onListDataBound,
            change: onCriteriaChange
        })

        $("#employee-quarter-sales").kendoChart({
            theme: "metro",
            autoBind: false,
            tooltip: false,
            dataBound: onQuarterSalesDataBound,
            dataSource: {
                transport: {
                    read: function (options) {
                        var result = $.grep(employeeQuarterSales, function (e) {
                            return e.EmployeeID == options.data.EmployeeID;
                        })[0];
                        options.success(result.Sales)
                    }
                }
            },
            series: [{
                type: "bullet",
                currentField: "Current",
                targetField: "Target"

            }],
            legend: {
                visible: false
            },
            categoryAxis: {
                labels: {
                    visible: false
                },
                majorGridLines: {
                    visible: false
                }
            },
            valueAxis: {
                type: "numeric",
                labels: {
                    visible: false
                },
                majorTicks: {
                    visible: false
                },
                majorGridLines: {
                    visible: false
                }
            }

        })

        $("#employee-average-sales").kendoChart({
            theme: "metro",
            autoBind: false,
            dataBound: onAverageSalesDataBound,
            dataSource: {
                transport: {
                    read: function (options) {
                        var result = $.grep(employeeAverageSales, function (e) {
                            return e.EmployeeID == options.data.EmployeeID;
                        });
                        options.success(result);
                    }
                },
                aggregate: [{
                    field: "EmployeeSales",
                    aggregate: "average"
                }]
            },
            series: [{
                type: "line",
                field: "EmployeeSales",
                width: 1.5,
                markers: {
                    visible: false
                }
            }],
            categoryAxis: {
                type: "date",
                field: "Date",
                visible: false,
                majorGridLines: {
                    visible: false
                },
                majorTicks: {
                    visible: false
                }
            },
            legend: {
                visible: false
            },
            valueAxis: {
                type: "numeric",
                visible: false,
                labels: {
                    visible: false
                },
                majorGridLines: {
                    visible: false
                },
                majorTicks: {
                    visible: false
                }
            }
        });

        $("#team-sales").kendoChart({
            theme: "metro",
            title: {
                text: "REPRESENTATIVE SALES VS. TOTAL SALES",
                align: "left",
                font: "11px sans-serif",
                color: "#35373d"
            },
            autoBind: false,
            dataSource: {
                transport: {
                    read: function (options) {
                        var result;
                        var startDate = options.data.startDate;
                        var endDate = options.data.endDate;
                        var employee = $.grep(employeeAndTeamSales, function (e) {
                            return e.EmployeeID == options.data.EmployeeID;
                        })[0];
                        options.success(employee.Sales);
                    }
                }
            },
            legend: {
                position: "bottom"
            },
            series: [{
                field: "EmployeeSales",
                categoryField: "Date",
                name: "Employee Sales",
                aggregate: "sum"
            }, {
                field: "TotalSales",
                categoryField: "Date",
                name: "Team Sales",
                aggregate: "sum"
            }],
            categoryAxis: {
                type: "date",
                baseUnit: "months",
                majorGridLines: {
                    visible: false
                }
            },
            valueAxis: {
                labels: {
                    format: "{0:c2}",
                    visible: false
                },
                majorUnit: 25000,
                line: {
                    visible: false
                },
                majorGridLines: {
                    visible: false
                }
            },
            tooltip: {
                visible: true,
                format: "{0:c2}"
            }
        })

        $("#employee-sales").kendoScheduler({
            autoBind: false,
            date: new Date("1996, 7, 1"),
            views: ["month"],
            editable: false,
            timezone: "Etc/UTC",
            dataSource: {
                transport: {
                    read: {
                        dataType: "json",
                        url: "./Content/employee-sales.json"
                    }
                },
                schema: {
                    model: {
                        fields: {
                            SaleID: {
                                type: "number"
                            },
                            title: {
                                from: "Title",
                                type: "string"
                            },
                            description: {
                                from: "Description",
                                type: "string"
                            },
                            start: {
                                from: "Start",
                                type: "date"
                            },
                            startTimezone: {
                                from: "StartTimezone",
                                type: "string"
                            },
                            end: {
                                from: "End",
                                type: "date"
                            },
                            endTimezone: {
                                from: "EndTimezone",
                                type: "string"
                            },
                            recurrenceRule: {
                                from: "RecurrenceRule",
                                type: "string"
                            },
                            RecurrenceID: {
                                type: "number",
                                defaultValue: null
                            },
                            recurrenceException: {
                                from: "RecurrenceException",
                                type: "string"
                            },
                            isAllDay: {
                                from: "IsAllDay",
                                type: "boolean"
                            },
                            EmployeeID: {
                                type: "number",
                                defaultValue: null
                            }
                        }
                    }
                }
            },
            resources: [{
                field: "EmployeeID",
                title: "Employee",
                dataTextField: "EmployeeName",
                dataValueField: "EmployeeID",
                dataSource: {
                    transport: {
                        read: {
                            dataType: "json",
                            url: "./Content/employees-list.json"
                        }
                    }
                }
            }]
        })

        $('#employeeBio').kendoTooltip({
            filter: "a",
            content: function (e) {
                return e.target.find("span").text();
            }
        })
    }

    function onListDataBound(e) {
        this.select($(".employee:first"));
    }

    function onCriteriaChange() {
        var employeeList = $("#employees-list").data("kendoListView"),
            employee = employeeList.dataSource.getByUid(employeeList.select().attr("data-uid")),
            employeeQuarterSales = $("#employee-quarter-sales").data("kendoChart"),
            employeeAverageSales = $("#employee-average-sales").data("kendoChart"),
            teamSales = $("#team-sales").data("kendoChart"),
            employeeSales = $("#employee-sales").data("kendoScheduler"),
            startDate = $("#start-date").data("kendoDatePicker"),
            endDate = $("#end-date").data("kendoDatePicker"),
            filter = {
                EmployeeID: employee.EmployeeID,
                startDate: kendo.format("{0:MM/dd/yyyy hh:mm:ss}", startDate.value()),
                endDate: kendo.format("{0:MM/dd/yyyy hh:mm:ss}", endDate.value())
            },
            template = kendo.template($("#employeeBioTemplate").html());

        $("#employeeBio").html(template(employee));

        employeeSales.dataSource.filter({
            field: "EmployeeID",
            operator: "eq",
            value: employee.EmployeeID
        });

        teamSales.dataSource.read(filter);
        employeeQuarterSales.dataSource.read(filter);
        employeeAverageSales.dataSource.read(filter);
    }

    function onQuarterSalesDataBound(e) {
        var data = this.dataSource.at(0);
        $("#employee-quarter-sales-label").text(kendo.toString(data.Current, "c2"));
    }

    function onAverageSalesDataBound(e) {
        var data = this.dataSource.aggregates()
        if (data.EmployeeSales) {
            $("#employee-average-sales-label").text(kendo.toString(data.EmployeeSales.average, "c2"));
        } else {
            $("#employee-average-sales-label").text(kendo.toString(0, "c2"));
        }
    }
}