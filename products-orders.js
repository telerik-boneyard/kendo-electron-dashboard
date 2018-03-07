function onProductsOrders() {
    var employees = [{
        "value": 1,
        "text": "Nancy Davolio"
    }, {
        "value": 2,
        "text": "Andrew Fuller"
    }, {
        "value": 3,
        "text": "Janet Leverling"
    }, {
        "value": 4,
        "text": "Margaret Peacock"
    }, {
        "value": 5,
        "text": "Steven Buchanan"
    }, {
        "value": 6,
        "text": "Michael Suyama"
    }, {
        "value": 7,
        "text": "Robert King"
    }, {
        "value": 8,
        "text": "Laura Callahan"
    }, {
        "value": 9,
        "text": "Anne Dodsworth"
    }];

    var shippers = [{
        "value": 1,
        "text": "Speedy Express"
    }, {
        "value": 2,
        "text": "United Package"
    }, {
        "value": 3,
        "text": "Federal Shipping"
    }];

    $(window).on("resize", function () {
        var containerWidth = $(".sparkline-container").parent().width();
        var sparkLineWidth = (80 * containerWidth) / 100;
        $(".k-sparkline").data("kendoSparkline").setOptions({
            chartArea: {
                width: sparkLineWidth
            }
        });
        resizeGrid();
    });

    initGrid();

    function initGrid() {
        $('#ordersGrid').kendoGrid({
            dataSource: {
                transport: {
                    read: {
                        dataType: "json",
                        url: "./Content/orders.json"
                    }
                },
                pageSize: 20,
                schema: {
                    parse: function (response) {
                        var result = [];
                        for (var i = 0; i < response.length; i++) {
                            var product = {
                                OrderID: response[i].OrderID,
                                OrderDate: kendo.parseDate(response[i].OrderDate),
                                CustomerID: response[i].CustomerID,
                                EmployeeID: response[i].EmployeeID,
                                ShipCountry: response[i].ShipCountry,
                                ShipVia: response[i].ShipVia,
                                ShipName: response[i].ShipName,
                                ShipCity: response[i].ShipCity,
                                ShipAddress: response[i].ShipAddress,
                                ShipPostalCode: response[i].ShipPostalCode,
                            };
                            result.push(product);
                        }
                        return result;
                    },
                    model: {
                        id: "OrderID",
                        fields: {
                            OrderID: {
                                editable: false
                            },
                            OrderDate: {
                                defaultValue: new Date()
                            },
                        }
                    }
                }
            },
            dataBound: onDataBound,
            columns: [{
                field: "OrderID",
                title: "ORDER ID"
            }, {
                field: "OrderDate",
                title: "ORDER DATE",
                format: "{0: yyyy-MM-dd}",
                width: 150
            }, {
                field: "CustomerID",
                title: "CUSTOMER"
            }, {
                field: "EmployeeID",
                title: "EMPLOYEE",
                values: employees
            }, {
                field: "ShipCountry",
                title: "SHIP COUNTRY"
            }, {
                field: "ShipVia",
                title: "SHIP VIA",
                values: shippers
            }],
            sortable: true,
            pageable: true,
            navigatable: true,
            filterable: true,
            scrollable: true,
            selectable: "column",
            detailTemplate: kendo.template($("#order-detail-template").html()),
            detailInit: detailInit
        })
    }

    function detailInit(e) {
        var detailRow = e.detailRow;
        var orderId = e.data.OrderID;
        var products, orderDetails;

        detailRow.find(".tabstrip").kendoTabStrip();

        $.when($.ajax({
            url: './Content/product-details.json',
            dataType: "json",
            success: function (data) {
                var result = [];
                for (var i = 0; i < data.length; i++) {
                    result.push({
                        text: data[i].ProductName,
                        value: data[i].ProductID
                    })
                }
                products = result;
            }
        }), $.ajax({
            url: './Content/order-information.json',
            dataType: "json",
            success: function (data) {
                orderDetails = data;
            }
        })).done(function () {
            detailRow.find(".details-grid").kendoGrid({
                autoBind: false,
                dataSource: {
                    transport: {
                        read: function (options) {
                            var result = $.grep(orderDetails, function (e) {
                                return e.OrderID == options.data.OrderID;
                            })[0];
                            options.success(result.OrderDetails);
                        }
                    },
                    schema: {
                        parse: function (data) {
                            for (var i = 0; i < data.length; i++) {
                                var sum = data[i].UnitPrice * data[i].Quantity;
                                sum = sum - (sum * data[i].Discount)
                                data[i].Total = sum;
                            }
                            return data;
                        }
                    },
                    aggregate: [{
                        field: "Total",
                        aggregate: "sum"
                    }]
                },
                dataBound: onDataBound,
                columns: [{
                    field: "ProductID",
                    title: "PRODUCT NAME",
                    values: products
                }, {
                    field: "UnitPrice",
                    title: "UNIT PRICE",
                    format: "{0:c}",
                    width: 220
                }, {
                    field: "Quantity",
                    title: "QUANTITY",
                    width: 220
                }, {
                    field: "Discount",
                    title: "DISCOUNT",
                    format: "{0:p}",
                    width: 200,
                    footerTemplate: "Grand total:"
                }, {
                    field: "Total",
                    title: "TOTAL",
                    format: "{0:c}",
                    footerTemplate: "<span name='sum'>#=kendo.toString(sum, 'c')#</span>",
                    width: 120
                }],
                detailTemplate: kendo.template($("#product-detail-template").html()),
                detailInit: productDetailInit,
                selectable: true,
                navigateable: true
            })

            detailRow.find(".details-grid").getKendoGrid().dataSource.read({
                "OrderID": orderId
            });
        })
    }

    function productDetailInit(e) {
        var model = e.data;
        var detail = e.detailRow;
        var productSales = [];

        $.ajax({
            url: './Content/product-details.json',
            dataType: "json",
            success: function (products) {
                var product = $.grep(products, function (e) {
                    return e.ProductID == model.ProductID;
                });
                detail.find(".product-name").text(product[0].ProductName);
                detail.find(".product-category").text(product[0].Category);
                detail.find(".details-stock").text(product[0].UnitsInStock);
                detail.find(".details-orders").text(product[0].UnitsOnOrder);
                detail.find(".details-re-order").text(product[0].ReorderLevel);
            }
        })

        $.ajax({
            url: './Content/product-sales.json',
            dataType: "json",
            success: function (data) {
                productSales = data;
            }
        }).done(function () {
            var sparkline = e.detailRow.find('.details-sparkline').kendoSparkline({
                theme: "metro",
                type: "column",
                autoBind: false,
                dataSource: {
                    transport: {
                        read: function (options) {
                            var sales = $.grep(productSales, function (e) {
                                return e.ProductID == options.data.ProductID;
                            })[0];
                            options.success(sales.ProductSales);
                        }
                    }
                },
                series: [{
                    categoryField: "Date",
                    aggregate: "count",
                    gap: 0.2,
                    field: "Quantity",
                    tooltip: {
                        template: "QUANTITY: #:value#"
                    }
                }],
                categoryAxis: {
                    type: "date",
                    visible: true,
                    labels: {
                        visible: false
                    },
                    majorTicks: {
                        visible: false
                    },
                    baseUnit: "months",
                    line: {
                        visible: true,
                        color: "#000000"
                    }
                },
                valueAxis: {
                    line: {
                        visible: true
                    }
                }
            }).data('kendoSparkline');
            sparkline.dataSource.read({
                "ProductID": model.ProductID
            });
        })


    }

    function onDataBound(e) {
        var firstRow = this.tbody.find("tr.k-master-row").first();
        this.expandRow(firstRow);
    }

    function resizeGrid() {
        var gridElement = $("#orders"),
            dataArea = gridElement.find(".k-grid-content").first(),
            gridHeight = gridElement.innerHeight(),
            otherElements = gridElement.children().not(".k-grid-content"),
            otherElementsHeight = 0;
        otherElements.each(function () {
            otherElementsHeight += $(this).outerHeight();
        });
        dataArea.height(gridHeight - otherElementsHeight);
    }
};