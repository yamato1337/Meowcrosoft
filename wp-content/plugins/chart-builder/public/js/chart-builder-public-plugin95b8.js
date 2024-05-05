(function($) {
	'use strict';

	function AysChartPlugin(element, options) {
		this.el = element;
		this.$el = $(element);
		this.htmlClassPrefix = 'ays-chart-';
		this.htmlNamePrefix = 'ays_';
		this.uniqueId;
		this.dbData = undefined;
		this.chartSourceData = undefined;
		this.chartObj = undefined;
		this.chartOptions = null;
		this.chartData = null;
		this.chartTempData = null;
		this.chartType = 'pie_chart';
		this.chartId = null;
	
		this.chartSources = {
			'line_chart'   : 'Line Chart',
			'bar_chart'    : 'Bar Chart',
			'pie_chart'    : 'Pie Chart',
			'column_chart' : 'Column Chart',
			'org_chart'	   : 'Org Chart',
		}
	
		this.init();
	
		return this;
	}
	
	AysChartPlugin.prototype.init = function() {
		var _this = this;
		_this.uniqueId = _this.$el.data('id');

		if ( typeof window.aysChartOptions != 'undefined' ) {
            _this.dbData = JSON.parse( atob( window.aysChartOptions[ _this.uniqueId ] ) );
        }

		_this.setEvents();
	}
	
	AysChartPlugin.prototype.setEvents = function(e){
		var _this = this;
		
		_this.chartId = _this.dbData.id;
		_this.chartType = _this.dbData.chart_type;

		_this.loadChartBySource();

		$(document).on('click', '.elementor-tab-title', function (e) {
			_this.loadChartBySource();
		})
	}

	// Load charts by given type main function
	AysChartPlugin.prototype.loadChartBySource = function(){
		var _this = this;

		if(typeof _this.chartType !== undefined && _this.chartType){
			switch (_this.chartType) {
				case 'pie_chart':
					_this.pieChartView();
					break;
				case 'bar_chart':
					_this.barChartView();
					break;
				case 'column_chart':
					_this.columnChartView();
					break;
				case 'line_chart':
					_this.lineChartView();
					break;
				case 'org_chart':
					_this.orgChartView();
					break;
				default:
					_this.pieChartView();
					break;
			}
		}
	}

	// Load chart by pie chart
	AysChartPlugin.prototype.pieChartView = function(){
		var _this = this;
		var getChartSource = _this.dbData.source;

		var dataTypes = _this.chartConvertData( getChartSource );

		var settings = _this.dbData.options;
		var nSettings =  _this.configOptionsForCharts(settings);

		/* == Google part == */
		google.charts.load('current', {'packages':['corechart']});
		google.charts.setOnLoadCallback(drawChart);

		function drawChart() {
			_this.chartData = google.visualization.arrayToDataTable( dataTypes );

			_this.chartOptions = {
				fontSize: nSettings.chartFontSize,
				chartArea: {
					left: nSettings.chartLeftMargin,
					right: nSettings.chartRightMargin,
					top: nSettings.chartTopMargin,
					bottom: nSettings.chartBottomMargin,
				},
				backgroundColor: {
					fill: nSettings.backgroundColor,
					strokeWidth: nSettings.borderWidth,
					stroke: nSettings.borderColor
				},
				enableInteractivity: nSettings.enableInteractivity,
				legend: {
					position: nSettings.legendPosition,
					alignment: nSettings.legendAlignment,
					textStyle: {
						color: nSettings.legendColor,
						fontSize: nSettings.legendFontSize,
						italic: nSettings.legendItalicText,
						bold: nSettings.legendBoldText,
					}
				},
				tooltip: { 
					trigger: nSettings.tooltipTrigger,
					showColorCode: nSettings.showColorCode,
					text: nSettings.tooltipText,
					textStyle: {
						color: nSettings.tooltipTextColor,
						fontSize: nSettings.tooltipFontSize,
						italic: nSettings.tooltipItalicText,
						bold: nSettings.tooltipBoldText,
					}
				},
				pieStartAngle: nSettings.rotationDegree,
				pieSliceBorderColor: nSettings.sliceBorderColor,
				reverseCategories: nSettings.reverseCategories,
				pieSliceText: nSettings.sliceText,
				sliceVisibilityThreshold: nSettings.dataGroupingLimit,
				pieResidueSliceLabel: nSettings.dataGroupingLabel,
				pieResidueSliceColor: nSettings.dataGroupingColor,
				slices: {}
			};
			
			for (var i = 0; i < dataTypes.length - 1; i++) {
				_this.chartOptions.slices[i] = {
					color: nSettings.sliceColor[i],
					offset: typeof nSettings.sliceOffset[i] !== 'undefined' ? nSettings.sliceOffset[i] : 0,
					textStyle: {
						color: nSettings.sliceTextColor[i],
					},
				}
			}

			_this.chartObj = new google.visualization.PieChart( document.getElementById(_this.htmlClassPrefix + _this.chartType + _this.uniqueId));

			_this.chartObj.draw( _this.chartData, _this.chartOptions );
			_this.resizeChart();
		}
		/* */
	}

	// Load chart by bar chart
	AysChartPlugin.prototype.barChartView = function(){
		var _this = this;
		var getChartSource = _this.dbData.source;
		var dataTypes = _this.multiColumnChartConvertData( getChartSource );

		var settings = _this.dbData.options;
		var nSettings =  _this.configOptionsForCharts(settings);

		/* == Google part == */
		google.charts.load('current', {'packages':['corechart']});
		google.charts.setOnLoadCallback(drawChart);

		function drawChart() {
			dataTypes = nSettings.enableRowSettings ? _this.setRowOptions(dataTypes, nSettings, true) : dataTypes;

			_this.chartData = google.visualization.arrayToDataTable(dataTypes);

			_this.chartOptions = {
				fontSize: nSettings.chartFontSize,
				backgroundColor: {
					fill: nSettings.backgroundColor,
					strokeWidth: nSettings.borderWidth,
					stroke: nSettings.borderColor
				},
				chartArea: {
					backgroundColor: {
						fill: nSettings.chartBackgroundColor,
						stroke: nSettings.chartBorderColor,
						strokeWidth: nSettings.chartBorderWidth
					},
					left: nSettings.chartLeftMargin,
					right: nSettings.chartRightMargin,
					top: nSettings.chartTopMargin,
					bottom: nSettings.chartBottomMargin,
				},
				enableInteractivity: nSettings.enableInteractivity,
				theme: nSettings.maximizedView,
				legend: {
					position: nSettings.legendPosition,
					alignment: nSettings.legendAlignment,
					textStyle: {
						color: nSettings.legendColor,
						fontSize: nSettings.legendFontSize,
						italic: nSettings.legendItalicText,
						bold: nSettings.legendBoldText,
					}
				},
				tooltip: { 
					trigger: nSettings.tooltipTrigger,
					showColorCode: nSettings.showColorCode,
					textStyle: {
						color: nSettings.tooltipTextColor,
						fontSize: nSettings.tooltipFontSize,
						italic: nSettings.tooltipItalicText,
						bold: nSettings.tooltipBoldText,
					}
				},
				hAxis: {
					title: nSettings.hAxisTitle,
					textPosition: nSettings.hAxisTextPosition,
					direction: nSettings.hAxisDirection,
					baselineColor: nSettings.hAxisBaselineColor,
					textStyle: {
						color: nSettings.hAxisTextColor,
						fontSize: nSettings.hAxisTextFontSize,
						italic: nSettings.hAxisItalicText,
						bold: nSettings.hAxisBoldText,
					},
					slantedText: nSettings.hAxisSlantedText,
					slantedTextAngle: nSettings.hAxisSlantedTextAngle,
					format: nSettings.hAxisFormat,
					titleTextStyle: {
						fontSize: nSettings.hAxisLabelFontSize,
						color: nSettings.hAxisLabelColor,
						italic: nSettings.hAxisItalicTitle,
						bold: nSettings.hAxisBoldTitle,
					},
					viewWindow: {
						min: nSettings.hAxisMinValue,
						max: nSettings.hAxisMaxValue,
					},
					gridlines: {
						count: nSettings.hAxisGridlinesCount,
						color: nSettings.hAxisGridlinesColor,
					},
					minorGridlines: {
						color: nSettings.hAxisMinorGridlinesColor,
					},
				},
				vAxis: {
					title: nSettings.vAxisTitle,
					textPosition: nSettings.vAxisTextPosition,
					direction: nSettings.vAxisDirection,
					baselineColor: nSettings.vAxisBaselineColor,
					textStyle: {
						color: nSettings.vAxisTextColor,
						fontSize: nSettings.vAxisTextFontSize,
						italic: nSettings.vAxisItalicText,
						bold: nSettings.vAxisBoldText,
					},
					format: nSettings.vAxisFormat,
					titleTextStyle: {
						fontSize: nSettings.vAxisLabelFontSize,
						color: nSettings.vAxisLabelColor,
						italic: nSettings.vAxisItalicTitle,
						bold: nSettings.vAxisBoldTitle,
					},
					viewWindow: {
						min: nSettings.vAxisMinValue,
						max: nSettings.vAxisMaxValue,
					},
					gridlines: {
						count: nSettings.vAxisGridlinesCount,
						color: nSettings.vAxisGridlinesColor,
					},
					minorGridlines: {
						color: nSettings.vAxisMinorGridlinesColor,
					},
				},
				focusTarget: nSettings.focusTarget,
				isStacked: nSettings.isStacked,
				dataOpacity: nSettings.opacity,
				bar: {
					groupWidth: nSettings.groupWidth
				},
				series: {},
			};

			for (var i = 0; i < dataTypes[0].length; i++) {
				_this.chartOptions.series[i] = {
					color: nSettings.seriesColor[i],
					visibleInLegend: nSettings.seriesVisibleInLegend[i] == 'on' ? true : (typeof nSettings.seriesColor[i] !== 'undefined' ? false : true),
				}
			}

			if (nSettings.enableAnimation) {
				_this.chartOptions.animation = {
					startup: nSettings.animationStartup,
					duration: nSettings.animationDuration,
					easing: nSettings.animationEasing,
				}
			}

			_this.chartObj = new google.visualization.BarChart(document.getElementById(_this.htmlClassPrefix + _this.chartType + _this.uniqueId));

			_this.chartObj.draw( _this.chartData, _this.chartOptions );
			_this.resizeChart();
		}
		/* */
	}

	// Load chart by column chart
	AysChartPlugin.prototype.columnChartView = function(){
		var _this = this;
		var getChartSource = _this.dbData.source;

		// Collect data in new array for chart rendering (Column chart)
		var dataTypes = _this.multiColumnChartConvertData( getChartSource );

		var settings = _this.dbData.options;
		var nSettings =  _this.configOptionsForCharts(settings);

		/* == Google part == */
		google.charts.load('current', {'packages':['corechart']});
		google.charts.setOnLoadCallback(drawChart);

		function drawChart() {
			dataTypes = nSettings.enableRowSettings ? _this.setRowOptions(dataTypes, nSettings, true) : dataTypes;

			_this.chartData = google.visualization.arrayToDataTable(dataTypes);

			_this.chartOptions = {
				fontSize: nSettings.chartFontSize,
				backgroundColor: {
					fill: nSettings.backgroundColor,
					strokeWidth: nSettings.borderWidth,
					stroke: nSettings.borderColor
				},
				chartArea: {
					backgroundColor: {
						fill: nSettings.chartBackgroundColor,
						stroke: nSettings.chartBorderColor,
						strokeWidth: nSettings.chartBorderWidth
					},
					left: nSettings.chartLeftMargin,
					right: nSettings.chartRightMargin,
					top: nSettings.chartTopMargin,
					bottom: nSettings.chartBottomMargin,
				},
				enableInteractivity: nSettings.enableInteractivity,
				theme: nSettings.maximizedView,
				legend: {
					position: nSettings.legendPosition,
					alignment: nSettings.legendAlignment,
					textStyle: {
						color: nSettings.legendColor,
						fontSize: nSettings.legendFontSize,
						italic: nSettings.legendItalicText,
						bold: nSettings.legendBoldText,
					}
				},
				tooltip: { 
					trigger: nSettings.tooltipTrigger,
					showColorCode: nSettings.showColorCode,
					textStyle: {
						color: nSettings.tooltipTextColor,
						fontSize: nSettings.tooltipFontSize,
						italic: nSettings.tooltipItalicText,
						bold: nSettings.tooltipBoldText,
					}
				},
				hAxis: {
					title: nSettings.hAxisTitle,
					textPosition: nSettings.hAxisTextPosition,
					direction: nSettings.hAxisDirection,
					baselineColor: nSettings.hAxisBaselineColor,
					textStyle: {
						color: nSettings.hAxisTextColor,
						fontSize: nSettings.hAxisTextFontSize,
						italic: nSettings.hAxisItalicText,
						bold: nSettings.hAxisBoldText,
					},
					slantedText: nSettings.hAxisSlantedText,
					slantedTextAngle: nSettings.hAxisSlantedTextAngle,
					format: nSettings.hAxisFormat,
					titleTextStyle: {
						fontSize: nSettings.hAxisLabelFontSize,
						color: nSettings.hAxisLabelColor,
						italic: nSettings.hAxisItalicTitle,
						bold: nSettings.hAxisBoldTitle,
					},
					viewWindow: {
						min: nSettings.hAxisMinValue,
						max: nSettings.hAxisMaxValue,
					},
					gridlines: {
						count: nSettings.hAxisGridlinesCount,
						color: nSettings.hAxisGridlinesColor,
					},
					minorGridlines: {
						color: nSettings.hAxisMinorGridlinesColor,
					},
					showTextEvery: nSettings.hAxisShowTextEvery
				},
				vAxis: {
					title: nSettings.vAxisTitle,
					textPosition: nSettings.vAxisTextPosition,
					direction: nSettings.vAxisDirection,
					baselineColor: nSettings.vAxisBaselineColor,
					textStyle: {
						color: nSettings.vAxisTextColor,
						fontSize: nSettings.vAxisTextFontSize,
						italic: nSettings.vAxisItalicText,
						bold: nSettings.vAxisBoldText,
					},
					format: nSettings.vAxisFormat,
					titleTextStyle: {
						fontSize: nSettings.vAxisLabelFontSize,
						color: nSettings.vAxisLabelColor,
						italic: nSettings.vAxisItalicTitle,
						bold: nSettings.vAxisBoldTitle,
					},
					viewWindow: {
						min: nSettings.vAxisMinValue,
						max: nSettings.vAxisMaxValue,
					},
					gridlines: {
						count: nSettings.vAxisGridlinesCount,
						color: nSettings.vAxisGridlinesColor,
					},
					minorGridlines: {
						color: nSettings.vAxisMinorGridlinesColor,
					},
				},
				focusTarget: nSettings.focusTarget,
				isStacked: nSettings.isStacked,
				dataOpacity: nSettings.opacity,
				bar: {
					groupWidth: nSettings.groupWidth
				},
				series: {},
			};

			for (var i = 0; i < dataTypes[0].length; i++) {
				_this.chartOptions.series[i] = {
					color: nSettings.seriesColor[i],
					visibleInLegend: nSettings.seriesVisibleInLegend[i] == 'on' ? true : (typeof nSettings.seriesColor[i] !== 'undefined' ? false : true),
				}
			}

			if (nSettings.enableAnimation) {
				_this.chartOptions.animation = {
					startup: nSettings.animationStartup,
					duration: nSettings.animationDuration,
					easing: nSettings.animationEasing,
				}
			}

			_this.chartObj = new google.visualization.ColumnChart(document.getElementById(_this.htmlClassPrefix + _this.chartType + _this.uniqueId));

			_this.chartObj.draw( _this.chartData, _this.chartOptions );
			_this.resizeChart();
		}
		/* */
	}

	// Load chart by line chart
	AysChartPlugin.prototype.lineChartView = function(){
		var _this = this;
		var getChartSource = _this.dbData.source;
		var dataTypes = _this.multiColumnChartConvertData(getChartSource);

		var settings = _this.dbData.options;
		var nSettings =  _this.configOptionsForCharts(settings);

		/* == Google part == */
		google.charts.load('current', {'packages':['corechart']});
		google.charts.setOnLoadCallback(drawChart);

		function drawChart() {
			dataTypes = nSettings.enableRowSettings ? _this.setRowOptions(dataTypes, nSettings, true) : dataTypes;

			_this.chartData = google.visualization.arrayToDataTable(dataTypes);

			_this.chartOptions = {
				fontSize: nSettings.chartFontSize,
				backgroundColor: {
					fill: nSettings.backgroundColor,
					strokeWidth: nSettings.borderWidth,
					stroke: nSettings.borderColor
				},
				chartArea: {
					backgroundColor: {
						fill: nSettings.chartBackgroundColor,
						stroke: nSettings.chartBorderColor,
						strokeWidth: nSettings.chartBorderWidth
					},
					left: nSettings.chartLeftMargin,
					right: nSettings.chartRightMargin,
					top: nSettings.chartTopMargin,
					bottom: nSettings.chartBottomMargin,
				},
				enableInteractivity: nSettings.enableInteractivity,
				theme: nSettings.maximizedView,
				legend: {
					position: nSettings.legendPosition,
					alignment: nSettings.legendAlignment,
					textStyle: {
						color: nSettings.legendColor,
						fontSize: nSettings.legendFontSize,
						italic: nSettings.legendItalicText,
						bold: nSettings.legendBoldText,
					}
				},
				tooltip: { 
					trigger: nSettings.tooltipTrigger,
					showColorCode: nSettings.showColorCode,
					textStyle: {
						color: nSettings.tooltipTextColor,
						fontSize: nSettings.tooltipFontSize,
						italic: nSettings.tooltipItalicText,
						bold: nSettings.tooltipBoldText,
					}
				},
				hAxis: {
					title: nSettings.hAxisTitle,
					textPosition: nSettings.hAxisTextPosition,
					direction: nSettings.hAxisDirection,
					baselineColor: nSettings.hAxisBaselineColor,
					textStyle: {
						color: nSettings.hAxisTextColor,
						fontSize: nSettings.hAxisTextFontSize,
						italic: nSettings.hAxisItalicText,
						bold: nSettings.hAxisBoldText,
					},
					slantedText: nSettings.hAxisSlantedText,
					slantedTextAngle: nSettings.hAxisSlantedTextAngle,
					format: nSettings.hAxisFormat,
					titleTextStyle: {
						fontSize: nSettings.hAxisLabelFontSize,
						color: nSettings.hAxisLabelColor,
						italic: nSettings.hAxisItalicTitle,
						bold: nSettings.hAxisBoldTitle,
					},
					viewWindow: {
						min: nSettings.hAxisMinValue,
						max: nSettings.hAxisMaxValue,
					},
					gridlines: {
						count: nSettings.hAxisGridlinesCount,
						color: nSettings.hAxisGridlinesColor,
					},
					minorGridlines: {
						color: nSettings.hAxisMinorGridlinesColor,
					},
					showTextEvery: nSettings.hAxisShowTextEvery
				},
				vAxis: {
					title: nSettings.vAxisTitle,
					textPosition: nSettings.vAxisTextPosition,
					direction: nSettings.vAxisDirection,
					baselineColor: nSettings.vAxisBaselineColor,
					textStyle: {
						color: nSettings.vAxisTextColor,
						fontSize: nSettings.vAxisTextFontSize,
						italic: nSettings.vAxisItalicText,
						bold: nSettings.vAxisBoldText,
					},
					format: nSettings.vAxisFormat,
					titleTextStyle: {
						fontSize: nSettings.vAxisLabelFontSize,
						color: nSettings.vAxisLabelColor,
						italic: nSettings.vAxisItalicTitle,
						bold: nSettings.vAxisBoldTitle,
					},
					viewWindow: {
						min: nSettings.vAxisMinValue,
						max: nSettings.vAxisMaxValue,
					},
					gridlines: {
						count: nSettings.vAxisGridlinesCount,
						color: nSettings.vAxisGridlinesColor,
					},
					minorGridlines: {
						color: nSettings.vAxisMinorGridlinesColor,
					},
				},
				crosshair: {
					opacity: nSettings.crosshairOpacity,
					orientation: nSettings.crosshairOrientation,
					trigger: nSettings.crosshairTrigger,
				},
				focusTarget: nSettings.focusTarget,
				dataOpacity: nSettings.opacity,
				lineWidth: nSettings.lineWidth,
				selectionMode: nSettings.multipleSelection,
				aggregationTarget: nSettings.multipleDataFormat,
				pointShape: nSettings.pointShape,
				pointSize: nSettings.pointSize,
				orientation: nSettings.orientation,
				interpolateNulls: nSettings.fillNulls,
				series: {},
			};

			for (var i = 0; i < dataTypes[0].length; i++) {
				_this.chartOptions.series[i] = {
					color: nSettings.seriesColor[i],
					visibleInLegend: nSettings.seriesVisibleInLegend[i] == 'on' ? true : (typeof nSettings.seriesColor[i] !== 'undefined' ? false : true),
				}
			}

			if (nSettings.enableAnimation) {
				_this.chartOptions.animation = {
					startup: nSettings.animationStartup,
					duration: nSettings.animationDuration,
					easing: nSettings.animationEasing,
				}
			}

			_this.chartObj = new google.visualization.LineChart(document.getElementById(_this.htmlClassPrefix + _this.chartType + _this.uniqueId));


			_this.chartObj.draw( _this.chartData, _this.chartOptions );
			_this.resizeChart();
		}
		/* */
	}

	// Load chart by org chart
	AysChartPlugin.prototype.orgChartView = function(){
		var _this = this;
		var getChartSource = _this.dbData.source;
		var dataTypes = _this.orgChartConvertData(getChartSource);

		var settings = _this.dbData.options;
		var nSettings =  _this.configOptionsForCharts(settings);

		/* == Google part == */
		google.charts.load('current', {'packages':['orgchart']});
		google.charts.setOnLoadCallback(drawChart);

		function drawChart() {
			_this.chartData = new google.visualization.arrayToDataTable(dataTypes);

			var view = new google.visualization.DataView(_this.chartData);
    		view.setColumns([0, 1, 2]);

			_this.chartOptions = {
				allowHtml: true,
				size: nSettings.orgChartFontSize,
				allowCollapse: nSettings.allowCollapse,
				nodeClass: nSettings.orgClassname,
			};

			_this.chartObj = new google.visualization.OrgChart(document.getElementById(_this.htmlClassPrefix + _this.chartType + _this.uniqueId));

			google.visualization.events.addListener(_this.chartObj, 'select', function () {
				var selection = _this.chartObj.getSelection();
				if (selection.length > 0) {
					if (_this.chartData.getValue(selection[0].row, 3) != '') {
						window.open(_this.chartData.getValue(selection[0].row, 3), '_blank');
					}
				}
			});
			
			google.visualization.events.addListener(_this.chartObj, 'collapse', function () {
				_this.setOrgChartCustomStyles();
			});

			_this.chartObj.draw( _this.chartData, _this.chartOptions );
			_this.resizeChart();
			_this.setOrgChartCustomStyles();
		}
		/* */
	}

	/* 
	  Configure all settings for all chart types
	  Getting settings for each chart type in respective function 
	*/
	AysChartPlugin.prototype.configOptionsForCharts = function (settings) {
		var newSettings = {};

		newSettings.chartFontSize = settings['font_size'];
		newSettings.backgroundColor = settings['transparent_background'] && settings['transparent_background'] === 'on' ? 'transparent' : settings['background_color'];
		newSettings.borderWidth = settings['border_width'];
		newSettings.borderColor = settings['border_color'];
		newSettings.tooltipTrigger = settings['tooltip_trigger'];
		newSettings.tooltipText = settings['tooltip_text'];
		newSettings.showColorCode = (settings['show_color_code'] == 'on') ? true : false;
		newSettings.tooltipItalicText = (settings['tooltip_italic'] == 'on') ? true : false;
		newSettings.tooltipBoldText = settings['tooltip_bold'];
		newSettings.legendItalicText = (settings['legend_italic'] == 'on') ? true : false;
		newSettings.legendBoldText = (settings['legend_bold'] == 'on') ? true : false;
		newSettings.tooltipTextColor = settings['tooltip_text_color'];
		newSettings.tooltipFontSize = settings['tooltip_font_size'];
		newSettings.legendPosition = settings['legend_position'];
		newSettings.legendAlignment = settings['legend_alignment'];
		newSettings.legendFontSize = settings['legend_font_size'];
		newSettings.rotationDegree = settings['rotation_degree'];
		newSettings.sliceBorderColor = settings['slice_border_color'];
		newSettings.reverseCategories = (settings['reverse_categories'] == 'on') ? true : false;
		newSettings.sliceText = settings['slice_text'];
		newSettings.legendColor = settings['legend_color'];
		newSettings.dataGroupingLimit = settings['data_grouping_limit']/100;
		newSettings.dataGroupingLabel = settings['data_grouping_label'];
		newSettings.dataGroupingColor = settings['data_grouping_color'];
		newSettings.sliceColor = settings['slice_color'];
		newSettings.sliceOffset = settings['slice_offset'];
		newSettings.sliceTextColor = settings['slice_text_color'];
		newSettings.chartBackgroundColor = settings['transparent_background'] && settings['transparent_background'] === 'on' ? 'transparent' : settings['chart_background_color'];
		newSettings.chartBorderWidth = settings['chart_border_width'];
		newSettings.chartBorderColor = settings['chart_border_color'];
		newSettings.chartLeftMargin = settings['chart_left_margin_for_js'];
		newSettings.chartRightMargin = settings['chart_right_margin_for_js'];
		newSettings.chartTopMargin = settings['chart_top_margin_for_js'];
		newSettings.chartBottomMargin = settings['chart_bottom_margin_for_js'];
		newSettings.isStacked = (settings['is_stacked'] == 'on') ? true : false;
		newSettings.focusTarget = settings['focus_target'];
		newSettings.groupWidthFormat = settings['group_width_format'] == '%' ? '%' : '';
		newSettings.groupWidth = settings['group_width'] + newSettings.groupWidthFormat;
		newSettings.hAxisTitle = settings['haxis_title'];
		newSettings.vAxisTitle = settings['vaxis_title'];
		newSettings.hAxisLabelFontSize = settings['haxis_label_font_size'];
		newSettings.vAxisLabelFontSize = settings['vaxis_label_font_size'];
		newSettings.hAxisLabelColor = settings['haxis_label_color'];
		newSettings.vAxisLabelColor = settings['vaxis_label_color'];
		newSettings.hAxisTextPosition = settings['haxis_text_position'];
		newSettings.vAxisTextPosition = settings['vaxis_text_position'];
		newSettings.vAxisDirection = (settings['vaxis_direction'] == '-1') ? -1 : 1;
		newSettings.hAxisDirection = (settings['haxis_direction'] == '-1') ? -1 : 1;
		newSettings.hAxisTextColor = settings['haxis_text_color'];
		newSettings.vAxisTextColor = settings['vaxis_text_color'];
		newSettings.hAxisBaselineColor = settings['haxis_baseline_color'];
		newSettings.vAxisBaselineColor = settings['vaxis_baseline_color'];
		newSettings.hAxisTextFontSize = settings['haxis_text_font_size'];
		newSettings.vAxisTextFontSize = settings['vaxis_text_font_size'];
		newSettings.hAxisSlantedText = settings['haxis_slanted'];
		newSettings.hAxisSlantedTextAngle = settings['haxis_slanted_text_angle'];
		newSettings.hAxisShowTextEvery = settings['haxis_show_text_every'];
		newSettings.vAxisFormat = settings['vaxis_format'];
		newSettings.hAxisFormat = settings['haxis_format'];
		newSettings.hAxisMinValue = settings['haxis_min_value'];
		newSettings.hAxisMaxValue = settings['haxis_max_value'];
		newSettings.vAxisMinValue = settings['vaxis_min_value'];
		newSettings.vAxisMaxValue = settings['vaxis_max_value'];
		newSettings.hAxisGridlinesCount = settings['haxis_gridlines_count'];
		newSettings.hAxisGridlinesColor = settings['haxis_gridlines_color'];
		newSettings.hAxisMinorGridlinesColor = settings['haxis_minor_gridlines_color'];
		newSettings.vAxisGridlinesCount = settings['vaxis_gridlines_count'];
		newSettings.vAxisGridlinesColor = settings['vaxis_gridlines_color'];
		newSettings.vAxisMinorGridlinesColor = settings['vaxis_minor_gridlines_color'];
		newSettings.hAxisItalicText = (settings['haxis_italic'] == 'on') ? true : false;
		newSettings.hAxisBoldText = (settings['haxis_bold'] == 'on') ? true : false;
		newSettings.vAxisItalicText = (settings['vaxis_italic'] == 'on') ? true : false;
		newSettings.vAxisBoldText = (settings['vaxis_bold'] == 'on') ? true : false;
		newSettings.hAxisItalicTitle = (settings['haxis_title_italic'] == 'on') ? true : false;
		newSettings.hAxisBoldTitle = (settings['haxis_title_bold'] == 'on') ? true : false;
		newSettings.vAxisItalicTitle = (settings['vaxis_title_italic'] == 'on') ? true : false;
		newSettings.vAxisBoldTitle = (settings['vaxis_title_bold'] == 'on') ? true : false;
		newSettings.opacity = settings['opacity'];
		newSettings.enableInteractivity = (settings['enable_interactivity'] == 'off') ? false : true;
		newSettings.maximizedView = (settings['maximized_view'] == 'on') ? 'maximized' : null;
		newSettings.enableAnimation = (settings['enable_animation'] == 'on') ? true : false;
		newSettings.animationDuration = settings['animation_duration'];
		newSettings.animationStartup = (settings['animation_startup'] == 'off') ? false : true;
		newSettings.animationEasing = settings['animation_easing'];
		newSettings.seriesColor = settings['series_color'];
		newSettings.seriesVisibleInLegend = settings['series_visible_in_legend'];
		newSettings.enableRowSettings = (settings['enable_row_settings'] == 'on') ? true : false;
		newSettings.rowsColor = settings['rows_color'];
		newSettings.rowsOpacity = settings['rows_opacity'];
		newSettings.multipleSelection = (settings['multiple_selection'] == 'on') ? 'multiple' : 'single';
		newSettings.multipleDataFormat = settings['multiple_data_format'];
		newSettings.pointShape = settings['point_shape'];
		newSettings.pointSize = settings['point_size'];
		newSettings.lineWidth = settings['line_width'];
		newSettings.crosshairTrigger = settings['crosshair_trigger'];
		newSettings.crosshairOrientation = settings['crosshair_orientation'];
		newSettings.crosshairOpacity = settings['crosshair_opacity'];
		newSettings.orientation = (settings['orientation'] == 'on') ? 'vertical' : 'horizontal';
		newSettings.fillNulls = (settings['fill_nulls'] == 'on') ? true : false;
		newSettings.orgChartFontSize = settings['org_chart_font_size'];
		newSettings.allowCollapse = (settings['allow_collapse'] == 'on') ? true : false;
		newSettings.orgClassname = settings['org_classname'];

		return newSettings;
	}

	AysChartPlugin.prototype.setRowOptions = function (data, options, isJS = true) {
		var _this = this;
		
		if (data && data.length > 0) {
			if (data[0] && data[0].length == 2) {
				data[0].push({ role: 'style' });
				for (var i = 1; i < data.length; i++) {
					var opts = [];

					var color = isJS ? options.rowsColor[i - 1] : options.rows_color[i - 1];
					opts.push(color ? 'color:'+color : '');

					var opacity = isJS ? options.rowsOpacity[i - 1] : options.rows_opacity[i - 1];
					opts.push(opacity ? 'opacity:'+opacity : '');


					data[i].push(opts.join(';'));
				}
			}
		}

		return data;
	}

	AysChartPlugin.prototype.removeRowOptions = function (data) {
		var _this = this;

		if (data && data.length > 0) {
			if (data[0] && data[0].length == 2) {
				for (var i = 0; i < data.length; i++) {
					data[i].splice(2, 1);
				}
			}
		}

		return data;
	}

	// Detect window resize moment to draw charts responsively
	AysChartPlugin.prototype.resizeChart = function(){
		var _this = this;

		//create trigger to resizeEnd event
		$(window).resize(function() {
			if(this.resizeTO) clearTimeout(this.resizeTO);
			this.resizeTO = setTimeout(function() {
				$(this).trigger('resizeEnd');
			}, 100);
		});

		//redraw graph when window resize is completed
		$(window).on('resizeEnd', function() {
			_this.drawChartFunction( _this.chartData, _this.chartOptions );
		});
	}

	AysChartPlugin.prototype.setOrgChartCustomStyles = function () {
		var _this = this;
		var settings = _this.dbData.options;

		var orgClassname = settings.org_classname;
		var bgColor = settings.org_node_background_color;
		var padding = settings.org_node_padding;
		var borderRadius = settings.org_node_border_radius;
		var textColor = settings.org_node_text_color;
		var textSize = settings.org_node_text_font_size;
		var descriptionColor = settings.org_node_description_font_color;
		// var descriptionSize = settings.org_node_description_font_size;

		if (orgClassname != '') {
			var node = _this.$el.find('.' + orgClassname);
			node.css({
				'background-color' : bgColor,
				'padding' : padding + 'px',
				'border-radius' : borderRadius + 'px',
				'color' : textColor,
				'font-size' : textSize + 'px',
				'border' : 'none'
			});
		}

		var description = _this.$el.find('.' + _this.htmlClassPrefix + 'org-chart-tree-description');
		description.css({
			'color' : descriptionColor,
			// 'font-size' : descriptionSize + 'px',
		});
		
		// var image = _this.$el.find('.' + _this.htmlClassPrefix + 'org-chart-tree-image');
	}

	// Load chart by pie chart
	AysChartPlugin.prototype.chartConvertData = function( data ){
		var _this = this;
		var dataTypes = [];

		// Collect data in new array for chart rendering
		for ( var key in data ) {
			if ( data.hasOwnProperty( key ) ) {
				if (key == 0) {
					if (data[key][0] != '' && data[key][1] != '') {
						dataTypes.push([
							_this.htmlDecode(data[key][0]), _this.htmlDecode(data[key][1])
						]);
					}
				} else {
					if (data[key][0] != '' && data[key][1] != '') {
						dataTypes.push([
							_this.htmlDecode(data[key][0]), +(data[key][1])
						]);
					}
				}
			}
		}

		return dataTypes;
	}

	// Converting chart data for multicolumn chart
	AysChartPlugin.prototype.multiColumnChartConvertData = function( data ){
		var _this = this;
		var dataTypes = [];
		var titleRow = [];

		for (var key in data) {
			var dataRow = [];
			if (data.hasOwnProperty(key)) {
				if (key == 0) {
					for (var index in data[key]) {
						if (data[key][index] != '') {
							titleRow.push(_this.htmlDecode(data[key][index]));
						}
					}
					dataTypes.push(titleRow);
				} else {
					for (var index in data[key]) {
						if (data[key][index] != '') {
							if  (index == 0) {
								dataRow.push(_this.htmlDecode(data[key][index]));
							} else {
								dataRow.push(+data[key][index]);
							}
						}
					}
					dataTypes.push(dataRow);
				}
			}
		}

		return dataTypes;
	}

	// Converting chart data for org chart type
	AysChartPlugin.prototype.orgChartConvertData = function( data ){
		var _this = this;
		var dataTypes = [['Name', 'Manager', 'Tooltip', 'Url']];
		// var name = "";
		// Collect data in new array for chart rendering
		for ( var key in data ) {
			if ( data.hasOwnProperty( key ) ) {
				if (key != 0) {
					var name = data[key][0];
					var description = data[key][1];
					var image = (data[key].length > 6) ? data[key][2] : '';
					var parent_name = (data[key].length > 6) ? data[key][3] : data[key][2];
					var tooltip = (data[key].length > 6) ? data[key][4] : data[key][3];
					var url = (data[key].length > 6) ? data[key][5] : '';
					
					if (description) {
						name += _this.orgChartFormatName(description);
					}
					if (image && image != '') {
						name = _this.orgChartFormatImage(image) + name;
					}
					name = {'v': data[key][0], 'f': name};
					dataTypes.push([
						name, parent_name, tooltip, url
					]);
				}
			}
		}

		return dataTypes;
	}

	AysChartPlugin.prototype.orgChartFormatName = function( description ){
		return `<div class="${this.htmlClassPrefix}org-chart-tree-description">${description}</div>`;
	}

	AysChartPlugin.prototype.orgChartFormatImage = function( image ){
		return `<div class="${this.htmlClassPrefix}org-chart-tree-image"><img width="128px" src="${image}"></div>`;
	}

	// Update chart data and display immediately
	AysChartPlugin.prototype.updateChartData =  function( newData ){
		var _this = this;
		_this.chartObj.draw( newData, _this.chartOptions );
	}

	AysChartPlugin.prototype.htmlDecode = function (input) {
		var e = document.createElement('div');
		e.innerHTML = input;
		return e.childNodes[0].nodeValue;
	}

	AysChartPlugin.prototype.drawChartFunction = function (source, options) {
		var _this = this;

		var view = new google.visualization.DataView(source);
		_this.chartData = source;

		if (_this.chartType == 'org_chart') {
			view.setColumns([0, 1, 2]);
		}

		_this.chartObj.draw(view, options);

		if (_this.chartType == 'org_chart') {
			_this.setOrgChartCustomStyles();
		}
	}

	$.fn.AysChartBuilder = function(options) {
		return this.each(function() {
			if (!$.data(this, 'AysChartBuilder')) {
				$.data(this, 'AysChartBuilder', new AysChartPlugin(this, options));
			} else {
				try {
					$(this).data('AysChartBuilder').init();
				} catch (err) {
					console.error('AysChartBuilder has not initiated properly');
				}
			}
		});
	};

})(jQuery);
