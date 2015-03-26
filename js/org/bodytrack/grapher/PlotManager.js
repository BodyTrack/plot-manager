//======================================================================================================================
// Author: Chris Bartley (bartley@cmu.edu)
//======================================================================================================================

//======================================================================================================================
// VERIFY NAMESPACE
//======================================================================================================================
// Create the global symbol "org" if it doesn't exist.  Throw an error if it does exist but is not an object.
var org;
if (!org) {
   /** @namespace */
   org = {};
}
else {
   if (typeof org != "object") {
      var orgExistsMessage = "Error: failed to create org namespace: org already exists and is not an object";
      alert(orgExistsMessage);
      throw new Error(orgExistsMessage);
   }
}

// Repeat the creation and type-checking for the next level
if (!org.bodytrack) {
   /** @namespace */
   org.bodytrack = {};
}
else {
   if (typeof org.bodytrack != "object") {
      var orgBodytrackExistsMessage = "Error: failed to create org.bodytrack namespace: org.bodytrack already exists and is not an object";
      alert(orgBodytrackExistsMessage);
      throw new Error(orgBodytrackExistsMessage);
   }
}

// Repeat the creation and type-checking for the next level
if (!org.bodytrack.grapher) {
   /** @namespace */
   org.bodytrack.grapher = {};
}
else {
   if (typeof org.bodytrack.grapher != "object") {
      var orgBodytrackGrapherExistsMessage = "Error: failed to create org.bodytrack.grapher namespace: org.bodytrack.grapher already exists and is not an object";
      alert(orgBodytrackGrapherExistsMessage);
      throw new Error(orgBodytrackGrapherExistsMessage);
   }
}
//======================================================================================================================

//======================================================================================================================
// DEPENDECIES
//======================================================================================================================
if (!window['$']) {
   var nojQueryMsg = "The jQuery library is required by org.bodytrack.grapher.PlotManager.js";
   alert(nojQueryMsg);
   throw new Error(nojQueryMsg);
}

// TODO: depends on BodyTrack Grapher! (DateAxis, PlotContainer, etc...)

//======================================================================================================================

//======================================================================================================================
// CODE
//======================================================================================================================
(function() {
   var DEFAULT_STYLE = {
      "styles" : [
         { "type" : "line", "lineWidth" : 1, "show" : true, "color" : "black" },
         { "type" : "circle", radius : 1, "lineWidth" : 1, "show" : true, "color" : "black", fill : true }
      ],
      "highlight" : {
         "lineWidth" : 1,
         "styles" : [
            {
               "show" : true,
               "type" : "lollipop",
               "color" : "#000000",
               "radius" : 0,
               "lineWidth" : 1,
               "fill" : false
            },
            {
               "type" : "circle",
               radius : 3,
               "lineWidth" : 0.5,
               "show" : true,
               "color" : "#ff0000",
               fill : false
            },
            {
               "show" : true,
               "type" : "value",
               "fillColor" : "#ff0000",
               "marginWidth" : 10,
               "font" : "7pt Helvetica,Arial,Verdana,sans-serif",
               "verticalOffset" : 7,
               "numberFormat" : "###,##0.#"
            }
         ]
      }
   };

   //  Got this from http://stackoverflow.com/a/9436948/703200
   var isString = function(o) {
      return (typeof o == 'string' || o instanceof String)
   };

   // Got this from http://stackoverflow.com/a/9716488/703200
   var isNumeric = function(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
   };

   var isNumberOrString = function(o) {
      return isString(o) || isNumeric(o);
   };

   var validateAxisRange = function(minTimeSecs, maxTimeSecs) {
      return {
         min : isNumeric(minTimeSecs) ? minTimeSecs : -1 * Number.MAX_VALUE,
         max : isNumeric(maxTimeSecs) ? maxTimeSecs : Number.MAX_VALUE
      }
   };

   /**
    * The min and max values for an axis's range.
    *
    * @typedef {Object} AxisRange
    * @property {number} min - the range min
    * @property {number} max - the range max
    */

   /**
    * Wrapper class to make it easier to work with a date axis.
    *
    * @class
    * @constructor
    * @param {string} elementId - the DOM element ID for the container div holding the date axis
    */
   org.bodytrack.grapher.DateAxis = function(elementId) {
      var self = this;

      var wrappedAxis = null;

      /**
       * Returns the DOM element ID for the container div holding this axis.
       *
       * @return {string}
       */
      this.getElementId = function() {
         return elementId;
      };

      /**
       * Returns the wrapped <code>DateAxis</code> object.
       *
       * @return {DateAxis}
       */
      this.getWrappedAxis = function() {
         return wrappedAxis;
      };

      /**
       * Returns the date axis's current range as and object containing <code>mine</code> and <code>max</code> fields.
       *
       * @return {AxisRange}
       */
      this.getRange = function(){
         return {
            min: wrappedAxis.getMin(),
            max: wrappedAxis.getMax()
         };
      };

      /**
       * Sets the visible range of the axis.
       *
       * @param {number} minTimeSecs - a double representing the time in Unix time seconds of the start of the
       * visible time range. If <code>null</code>, undefined, or non-numeric, then <code>-1*Number.MAX_VALUE</code>
       * is used instead.
       * @param {number} maxTimeSecs - a double representing the time in Unix time seconds of the end of the visible
       * time range. If <code>null</code>, undefined, or non-numeric, then <code>Number.MAX_VALUE</code> is used
       * instead.
       */
      this.setRange = function(minTimeSecs, maxTimeSecs) {
         var validRange = validateAxisRange(minTimeSecs, maxTimeSecs);

         wrappedAxis.setRange(validRange.min, validRange.max);
      };

      /**
       * Constrains the range of the axis so that the user cannot pan/zoom outside the specified range.
       *
       * @param {number} minTimeSecs - a double representing the minimum time in Unix time seconds of time range. If
       * <code>null</code>, undefined, or non-numeric, then <code>-1*Number.MAX_VALUE</code> is used instead.
       * @param {number} maxTimeSecs - a double representing the maximum time in Unix time seconds of time range. If
       * <code>null</code>, undefined, or non-numeric, then <code>Number.MAX_VALUE</code> is used instead.
       */
      this.constrainRangeTo = function(minTimeSecs, maxTimeSecs) {
         var validRange = validateAxisRange(minTimeSecs, maxTimeSecs);

         wrappedAxis.setMaxRange(validRange.min, validRange.max);
      };

      /**
       * Clears the range constraints by setting bounds to [<code>-1 * Number.MAX_VALUE</code>, <code>Number.MAX_VALUE</code>].
       */
      this.clearRangeConstraints = function() {
         self.constrainRangeTo(null, null)
      };

      /**
       * Sets the width of the axis.
       *
       * @param {int} width - the new width
       */
      this.setWidth = function(width) {
         var element = $("#" + elementId);
         element.width(width);
         wrappedAxis.setSize(width, element.height(), SequenceNumber.getNext());
      };

      /**
       * Returns the width of the DateAxis's container div.
       *
       * @return {int} the width of the DateAxis's container div
       */
      this.getWidth = function() {
         return $("#" + elementId).width();
      };

      // the "constructor"
      (function() {
         wrappedAxis = new DateAxis(elementId, "horizontal");

         // Tell the DateAxis instance the size of its container div
         var dateAxisElement = $("#" + elementId);
         wrappedAxis.setSize(dateAxisElement.width(), dateAxisElement.height(), SequenceNumber.getNext());
      })();
   };

   /**
    * Wrapper class to make it easier to work with a Y axis.
    *
    * @class
    * @constructor
    * @param {string} elementId - the DOM element ID for the container div holding this Y axis
    * @param {number} [yMin=0] - the minimum initial value for the Y axis. Defaults to 0 if undefined, <code>null</code>, or non-numeric.
    * @param {number} [yMax=100] - the maximum initial value for the Y axis. Defaults to 100 if undefined, <code>null</code>, or non-numeric.
    * @param {boolean} [willNotPadRange=false] - whether to pad the range
    */
   org.bodytrack.grapher.YAxis = function(elementId, yMin, yMax, willNotPadRange) {
      var self = this;

      var wrappedAxis = null;

      /**
       * Returns the DOM element ID for the container div holding this axis.
       *
       * @return {string}
       */
      this.getElementId = function() {
         return elementId;
      };

      /**
       * Returns the wrapped <code>DateAxis</code> object.
       *
       * @return {DateAxis}
       */
      this.getWrappedAxis = function() {
         return wrappedAxis
      };

      /**
       * Returns the Y axis's current range as and object containing <code>mine</code> and <code>max</code> fields.
       *
       * @return {AxisRange}
       */
      this.getRange = function(){
         return {
            min: wrappedAxis.getMin(),
            max: wrappedAxis.getMax()
         };
      };

      /**
       * Sets the visible range of the axis.
       *
       * @param {number} min - the min value. If <code>null</code>, undefined, or non-numeric, then
       * <code>-1*Number.MAX_VALUE</code> is used instead.
       * @param {number} max - the max value. If <code>null</code>, undefined, or non-numeric, then
       * <code>Number.MAX_VALUE</code> is used instead.
       * @param {boolean} [willNotPad=false] - whether to pad the range
       */
      this.setRange = function(min, max, willNotPad) {
         var range = validateAxisRange(min, max);

         // pad, if desired
         if (!willNotPad) {
            range = padRange(range);
         }

         wrappedAxis.setRange(range.min, range.max);
      };

      /**
       * Constrains the range of the axis so that the user cannot pan/zoom outside the specified range.
       *
       * @param {number} min - the min value. If <code>null</code>, undefined, or non-numeric, then
       * <code>-1*Number.MAX_VALUE</code> is used instead.
       * @param {number} max - the max value. If <code>null</code>, undefined, or non-numeric, then
       * <code>Number.MAX_VALUE</code> is used instead.
       * @param {boolean} [willNotPad=false] - whether to pad the range
       */
      this.constrainRangeTo = function(min, max, willNotPad) {
         var range = validateAxisRange(min, max);

         // pad, if desired
         if (!willNotPad) {
            range = padRange(range);
         }

         wrappedAxis.setMaxRange(range.min, range.max);
      };

      /**
       * Clears the range constraints by setting bounds to [<code>-1 * Number.MAX_VALUE</code>, <code>Number.MAX_VALUE</code>].
       */
      this.clearRangeConstraints = function() {
         self.constrainRangeTo(null, null)
      };

      var padRange = function(range) {
         var paddedRange = {
            min : range.min,
            max : range.max
         };

         var yDiff = paddedRange.max - paddedRange.min;
         if (isFinite(yDiff)) {
            var padding;
            if (yDiff < 1e-10) {
               padding = 0.5;
            }
            else {
               padding = 0.05 * yDiff;
            }

            paddedRange.min -= padding;
            paddedRange.max += padding;
         }

         return paddedRange;
      };

      // the "constructor"
      (function() {
         var range = {
            min : isNumeric(yMin) ? yMin : 0,
            max : isNumeric(yMax) ? yMax : 100
         };

         // pad, if desired and possible
         if (!willNotPadRange) {
            range = padRange(range);
         }

         wrappedAxis = new NumberAxis(elementId, "vertical", range);

         // set the size
         var element = $("#" + elementId);
         wrappedAxis.setSize(element.width(), element.height(), SequenceNumber.getNext());
      })();
   };

   /**
    * Wrapper class to make it easier to work with a plot container.
    *
    * @class
    * @constructor
    * @param {string} elementId - the DOM element ID for the container div holding this plot container
    * @param {org.bodytrack.grapher.DateAxis} dateAxis
    */
   org.bodytrack.grapher.PlotContainer = function(elementId, dateAxis) {
      var self = this;

      var wrappedPlotContainer = null;
      var yAxesAndPlotCount = {};
      var plotsAndYAxes = {};

      /**
       * Returns the DOM element ID for the container div holding this plot container.
       *
       * @return {string}
       */
      this.getElementId = function() {
         return elementId;
      };

      /**
       * Returns the {@link org.bodytrack.grapher.YAxis YAxis} for the specified DOM element ID.  Returns
       * <code>null</code> if no such axis exists.
       *
       * @param {string} yAxisElementId - the DOM element ID for the container div holding the desired Y axis
       * @return {org.bodytrack.grapher.YAxis}
       */
      this.getYAxis = function(yAxisElementId) {
         if (yAxisElementId in yAxesAndPlotCount) {
            return yAxesAndPlotCount[yAxisElementId].yAxis;
         }
         return null;
      };

      /**
       * Adds a data series plot to the plot container. The plot will be associated with the Y axis specified by the
       * given <code>yAxisElementId</code> (the Y axis may be shared with other plots, if you wish).
       *
       * @param {string|number} plotId - A identifier for this plot, unique within the PlotContainer.  Must be a number or a string.
       * @param {datasourceFunction} datasource - function with signature <code>function(level, offset, successCallback)</code> resposible for returning tile JSON for the given <code>level</code> and <code>offset</code>
       * @param {string} yAxisElementId - the DOM element ID for the container div holding this plot's Y axis
       * @param {number} [minValue=0] - the minimum initial value for the Y axis (if the Y axis is created for this plot). Defaults to 0 if undefined, <code>null</code>, or non-numeric.
       * @param {number} [maxValue=100] - the maximum initial value for the Y axis (if the Y axis is created for this plot). Defaults to 100 if undefined, <code>null</code>, or non-numeric.
       * @param {Object} [style] - the style object. A default style is used if undefined, null, or not an object.
       * @param {boolean} [isLocalTime=false] - whether the plot's data uses local time. Defaults to false (UTC).
       */
      this.addDataSeriesPlot = function(plotId, datasource, yAxisElementId, minValue, maxValue, style, isLocalTime) {
         // TODO: add validation for adding the same plotId more than once!

         // validation
         if (!isNumberOrString(plotId)) {
            throw new Error("The plotId must be a number or a string.")
         }

         if (typeof datasource !== 'function') {
            throw new Error("The datasource must be a function.")
         }

         if (!isNumberOrString(yAxisElementId)) {
            throw new Error("The yAxisElementId must be a number or a string.")
         }

         if (typeof minValue === 'undefined' || minValue == null) {
            minValue = 0;
         }
         else if (!isNumeric(minValue)) {
            throw new Error("The minValue must be a number.")
         }

         if (typeof maxValue === 'undefined' || maxValue == null) {
            maxValue = 100;
         }
         else if (!isNumeric(maxValue)) {
            throw new Error("The maxValue must be a number.")
         }

         if (typeof style !== 'object' || style == null) {
            style = JSON.parse(JSON.stringify(DEFAULT_STYLE));
         }

         isLocalTime = !!isLocalTime;

         // create the Y axis, if necessary
         var yAxis = null;
         if (yAxisElementId in yAxesAndPlotCount) {
            // this Y axis is already used by another plot, so just get the axis and increment its plot count
            yAxis = yAxesAndPlotCount[yAxisElementId].yAxis;
            yAxesAndPlotCount[yAxisElementId].plotCount++;
         }
         else {
            // this is a new Y axis, so create it and initialize its plot count to 1
            yAxis = new org.bodytrack.grapher.YAxis(yAxisElementId,    // DOM element ID
                                                    minValue,          // initial min value for the y axis
                                                    maxValue);         // initial max value for the y axis

            yAxesAndPlotCount[yAxisElementId] = {
               yAxis : yAxis,
               plotCount : 1
            };
         }

         // create the plot
         var plot = new DataSeriesPlot(datasource,
                                       dateAxis.getWrappedAxis(),
                                       yAxis.getWrappedAxis(),
               {
                  "style" : style,
                  "localDisplay" : isLocalTime
               });

         plotsAndYAxes[plotId] = {
            plot : plot,
            yAxisElementId : yAxisElementId
         };

         // finally, add the plot to the plot container
         wrappedPlotContainer.addPlot(plot);
      };

      this.removePlot = function(plotId) {
         if (plotId in plotsAndYAxes) {
            var plot = plotsAndYAxes[plotId].plot;
            var yAxisElementId = plotsAndYAxes[plotId].yAxisElementId;

            // remove the plot from the PlotContainer
            wrappedPlotContainer.removePlot(plot);

            // remove the plot from our collection
            delete plotsAndYAxes[plotId];

            // decrement the number of plots using this Y axis
            yAxesAndPlotCount[yAxisElementId].plotCount--;

            // see whether this Y axis is used by any other plots.  If not, remove it.
            if (yAxesAndPlotCount[yAxisElementId].plotCount <= 0) {
               delete yAxesAndPlotCount[yAxisElementId];
               // TODO: remove axis listeners?

               // TODO: figure out a better way to remove the contents of the y axis
               $("#" + yAxisElementId).find("canvas").remove();
            }
         }
      };

      this.removeAllPlots = function() {
         // TODO
      };

      /**
       * Sets the width of the PlotContainer.
       *
       * @param {int} width - the new width
       */
      this.setWidth = function(width) {
         var element = $("#" + elementId);
         element.width(width);
         wrappedPlotContainer.setSize(width, element.height(), SequenceNumber.getNext());
      };

      // the "constructor"
      (function() {
         wrappedPlotContainer = new PlotContainer(elementId, false, []);

         // set the width to be the same width as its DateAxis
         self.setWidth(dateAxis.getWidth());
      })();
   };

   /**
    * Creates a <code>PlotManager</code> associated with date axis specified by the given
    * <code>dateAxisElementId</code>. If <code>minTimeSecs</code> and <code>maxTimeSecs</code> are not specified, they
    * visible time range defaults to the past 24 hours.
    *
    * TODO: talk about assumption of one date axis, and all plot containers having the same width as the date axis
    *
    * @class
    * @constructor
    * @param {string} dateAxisElementId - the DOM element ID for the container div into which the date axis should be added
    * @param {number} [minTimeSecs=24 hours ago] - a double representing the time in Unix time seconds of the start of the visible time range
    * @param {number} [maxTimeSecs=now] - a double representing the time in Unix time seconds of the end of the visible time range
    */
   org.bodytrack.grapher.PlotManager = function(dateAxisElementId, minTimeSecs, maxTimeSecs) {
      var self = this;

      var dateAxis = null;
      var plotContainers = {};

      var isWindowWidthResizeListeningEnabled = false;
      var widthCalculator = null;

      /**
       * Returns the <code>DateAxis</code> object representing the date axis.
       *
       * @return {org.bodytrack.grapher.DateAxis} the DateAxis object
       */
      this.getDateAxis = function() {
         return dateAxis;
      };

      /**
       * Returns the {@link org.bodytrack.grapher.YAxis YAxis} for the specified DOM element ID.  Returns
       * <code>null</code> if no such axis exists.
       *
       * @param {string} yAxisElementId - the DOM element ID for the container div holding the desired Y axis
       * @return {org.bodytrack.grapher.YAxis}
       */
      this.getYAxis = function(yAxisElementId) {
         // iterate over the PlotContainers this way instead of using self.forEachPlotContainer() so that we can return
         // as soon as we find a matching Y axis.
         var plotContainerElementIds = Object.keys(plotContainers);
         for (var i = 0; i < plotContainerElementIds.length; i++) {
            var plotContainerElementId = plotContainerElementIds[i];
            var plotContainer = plotContainers[plotContainerElementId];
            var yAxis = plotContainer.getYAxis(yAxisElementId);
            if (yAxis != null) {
               return yAxis;
            }
         }

         return null;
      };

      /**
       * Returns the {@link org.bodytrack.grapher.PlotContainer PlotContainer} for the specified DOM element ID. Returns
       * <code>null</code> if no such plot container exists.
       *
       * @param {string} plotContainerElementId - the DOM element ID for the container div holding the desired plot container
       * @return {org.bodytrack.grapher.PlotContainer}
       */
      this.getPlotContainer = function(plotContainerElementId) {
         if (plotContainerElementId in plotContainers) {
            return plotContainers[plotContainerElementId];
         }

         return null;
      };

      /**
       * Adds a {@link org.bodytrack.grapher.PlotContainer PlotContainer} for the specified DOM element ID. If the
       * PlotContainer has already been added, a new one is not created.  Returns the PlotContainer.
       *
       * @param {string} plotContainerElementId - the DOM element ID for the container div holding the plot container
       * @return {org.bodytrack.grapher.PlotContainer}
       */
      this.addPlotContainer = function(plotContainerElementId) {
         if (!(plotContainerElementId in plotContainers)) {
            plotContainers[plotContainerElementId] = new org.bodytrack.grapher.PlotContainer(plotContainerElementId, dateAxis);
         }

         return plotContainers[plotContainerElementId];
      };

      /**
       * Datasource function with signature <code>function(level, offset, successCallback)</code> resposible for
       * returning tile JSON for the given <code>level</code> and <code>offset</code>.
       *
       * @callback plotContainerIteratorFunction
       * @param {org.bodytrack.grapher.PlotContainer} plotContainer - the PlotContainer object
       */

      /**
       * Method for iterating over each of the {@link org.bodytrack.grapher.PlotContainer PlotContainer} instances. Does
       * nothing if the given <code>plotContainerIteratorFunction</code> is not a function.
       *
       * @param {plotContainerIteratorFunction} plotContainerIteratorFunction
       */
      this.forEachPlotContainer = function(plotContainerIteratorFunction) {
         if (typeof plotContainerIteratorFunction === 'function') {
            Object.keys(plotContainers).forEach(function(elementId) {
               plotContainerIteratorFunction(plotContainers[elementId]);
            });
         }
      };

      /**
       * Datasource function with signature <code>function(level, offset, successCallback)</code> resposible for
       * returning tile JSON for the given <code>level</code> and <code>offset</code>.
       *
       * @callback datasourceFunction
       * @param {number} level - the tile's level
       * @param {number} offset - the tile's offset
       * @param {function} successCallback - success callback function which expects to be given a stringified JSON of the tile
       */

      /**
       * Helper method for adding a plot, shorthand for
       * <code>plotManager.addPlotContainer('plot_container').addDataSeriesPlot(...)</code>.
       *
       * @param {string|number} plotId - A identifier for this plot, unique within the PlotContainer.  Must be a number or a string.
       * @param {datasourceFunction} datasource - function with signature <code>function(level, offset, successCallback)</code> resposible for returning tile JSON for the given <code>level</code> and <code>offset</code>
       * @param {string} plotContainerElementId - the DOM element ID for the container div into which this plot should be added
       * @param {string} yAxisElementId - the DOM element ID for the container div holding this plot's Y axis
       * @param {number} [minValue=0] - the minimum initial value for the Y axis (if the Y axis is created for this plot). Defaults to 0 if undefined, <code>null</code>, or non-numeric.
       * @param {number} [maxValue=100] - the maximum initial value for the Y axis (if the Y axis is created for this plot). Defaults to 100 if undefined, <code>null</code>, or non-numeric.
       * @param {Object} [style] - the style object. A default style is used if undefined, null, or not an object.
       * @param {boolean} [isLocalTime=false] - whether the plot's data uses local time. Defaults to false (UTC).
       *
       * @see org.bodytrack.grapher.PlotContainer#addDataSeriesPlot
       */
      this.addDataSeriesPlot = function(plotId, datasource, plotContainerElementId, yAxisElementId, minValue, maxValue, style, isLocalTime) {
         self.addPlotContainer(plotContainerElementId).addDataSeriesPlot(plotId,
                                                                         datasource,
                                                                         yAxisElementId,
                                                                         minValue,
                                                                         maxValue,
                                                                         style,
                                                                         isLocalTime);
      };

      /**
       * Helper function which calculates and returns the desired width of the date axis and all plot containers managed
       * by this PlotManager.
       *
       * @callback widthCalculatorFunction
       * @returns {int} the desired width of the date axis
       */

      /**
       * Set whether the PlotManager should auto-resize the width of the date axis and all plot containers upon resize
       * of the browser window. Although the <code>widthCalculatorFunction</code> function is optional, it must be
       * provided at least once (either here or via {@link #setWidthCalculator}) in order for auto-resizing to do
       * anything.  After setting it, you are then free to call this function with only the first argument to toggle
       * auto-resizing.  If the second argument is undefined <code>null</code>, or not a function, the stored function
       * will not be changed.
       *
       * @param {boolean} willAutoResizeWidth - whether the PlotManager should auto resize the width of the date axis
       * and all plot containers upon resize of the browser window.
       * @param {widthCalculatorFunction} [widthCalculatorFunction] - function which calculates and returns the desired width of the date axis
       */
      this.setWillAutoResizeWidth = function(willAutoResizeWidth, widthCalculatorFunction) {
         isWindowWidthResizeListeningEnabled = willAutoResizeWidth;

         if (typeof widthCalculatorFunction === 'function') {
            widthCalculator = widthCalculatorFunction;
         }

         if (isWindowWidthResizeListeningEnabled) {
            updateWidth();
         }
      };

      /**
       * Sets the width calculator if the given <code>widthCalculatorFunction</code> is a function.  Otherwise, sets
       * the calculator to <code>null</code>.
       *
       * @param widthCalculatorFunction
       */
      this.setWidthCalculator = function(widthCalculatorFunction) {
         if (typeof widthCalculatorFunction === 'function') {
            widthCalculator = widthCalculatorFunction;
         }
         else {
            widthCalculator = null;
         }
      };

      /**
       * Sets the width of the date axis and all plot containers to the given width.
       *
       * @param {int} newDesiredWidth - the new width
       */
      this.setWidth = function(newDesiredWidth) {
         dateAxis.setWidth(newDesiredWidth);

         // update the width of the PlotContainers
         self.forEachPlotContainer(function(plotContainer) {
            plotContainer.setWidth(newDesiredWidth);
         });
      };

      var updateWidth = function() {
         if (isWindowWidthResizeListeningEnabled && widthCalculator != null) {
            self.setWidth(widthCalculator());
         }
      };

      // the "constructor"
      (function() {
         dateAxis = new org.bodytrack.grapher.DateAxis(dateAxisElementId);

         // if the user didn't specify the initial visible time range, default to showing the past 24 hours
         if (!isNumeric(minTimeSecs) || !isNumeric(maxTimeSecs)) {
            // default the date axis to the last 24 hours
            maxTimeSecs = Date.now() / 1000;
            minTimeSecs = maxTimeSecs - (24 * 60 * 60);
         }

         // set the initial time range for the date axis
         dateAxis.setRange(minTimeSecs, maxTimeSecs);

         // set up window resize listener
         $(window).resize(updateWidth);
      })();
   };
})();