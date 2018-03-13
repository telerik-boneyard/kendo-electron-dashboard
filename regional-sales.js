function onRegionalSales() {
    var scale = chroma.scale(["#ade1fb", "#097dc6"]).domain([1, 100]),
        selectedShape = null,
        selectedCountry = "USA";

    function resizeMap() {
        var map = $("#map").data("kendoMap");
        map.resize();
        map.center([50.000, 0]);
    }

    function resizeChart(){
        var chart = $("#top-selling-products").data("kendoChart");
        chart.resize();
    }

    function onMarketShareDataBound(e) {
        var percentage = 0,
            revenue = 0;
        if (this.dataSource.data().length == 2) {
            percentage = (this.dataSource.at(1).sales / this.dataSource.at(0).sales);
            revenue = this.dataSource.at(1).sales;
        }

        $("#market-share-label").text(kendo.toString(percentage, "p2"));
        $("#revenue-label").text(kendo.toString(revenue, "c2"));

        $("#revenue-no-data").toggle(revenue === 0);
        $("#market-share-no-data").toggle(percentage === 0);
        if (percentage === 0) {
            $("#market-share").css({
                visibility: "hidden"
            });
        } else {
            $("#market-share").css({
                visibility: "visible"
            });
        }
    }

    $('[data-toggle=offcanvas]').click(function () {
        $('.row-offcanvas').toggleClass('active');
    });

    $('#start-date').kendoDatePicker({
        value: new Date(1996, 0, 1),
        min: new Date(1996, 0, 1),
        max: new Date(1998, 5, 30),
        change: startChange
    })

    $('#end-date').kendoDatePicker({
        value: new Date(1998, 7, 9),
        min: new Date(1996, 0, 1),
        max: new Date(1998, 7, 9),
        change: endChange
    })

    $("#map").kendoMap({
        center: [50.000, 0],
        zoom: 2,
        layers: [{
            style: {
                fill: {
                    color: "#1996E4"
                },
                stroke: {
                    color: "#FFFFFF"
                }
            },
            type: "shape",
            dataSource: {
                type: "geojson",
                transport: {
                    read: {
                        dataType: "json",
                        url: "./Content/countries-sales.geo.json"
                    }
                }
            }
        }],
        shapeCreated: onShapeCreated,
        shapeMouseEnter: onShapeMouseEnter,
        shapeMouseLeave: onShapeMouseLeave,
        shapeClick: onShapeClick,
        zoomable: false
    });

    var orderDetailsData = [];
    var customers = [];
    var countryCustomers = []
    var topSellingProducts = [];

    $.when(
        $.getJSON("./Content/order-details.json", function (data) {
            orderDetailsData = data;
        }
        ),
        $.getJSON("./Content/customers.json", function (data) {
            customers = data;
        }
        ),
        $.getJSON("./Content/country-customers.json", function (data) {
            countryCustomers = data;
        }
        ),
        $.getJSON("./Content/top-selling-products.json", function (data) {
            topSellingProducts = data;
        }
        )).then(function () {
            initWidgets();
            onCriteriaChange();
        })

    function initWidgets() {
        $("#market-share").kendoChart({
            theme: "metro",
            autoBind: false,
            dataBound: onMarketShareDataBound,
            legend: {
                visible: false
            },
            dataSource: {
                transport: {
                    read: function (options) {
                        var from = new Date(options.data.fromDate);
                        var to = new Date(options.data.toDate);
                        var total = 0;
                        var result = [];

                        for (var i = 0; i < orderDetailsData.length; i++) {
                            var order = orderDetailsData[i];
                            if (order.country == options.data.country) {
                                var orderDate = kendo.parseDate(order.orderDate)
                                if (orderDate > from && orderDate < to) {
                                    total += order.price;
                                }
                            }
                        }
                        result = [{
                            "country": "All",
                            "sales": 854648.019191742
                        }, {
                            "country": options.data.country,
                            "sales": total
                        }]
                        options.success(result);
                    }
                }
            },
            seriesDefaults: {
                type: "donut"
            },
            series: [{
                field: "sales",
                categoryField: "country",
            }],
            tooltip: {
                visible: true,
                template: "#= dataItem.country #: #= kendo.toString(dataItem.sales, 'c2') #"
            }
        })

        $("#revenue").kendoSparkline({
            theme: "metro",
            type: "column",
            autoBind: false,
            dataSource: {
                transport: {
                    read: function (options) {
                        var from = new Date(options.data.fromDate);
                        var to = new Date(options.data.toDate);
                        var result = [];

                        for (var i = 0; i < orderDetailsData.length; i++) {
                            var order = orderDetailsData[i];
                            if (order.country == options.data.country) {
                                var orderDate = kendo.parseDate(order.orderDate)
                                if (orderDate > from && orderDate < to) {
                                    result.push({
                                        "date": orderDate,
                                        "value": order.price
                                    });
                                }
                            }
                        }
                        options.success(result);
                    }
                }
            },
            series: [{
                categoryField: "date",
                aggregate: "sum",
                color: "#1996e4",
                gap: 0.2,
                field: "value"
            }],
            categoryAxis: {
                type: "date",
                baseUnit: "months"
            },
            tooltip: {
                template: "#=kendo.toString(value, 'c2')# "
            }
        })

        $("#orders").kendoSparkline({
            theme: "metro",
            type: "column",
            autoBind: false,
            dataSource: {
                transport: {
                    read: function (options) {
                        var from = new Date(options.data.fromDate);
                        var to = new Date(options.data.toDate);
                        var result = [];

                        for (var i = 0; i < orderDetailsData.length; i++) {
                            var order = orderDetailsData[i];
                            if (order.country == options.data.country) {
                                var orderDate = kendo.parseDate(order.orderDate)
                                if (orderDate > from && orderDate < to) {
                                    result.push({
                                        "date": orderDate,
                                        "value": 1
                                    });
                                }
                            }
                        }
                        options.success(result);
                    }
                }
            },
            series: [{
                categoryField: "date",
                aggregate: "sum",
                color: "#1996e4",
                gap: 0.2,
                field: "value"
            }],
            categoryAxis: {
                type: "date",
                baseUnit: "months"
            }
        })

        $("#customers").kendoSparkline({
            theme: "metro",
            type: "column",
            autoBind: false,
            dataSource: {
                transport: {
                    read: function (options) {
                        var from = new Date(options.data.fromDate);
                        var to = new Date(options.data.toDate);
                        var result = [];

                        for (var i = 0; i < countryCustomers.length; i++) {
                            var customer = countryCustomers[i];
                            if (customer.Country == options.data.country) {
                                var orderDate = kendo.parseDate(customer.Date)
                                if (orderDate > from && orderDate < to) {
                                    result.push({
                                        "date": customer.Date,
                                        "value": customer.Value
                                    });
                                }
                            }
                        }
                        options.success(result);
                    }
                }
            },
            series: [{
                categoryField: "date",
                aggregate: "sum",
                color: "#1996e4",
                gap: 0.2,
                field: "value"
            }],
            categoryAxis: {
                type: "date",
                baseUnit: "months"
            }
        })

        $("#top-selling-products").kendoChart({
            theme: "metro",
            autoBind: false,
            legend: {
                visible: true,
                position: "top"
            },
            chartArea: {
                background: "#eeeeee"
            },
            dataBound: onTopProductsDataBound,
            dataSource: {
                transport: {
                    read: function (options) {
                        var from = new Date(options.data.fromDate);
                        var to = new Date(options.data.toDate);
                        var products = [];
                        var result = [];

                        for (var i = 0; i < topSellingProducts.length; i++) {
                            var product = topSellingProducts[i];
                            if (product.Country == options.data.country) {
                                var orderDate = kendo.parseDate(product.Date);
                                if (orderDate > from && orderDate < to) {
                                    result.push({
                                        "productName": product.ProductName,
                                        "date": product.Date,
                                        "quantity": product.Quantity
                                    })
                                }
                            }
                        }
                        options.success(result);
                    }
                },
                group: "productName"
            },
            seriesDefaults: {
                type: "line",
                style: "smooth"
            },
            series: [{
                field: "quantity",
                markers: {
                    visible: false
                }
            }],
            categoryAxis: [{
                majorGridLines: {
                    visible: false
                },
                line: {
                    width: 0
                },
                labels: {
                    visible: false
                }
            }],
            valueAxis: {
                majorUnit: 50,
                majorTicks: {
                    visible: false
                },
                majorGridLines: {
                    visible: false
                },
                line: {
                    visible: false
                },
                labels: {
                    visible: false
                }
            },
            tooltip: {
                visible: true,
                template: "#=data.series.name.replace(data.series.field, data.value)#"
            }

        })
    }

    function onCriteriaChange() {
        var marketShare = $("#market-share").data("kendoChart"),
            topSellingProducts = $("#top-selling-products").data("kendoChart"),
            revenue = $("#revenue").data("kendoSparkline"),
            orders = $("#orders").data("kendoSparkline"),
            customers = $("#customers").data("kendoSparkline"),
            fromDate = $("#start-date").data("kendoDatePicker").value(),
            toDate = $("#end-date").data("kendoDatePicker").value();
        getCountryOrdersTotal(fromDate, toDate);
        getCountryCustomersTotal();

        marketShare.dataSource.read({
            country: selectedCountry,
            fromDate: kendo.format("{0:dd/MM/yyyy hh:mm:ss}", fromDate),
            toDate: kendo.format("{0:dd/MM/yyyy hh:mm:ss}", toDate)
        });
        topSellingProducts.dataSource.read({
            country: selectedCountry,
            fromDate: kendo.format("{0:MM/dd/yyyy hh:mm:ss}", fromDate),
            toDate: kendo.format("{0:MM/dd/yyyy hh:mm:ss}", toDate)
        });
        revenue.dataSource.read({
            country: selectedCountry,
            fromDate: kendo.format("{0:dd/MM/yyyy hh:mm:ss}", fromDate),
            toDate: kendo.format("{0:dd/MM/yyyy hh:mm:ss}", toDate)
        });
        orders.dataSource.read({
            country: selectedCountry,
            fromDate: kendo.format("{0:dd/MM/yyyy hh:mm:ss}", fromDate),
            toDate: kendo.format("{0:dd/MM/yyyy hh:mm:ss}", toDate)
        });
        customers.dataSource.read({
            country: selectedCountry,
            fromDate: kendo.format("{0:dd/MM/yyyy hh:mm:ss}", fromDate),
            toDate: kendo.format("{0:dd/MM/yyyy hh:mm:ss}", toDate)
        });

        listCustomers(selectedCountry);

        setSparkLinesWidths();
    }

    function startChange(e) {
        var StartDate = $("#start-date").data("kendoDatePicker");
        var EndDate = $("#end-date").data("kendoDatePicker");
        var startDate = StartDate.value();
        var endDate = EndDate.value();

        if (startDate) {
            startDate = new Date(startDate);
            startDate.setDate(startDate.getDate());
            EndDate.min(startDate);
        } else if (endDate) {
            StartDate.max(new Date(endDate));
        } else {
            endDate = new Date();
            StartDate.max(endDate);
            EndDate.min(endDate);
        }

        onCriteriaChange();
    }

    function endChange(e) {
        var StartDate = $("#start-date").data("kendoDatePicker");
        var EndDate = $("#end-date").data("kendoDatePicker");
        var startDate = StartDate.value();
        var endDate = EndDate.value();

        if (endDate) {
            endDate = new Date(endDate);
            endDate.setDate(endDate.getDate());
            StartDate.max(endDate);
        } else if (startDate) {
            EndDate.min(new Date(startDate));
        } else {
            endDate = new Date();
            StartDate.max(endDate);
            EndDate.min(endDate);
        }

        onCriteriaChange();
    }

    function listCustomers(country) {
        $("#countryName").text(country);
        var companyNames = "";

        for (var i = 0; i < customers.length; i++) {
            var customer = customers[i];
            if (customer.Country == country) {
                companyNames += customer.CompanyName + ", ";
            }
        }

        $("#countryCustomers span").text(companyNames);

        var containerWidth = $(".sparkline-container").parent().width(),
            getSparkLines = $(".k-sparkline"),
            chartWidth = (80 * containerWidth) / 100;

        getSparkLines.each(function () {
            $(this).data("kendoSparkline").setOptions({
                chartArea: {
                    width: chartWidth
                }
            });
        });

        $("#top-selling-products").data("kendoChart").resize();
        $("#market-share").data("kendoChart").resize();
    }

    function setSparkLinesWidths() {
        var containerWidth = $(".sparkline-container").parent().width(),
            getSparkLines = $(".k-sparkline"),
            sparkLineWidth = (80 * containerWidth) / 100;

        getSparkLines.each(function () {
            $(this).data("kendoSparkline").setOptions({
                chartArea: {
                    width: sparkLineWidth
                }
            });
        });

        $("#top-selling-products").data("kendoChart").resize();
        $("#market-share").data("kendoChart").resize();
    }

    function onShapeCreated(e) {
        var color = scale(e.shape.dataItem.properties.sales).hex();
        e.shape.fill(color);
    }

    function onShapeClick(e) {
        if (selectedShape) {
            var sales = selectedShape.dataItem.properties.sales;
            var color = scale(sales).hex();
            selectedShape.options.set("fill.color", color);
            selectedShape.options.set("stroke.color", "white");
            selectedShape.dataItem.properties.selected = false;
        }

        e.shape.options.set("fill.color", "#0c669f");
        e.shape.options.set("stroke.color", "black");
        e.shape.dataItem.properties.selected = true;
        selectedShape = e.shape;
        selectedCountry = selectedShape.dataItem.properties.name;

        onCriteriaChange();
    }

    function onShapeMouseEnter(e) {
        e.shape.options.set("fill.color", "#0c669f");
    }

    function onShapeMouseLeave(e) {
        if (!e.shape.dataItem.properties.selected) {
            var sales = e.shape.dataItem.properties.sales;
            var color = scale(sales).hex();
            e.shape.options.set("fill.color", color);
            e.shape.options.set("stroke.color", "white");
        }
    }

    function onTopProductsDataBound() {
        var items = this.dataSource.data().length;
        $("#products-no-data").toggle(items === 0);
    }

    function getCountryOrdersTotal(fromDate, toDate) {
        var total = 0;
        var from = new Date(fromDate);
        var to = new Date(toDate);

        for (var i = 0; i < orderDetailsData.length; i++) {
            var order = orderDetailsData[i];
            if (order.country == selectedCountry) {
                var orderDate = kendo.parseDate(order.orderDate)
                if (orderDate > from && orderDate < to) {
                    total++;
                }
            }
        }

        $("#orders-label").text(total);
        $("#orders-no-data").toggle(total === 0);
    }

    function getCountryCustomersTotal(fromDate, toDate) {
        var total = 0;

        for (var i = 0; i < customers.length; i++) {
            var customer = customers[i];
            if (customer.Country == selectedCountry) {
                total++;
            }
        }

        $("#customers-label").text(total);
        $("#customers-no-data").toggle(total === 0);
    }

    $(window).resize(function(){
        resizeMap();
        resizeChart();
    });
}