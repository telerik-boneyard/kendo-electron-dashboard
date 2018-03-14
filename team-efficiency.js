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
        $("#StartDateTeamEff").kendoDatePicker({
            value: new Date(1997, 0, 1),
            min: new Date(1996, 0, 1),
            max: new Date(1997, 5, 30),
            change: startChange
        })

        $("#EndDateTeamEff").kendoDatePicker({
            value: new Date(1997, 5, 30),
            min: new Date(1997, 0, 1),
            max: new Date(1998, 5, 30),
            change: endChange
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
                data: employeeAverageSales,
                schema:{
                    model:{
                        fields:{
                            Date: {type: "date"}
                        }
                    }
                }
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
                        var StartDateTeamEff = options.data.StartDateTeamEff;
                        var EndDateTeamEff = options.data.EndDateTeamEff;
                        var employee = $.grep(employeeAndTeamSales, function (e) {
                            return e.EmployeeID == options.data.EmployeeID;
                        })[0];
                        options.success($.grep(employee.Sales, function(e){
                            var date = kendo.parseDate(e.Date);
                            if((date>StartDateTeamEff)&&(date<EndDateTeamEff)){
                                return true;
                            }else{
                                return false;
                            }
                        }));
                    }
                }
            },
            legend: {
                position: "bottom"
            },
            dataBound: function(e){
                var dataLength = e.sender.dataSource.view().length
                $("#team-sales-no-data").toggle(dataLength === 0);
                e.sender.element.toggle(!(dataLength === 0));
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
            date: new Date("1997, 1, 1"),
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
            StartDateTeamEff = $("#StartDateTeamEff").data("kendoDatePicker"),
            EndDateTeamEff = $("#EndDateTeamEff").data("kendoDatePicker"),
            filter = {
                EmployeeID: employee.EmployeeID,
                StartDateTeamEff: StartDateTeamEff.value(),
                EndDateTeamEff: EndDateTeamEff.value()
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
        employeeAverageSales.dataSource.query({
            filter: [{
                field: "EmployeeID",
                operator: "eq",
                value: employee.EmployeeID
            },{
                field: "Date",
                operator: "gte",
                value: StartDateTeamEff.value()
            }, {
                field: "Date",
                operator: "lte",
                value: EndDateTeamEff.value()
            }],
            aggregate: [{
                field: "EmployeeSales",
                aggregate: "average"
            }]
        });
    }

    function startChange(e) {
        var StartDateTeamEff = $("#StartDateTeamEff").data("kendoDatePicker");
        var EndDateTeamEff = $("#EndDateTeamEff").data("kendoDatePicker");
        var startDate = StartDateTeamEff.value();
        var endDate = EndDateTeamEff.value();

        if (startDate) {
            startDate = new Date(startDate);
            startDate.setDate(startDate.getDate());
            EndDateTeamEff.min(startDate);
        } else if (endDate) {
            StartDateTeamEff.max(new Date(endDate));
        } else {
            endDate = new Date();
            StartDateTeamEff.max(endDate);
            EndDateTeamEff.min(endDate);
        }

        onCriteriaChange();
    }

    function endChange(e) {
        var StartDateTeamEff = $("#StartDateTeamEff").data("kendoDatePicker");
        var EndDateTeamEff = $("#EndDateTeamEff").data("kendoDatePicker");
        var startDate = StartDateTeamEff.value();
        var endDate = EndDateTeamEff.value();

        if (endDate) {
            endDate = new Date(endDate);
            endDate.setDate(endDate.getDate());
            StartDateTeamEff.max(endDate);
        } else if (startDate) {
            EndDateTeamEff.min(new Date(startDate));
        } else {
            endDate = new Date();
            StartDateTeamEff.max(endDate);
            EndDateTeamEff.min(endDate);
        }

        onCriteriaChange();
    }

    function onQuarterSalesDataBound(e) {
        var data = this.dataSource.at(0);
        $("#employee-quarter-sales-label").text(kendo.toString(data.Current, "c2"));
    }

    function onAverageSalesDataBound(e) {
        var data = this.dataSource.aggregates();
        if (data.EmployeeSales) {
            $("#employee-average-sales-label").text(kendo.toString(data.EmployeeSales.average, "c2"));
        } else {
            $("#employee-average-sales-label").text(kendo.toString(0, "c2"));
        }
    }
}