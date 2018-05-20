
  var Util = {
    extend: function() {
      arguments[0] = arguments[0] || {};
      for (var i = 1; i < arguments.length; i++)
      {
        for (var key in arguments[i])
        {
          if (arguments[i].hasOwnProperty(key))
          {
            if (typeof(arguments[i][key]) === 'object') {
              if (arguments[i][key] instanceof Array) {
                arguments[0][key] = arguments[i][key];
              } else {
                arguments[0][key] = Util.extend(arguments[0][key], arguments[i][key]);
              }
            } else {
              arguments[0][key] = arguments[i][key];
            }
          }
        }
      }
      return arguments[0];
    },
    binarySearch: function(data, value) {
      var low = 0,
          high = data.length;
      while (low < high) {
        var mid = (low + high) >> 1;
        if (value < data[mid][0])
          high = mid;
        else
          low = mid + 1;
      }
      return low;
    }
  };



function isElementOutOfViewport(el) {

    //special bonus for those using jQuery
    if (typeof jQuery === "function" && el instanceof jQuery) {
        el = el[0];
    }

    var rect = el.getBoundingClientRect();

    // extending the screen size to trigger the chart rendering
    // short prior entering into the viewport
    var margin = 100;

    outOfViewport =
        rect.bottom <= -margin ||
        rect.right <= -margin ||
        rect.top >= (window.innerHeight + margin || document.documentElement.clientHeight + margin) ||
        rect.left >= (window.innerWidth + margin|| document.documentElement.clientWidth + margin);

    return outOfViewport;
}

function boxChart(options)
{
    options = (options || SmoothieChart.defaultChartOptions);

    // to ensure that the new chartOptions (used for rendering) are handled correctly
    if (options.timeLabelLeftAlign === void 0) { options.timeLabelLeftAlign = false;}
    if (options.timeLabelSeparation === void 0) { options.timeLabelSeparation = 0;}
    if (options.grid.strokeStyleHor === void 0) { options.grid.strokeStyleHor = '#d4d4d4';}
/*    if (options.title === void 0) { options.title = {text: '',
                                                    fontSize: 16,
                                                    fontFamily: 'LatoLatinWeb',
                                                    fadeIn: false,
                                                    fadeAway: false,
                                                    backFillStyle: 'rgba(255, 255, 255, 0.5)',
                                                    backStrokeStyle: '#ffffff',
                                                    fillStyle: '#000000',
                                                    width: 0};
    }*/

    SmoothieChart.call(this, options);

    if (options.yMinFormatter === null) {
        this.options.yMinFormatter = null;
    }

    if (options.yMaxFormatter === null) {
        this.options.yMaxFormatter = null;
    }

    // options.enableDpiScaling = true;
    //console.log(this.mousemove);

    // Flag to size the chart to the dimensions of the parent element
    this.options.sizeToParent = true;

    this.mousemove = this.mousemove.bind(this);
    this.mouseout = SmoothieChart.prototype.mouseout.bind(this);
}

boxChart.prototype = new SmoothieChart();

boxChart.prototype.getTooltipEl = function () {
    // Create the tool tip element lazily
    if (!this.tooltipEl) {
        this.tooltipEl = document.createElement('div');
        this.tooltipEl.className = 'smoothie-chart-tooltip';
        this.tooltipEl.style.position = 'absolute';
        this.tooltipEl.style.display = 'none';
        this.tooltipEl.style.zIndex = '5';      // this is different!
        document.body.appendChild(this.tooltipEl);
    }
    return this.tooltipEl;
};

boxChart.prototype.updateTooltip = function () {
    var el = this.getTooltipEl();

    if (!this.mouseover || !this.options.tooltip) {
      el.style.display = 'none';
      return;
    }

    var time = this.lastChartTimestamp;

    // x pixel to time
    var t = this.options.scrollBackwards
      ? time - this.mouseX * this.options.millisPerPixel
      : time - (this.canvas.offsetWidth - this.mouseX) * this.options.millisPerPixel;

    var data = [];

     // For each data set...
    for (var d = 0; d < this.seriesSet.length; d++) {
      var timeSeries = this.seriesSet[d].timeSeries;
      if (timeSeries.disabled) {
          continue;
      }

      // find datapoint closest to time 't'
      var closeIdx = Util.binarySearch(timeSeries.data, t);
      if (closeIdx > 0 &&
          closeIdx < timeSeries.data.length &&
          Math.abs(timeSeries.data[closeIdx][0] - t) < this.options.millisPerPixel * 2) {
        data.push({ series: this.seriesSet[d], index: closeIdx, value: timeSeries.data[closeIdx][1] });
      }
    }

    if (data.length) {
      el.innerHTML = this.options.tooltipFormatter.call(this, t, data);
      el.style.display = 'block';
    } else {
      el.style.display = 'none';
    }
  };

  boxChart.prototype.mousemove = function (evt) {
    this.mouseover = true;
    this.mouseX = evt.offsetX;
    this.mouseY = evt.offsetY;
    this.mousePageX = evt.pageX;
    this.mousePageY = evt.pageY;

    var el = this.getTooltipEl();
    el.style.top = Math.round(this.mousePageY + 15) + 'px';
    el.style.left = Math.round(this.mousePageX + 15) + 'px';
    this.updateTooltip();
  };

/////
// Customized resize function to respect the size of the parent container
// as well as the DPI scaling of the screen

boxChart.prototype.resize = function() {

    // To ensure that this works as expected, canvas elements have to have
    // the style="vertical-align: middle" assigned!

    if (!window)
        return false;

    var haveResized = false;

    // Create the second canvas for double buffering
    if (!this.backupCanvas) {
        this.backupCanvas = document.createElement('canvas');
        haveResized = true;
    }

    //return haveResized;

    var width, height;

    if (this.options.sizeToParent) {
        if (!this.css_style_parent) {
            this.css_style_parent = window.getComputedStyle(this.canvas.parentNode);
        }
        width = parseFloat(this.css_style_parent.getPropertyValue('width'));
        height = parseFloat(this.css_style_parent.getPropertyValue('height'));
    }
    else {
        if (!this.css_style) {
            this.css_style = window.getComputedStyle(this.canvas);
        }
        width = parseFloat(this.css_style.getPropertyValue('width'));
        height = parseFloat(this.css_style.getPropertyValue('height'));
    }

    var dpr = this.options.enableDpiScaling ? window.devicePixelRatio : 1;
    var dprWidth = parseFloat(this.canvas.getAttribute('width'));
    var dprHeight = parseFloat(this.canvas.getAttribute('height'));

    if (!this.originalWidth || (Math.floor(this.originalWidth * dpr) !== dprWidth || this.originalWidth !== width)) {
        this.originalWidth = width;
        this.canvas.setAttribute('width', (Math.floor(width * dpr)).toString());
        this.canvas.style.width = width + 'px';
        this.canvas.getContext('2d').scale(dpr, dpr);

        this.backupCanvas.setAttribute('width', (Math.floor(width * dpr)).toString());
        this.backupCanvas.style.width = width + 'px';
        this.backupCanvas.getContext('2d').scale(dpr, dpr);

        haveResized = true;
    }

    if (!this.originalHeight || (Math.floor(this.originalHeight * dpr) !== dprHeight || this.originalHeight !== height)) {
      this.originalHeight = height;
      this.canvas.setAttribute('height', (Math.floor(height * dpr)).toString());
      this.canvas.style.height = height + 'px';
      this.canvas.getContext('2d').scale(dpr, dpr);

      this.backupCanvas.setAttribute('height', (Math.floor(height * dpr)).toString());
      this.backupCanvas.style.height = height + 'px';
      this.backupCanvas.getContext('2d').scale(dpr, dpr);

      haveResized = true;
    }

    return haveResized;

  };


/**
*    Added for TOB
*    Method to alter the delay on the fly
*/
boxChart.prototype.setDelay = function(delayMillis)
{
    this.delay = delayMillis;
};

// patched to operate on bounds respecting the oldestValidTime - frame

boxChart.prototype.updateValueRange = function() {
    // Calculate the current scale of the chart, from all time series.
    var chartOptions = this.options,
        chartMaxValue = Number.NaN,
        chartMinValue = Number.NaN;
        // chartMaxValue = 1,
        //chartMinValue = -1;

    var _valueRange = this.valueRange;
    var _currentValueRange = this.currentValueRange;
    var _isAnimatingScale = this.isAnimatingScale;
    var _currentVisMinValue = this.currentVisMinValue;

    var rangeUpdated = false;

    for (var d = 0; d < this.seriesSet.length; d++) {
        // TODO(ndunn): We could calculate / track these values as they stream in.

        // original code:
        // var timeSeries = this.seriesSet[d].timeSeries;

        var timeSeries = {maxValue: NaN, minValue: NaN};

        if (this.seriesSet[d].bounds && !isNaN(this.seriesSet[d].bounds.maxValue)) {
            timeSeries.maxValue = this.seriesSet[d].bounds.maxValue;
        } else {
            timeSeries.maxValue = this.seriesSet[d].timeSeries.maxValue;
        }

        if (this.seriesSet[d].bounds && !isNaN(this.seriesSet[d].bounds.minValue)) {
            timeSeries.minValue = this.seriesSet[d].bounds.minValue;
        } else {
            timeSeries.minValue = this.seriesSet[d].timeSeries.minValue;
        }

        if (!isNaN(timeSeries.maxValue)) {
            chartMaxValue = !isNaN(chartMaxValue) ? Math.max(chartMaxValue, timeSeries.maxValue) : timeSeries.maxValue;
        }

        if (!isNaN(timeSeries.minValue)) {
            chartMinValue = !isNaN(chartMinValue) ? Math.min(chartMinValue, timeSeries.minValue) : timeSeries.minValue;
        }

        // The 'changed' flag is set whenever the data of a TimeSeries object is modified.
        // It will be reset to 'false' only after completion of the rendering algorithm for this TimeSeries
        // ... to ensure that the modifications have been rendered (at least once).
        if (this.seriesSet[d].changed) {
            rangeUpdated = true;
        }


    }

    // Scale the chartMaxValue to add padding at the top if required
    if (chartOptions.maxValue != null) {
      chartMaxValue = chartOptions.maxValue;
    } else {
      chartMaxValue *= chartOptions.maxValueScale;
    }

    // Set the minimum if we've specified one
    if (chartOptions.minValue != null) {
      chartMinValue = chartOptions.minValue;
    } else {
      chartMinValue -= Math.abs(chartMinValue * chartOptions.minValueScale - chartMinValue);
    }

    // If a custom range function is set, call it
    if (this.options.yRangeFunction) {
      var range = this.options.yRangeFunction({min: chartMinValue, max: chartMaxValue});
      chartMinValue = range.min;
      chartMaxValue = range.max;
    }

    if (!isNaN(chartMaxValue) && !isNaN(chartMinValue)) {
      var targetValueRange = chartMaxValue - chartMinValue;
      var valueRangeDiff = (targetValueRange - this.currentValueRange);
      var minValueDiff = (chartMinValue - this.currentVisMinValue);
      this.isAnimatingScale = Math.abs(valueRangeDiff) > 0.1 || Math.abs(minValueDiff) > 0.1;
      this.currentValueRange += chartOptions.scaleSmoothing * valueRangeDiff;
      this.currentVisMinValue += chartOptions.scaleSmoothing * minValueDiff;
    }

    this.valueRange = { min: chartMinValue, max: chartMaxValue };

    // The following calculations are necessary to compare the floats for equality.
    // We regard a difference smaller than .001% as being equal.
    var very_small = Math.pow(10, -5);

    function is_not_equal(value, comparator) {
        return (Math.abs(value - comparator) / Math.abs(value)) > very_small;
    }

    rangeUpdated =
        typeof(_valueRange) !== 'undefined'
            ? (is_not_equal(this.valueRange.min, _valueRange.min) ? true
                : is_not_equal(this.valueRange.max, _valueRange.max) ? true
                    : rangeUpdated)
            : rangeUpdated;

    rangeUpdated = this.isAnimatingScale ? true
        : is_not_equal(this.currentValueRange, _currentValueRange) ? true
            : is_not_equal(this.currentVisMinValue, _currentVisMinValue) ? true
                : rangeUpdated;

    return rangeUpdated;

  };

// Prepare the chart for rendering
// Call 'start' to launch!
boxChart.prototype.prepare = function(canvas, delayMillis) {
    this.canvas = canvas;
    this.delay = delayMillis;
    // this.start();
  };

/*   /!**
    * Starts the animation of this chart.
    *!/
   boxChart.prototype.start = function() {
     if (this.frame) {
       // We're already running, so just return
       return;
            }

     this.canvas.addEventListener('mousemove', this.mousemove);
     this.canvas.addEventListener('mouseout', this.mouseout);

     // Renders a frame, and queues the next frame for later rendering
     var animate = function() {
       this.frame = SmoothieChart.AnimateCompatibility.requestAnimationFrame(function() {
         this.render();
         animate();
       }.bind(this));
     }.bind(this);

 /!*
     for (var sset in this.seriesSet)
          {
         if (sset.resetBoundsFunction) {
             sset.resetBoundsFunction();
         }
     }
 *!/

     animate();
     };*/

// adaptation of the original smoothie code to allow for left-aligning the time labels
// rather than right-aligning (as it's the smoothie standard)

// This implementation supports two additional chartOptions:
// timeLabelLeftAlign = false;  true to RightAlign
// timeLabelSeparation = 0;     px, to alter the distance between vertical grid line & label

boxChart.prototype.render = function(canvas, time) {

    var nowMillis = new Date().getTime();
    var y0;

    if (!this.isAnimatingScale) {
      // We're not animating. We can use the last render time and the scroll speed to work out whether
      // we actually need to paint anything yet. If not, we can return immediately.

      // Render at least every 1/6th of a second. The canvas may be resized, which there is
      // no reliable way to detect.
      var maxIdleMillis = Math.min(1000/6, this.options.millisPerPixel);

      if (nowMillis - this.lastRenderTimeMillis < maxIdleMillis) {
        return;
      }
    }

    // Chart MUST be rendered if resized!
    var mustRender = this.resize();
    this.updateTooltip();

    canvas = canvas || this.canvas;
    time = time || nowMillis - (this.delay || 0);

    // Round time down to pixel granularity, so motion appears smoother.
    time -= time % this.options.millisPerPixel;

    this.lastChartTimestamp = time;

    var context = canvas.getContext('2d'),
        chartOptions = this.options,
        dimensions = { top: 0, left: 0, width: canvas.clientWidth, height: canvas.clientHeight },
        // Calculate the threshold time for the oldest data points.
        oldestValidTime = time - (dimensions.width * chartOptions.millisPerPixel),
        valueToYPixel = function(value) {
          var offset = value - this.currentVisMinValue;
          return this.currentValueRange === 0
            ? dimensions.height
            : dimensions.height - (Math.round((offset / this.currentValueRange) * dimensions.height));
        }.bind(this),
        timeToXPixel = function(t) {
          if(chartOptions.scrollBackwards) {
            return Math.round((time - t) / chartOptions.millisPerPixel);
          }
          return Math.round(dimensions.width - ((time - t) / chartOptions.millisPerPixel));
        };


    // to allow 'resetBounds' based on the visible timeframe
    this.oldestValidTime = oldestValidTime;

    // Chart should be rendered, if there was a change of data
    var rangeChanged = this.updateValueRange();

    // Optimisation to prevent calculations if canvas is not visible in current viewport.
/*    var nowOutOfView = isElementOutOfViewport(this.canvas);
    if (typeof(this.outOfView) === 'undefined') {
        this.outOfView = false;
    }

    // if chart MUST not be rendered and it is out of the viewport, we skip the rest.
    if (!mustRender && this.outOfView === nowOutOfView  && nowOutOfView === true) {
        return;
    }
    this.outOfView = nowOutOfView;

    // if we're still within the millisPerPixel interval...
    if (nowMillis - this.lastRenderTimeMillis < this.options.millisPerPixel) {
        // check if anything has changed; if not: clip the image from the backup!
        if (!rangeChanged && !mustRender && !this.isAnimatingScale) {
            var width = parseInt(this.css_style.getPropertyValue('width'));
            var height = parseInt(this.css_style.getPropertyValue('height'));
            context.drawImage(this.backupCanvas, 0, 0, undefined, undefined, 0, 0, width, height);
            return;
        }
    }
*/
    // Ok. There's no other choice rather then to render the chart. So let's do!
    this.lastRenderTimeMillis = nowMillis;

    context.font = chartOptions.labels.fontSize + 'px ' + chartOptions.labels.fontFamily;

    // Save the state of the canvas context, any transformations applied in this method
    // will get removed from the stack at the end of this method when .restore() is called.
    context.save();

    // Move the origin.
    context.translate(dimensions.left, dimensions.top);

    // Create a clipped rectangle - anything we draw will be constrained to this rectangle.
    // This prevents the occasional pixels from curves near the edges overrunning and creating
    // screen cheese (that phrase should need no explanation).
    context.beginPath();
    context.rect(0, 0, dimensions.width, dimensions.height);
    context.clip();

    // Clear the working area.
    context.save();
    context.fillStyle = chartOptions.grid.fillStyle;
    context.clearRect(0, 0, dimensions.width, dimensions.height);
    context.fillRect(0, 0, dimensions.width, dimensions.height);
    context.restore();

    // Grid lines...
    context.save();
    context.lineWidth = chartOptions.grid.lineWidth;

    context.strokeStyle = chartOptions.grid.strokeStyleHor;
    // Horizontal (value) dividers.
    for (var v = 1; v < chartOptions.grid.verticalSections; v++) {
      var gy = Math.round(v * dimensions.height / chartOptions.grid.verticalSections);
      if (chartOptions.grid.sharpLines) {
        gy -= 0.5;
      }
      context.beginPath();
      context.moveTo(0, gy);
      context.lineTo(dimensions.width, gy);
      context.stroke();
      context.closePath();
    }


    context.strokeStyle = chartOptions.grid.strokeStyle;

    var vertical_dividers = [];

    // Vertical (time) dividers.
    if (chartOptions.grid.millisPerLine > 0) {
        context.beginPath();
        for (var t = time - (time % chartOptions.grid.millisPerLine);
            t >= oldestValidTime;
            t -= chartOptions.grid.millisPerLine) {

            vertical_dividers.push(t);

            var gx = timeToXPixel(t);
            if (chartOptions.grid.sharpLines) {
                gx -= 0.5;
            }
            context.moveTo(gx, 0);
            context.lineTo(gx, dimensions.height);
        }

        // to allow rendering of the vertical divider label
        // even when the divider scolled out of view
        vertical_dividers.push(t);

        context.stroke();
        context.closePath();
    }
    // inserted to draw 'weekly', 'monthly' lines
    else if (chartOptions.grid.timeDividers) {

        var start_time = 0;

        if (chartOptions.grid.timeDividers === 'weekly') {
            // http://stackoverflow.com/questions/4156434/javascript-get-the-first-day-of-the-week-from-current-date
            function getMonday( date ) {
                var day = date.getDay() || 7;
                if( day !== 1 )
                    date.setHours(-24 * (day - 1));
                return date;
            }

            var this_monday = new Date(time);
            this_monday = getMonday(this_monday);
            this_monday.setHours(0);
            this_monday.setMinutes(0);
            this_monday.setSeconds(0);

            start_time = this_monday.getTime();

            var next_time_div = function (t) {
                return t - 1000 * 60 * 60 * 24 * 7;
            };
        }
        else if (chartOptions.grid.timeDividers === 'monthly') {

            this_month = new Date(time);
            this_month.setMinutes(0);
            this_month.setHours(0);
            this_month.setDate(1);

            start_time = this_month.getTime();

            var next_time_div = function (t) {
                var nm = new Date(t);
                var cm = nm.getMonth();
                if (cm) {
                    nm.setMonth(cm - 1);
                }
                else {
                    nm.setFullYear(nm.getFullYear() - 1);
                    nm.setMonth(11);
                }

                return nm.getTime();
            };
        }
        else if (chartOptions.grid.timeDividers === 'yearly') {

            this_year = new Date(time);
            this_year.setMinutes(0);
            this_year.setHours(0);
            this_year.setDate(1);
            this_year.setMonth(0);

            start_time = this_year.getTime();

            var next_time_div = function (t) {
                var ny = new Date(t);
                ny.setFullYear(ny.getFullYear() - 1);
                return ny.getTime();
            };
        }

        if (start_time) {

            context.beginPath();
            for (var t = start_time;
                t >= oldestValidTime;
                t = next_time_div(t)) {
                var gx = timeToXPixel(t);

                vertical_dividers.push(t);

                if (chartOptions.grid.sharpLines) {
                    gx -= 0.5;
                }

                context.moveTo(gx, 0);
                context.lineTo(gx, dimensions.height);
            }
            context.stroke();
            context.closePath();

        }

    }

/*    // Bounding rectangle.
    if (chartOptions.grid.borderVisible) {

        var br = $(this.canvas).css('border-radius');
        br = parseInt(br, 10);
        context.lineWidth = 2;

        if (br === 0) {
          context.beginPath();
          context.strokeRect(0, 0, dimensions.width, dimensions.height);
          context.closePath();
        } else {
            var dw = dimensions.width;
            var dh = dimensions.height;
            context.beginPath();
            context.moveTo(br, 0);
            context.lineTo(dw - br, 0);
            context.quadraticCurveTo(dw, 0, dw, br);
            context.lineTo(dw, dh - br);
            context.quadraticCurveTo(dw, dh, dw - br, dh);
            context.lineTo(br, dh);
            context.quadraticCurveTo(0, dh, 0, dh - br);
            context.lineTo(0, br);
            context.quadraticCurveTo(0, 0, br, 0);
            context.closePath();
            context.stroke();
        }
    } */

    context.restore();

    // Draw any horizontal lines...
    if (chartOptions.horizontalLines && chartOptions.horizontalLines.length) {
      for (var hl = 0; hl < chartOptions.horizontalLines.length; hl++) {
        var line = chartOptions.horizontalLines[hl],
            hly = Math.round(valueToYPixel(line.value)) - 0.5;
        context.strokeStyle = line.color || '#ffffff';
        context.lineWidth = line.lineWidth || 1;
        context.beginPath();
        context.moveTo(0, hly);
        context.lineTo(dimensions.width, hly);
        context.stroke();
        context.closePath();
      }
    }

    // For each data set...
    for (var d = 0; d < this.seriesSet.length; d++) {
      context.save();
      var timeSeries = this.seriesSet[d].timeSeries,
          dataSet = timeSeries.data,
          seriesOptions = this.seriesSet[d].options;

        // *****
        // Indicate that we've drawn this at least once!
        this.seriesSet[d].changed = false;
        // *****

      // Delete old data that's moved off the left of the chart.
      timeSeries.dropOldData(oldestValidTime, chartOptions.maxDataSetLength);

      // Set style for this dataSet.
      context.lineWidth = seriesOptions.lineWidth;
      context.strokeStyle = seriesOptions.strokeStyle;
      // Draw the line...
      context.beginPath();
      // Retain lastX, lastY for calculating the control points of bezier curves.
      var firstX = 0, lastX = 0, lastY = 0, has_null = false;
      for (var i = 0; i < dataSet.length && dataSet.length !== 1; i++) {
        var x = timeToXPixel(dataSet[i][0]), y = null;
        var y_data = dataSet[i][1];

        if (y_data !== null) {
            y = valueToYPixel(y_data);
        } else if (seriesOptions.nullTo0 === true) {
            // y = valueToYPixel(-10);  // better than just '0'
            y = valueToYPixel(0);  // we need '0' to ensure propper fill algo
        } else {
            has_null = true;
        }

        // console.log(x + ", " + y);

        if (i === 0) {
          firstX = x;
          // y = (y === null ? -10 : y)
          y = (y === null ? 0 : y)
          context.moveTo(x, y);
        } else if (y !== null) {

          switch (chartOptions.interpolation) {
            case "linear":
            case "line": {
              context.lineTo(x,y);
              break;
            }
            case "bezier":
            default: {
              // Great explanation of Bezier curves: http://en.wikipedia.org/wiki/Bezier_curve#Quadratic_curves
              //
              // Assuming A was the last point in the line plotted and B is the new point,
              // we draw a curve with control points P and Q as below.
              //
              // A---P
              //     |
              //     |
              //     |
              //     Q---B
              //
              // Importantly, A and P are at the same y coordinate, as are B and Q. This is
              // so adjacent curves appear to flow as one.
              //
              context.bezierCurveTo( // startPoint (A) is implicit from last iteration of loop
                Math.round((lastX + x) / 2), lastY, // controlPoint1 (P)
                Math.round((lastX + x)) / 2, y, // controlPoint2 (Q)
                x, y); // endPoint (B)
              break;
            }
            case "step": {
                if (lastY == null) {
                    context.moveTo(x,y);
                } else {
                    context.lineTo(x,lastY);
                    context.lineTo(x,y);
                }
              break;
            }
          }
        }

        lastX = x; lastY = y;
      }

    y0 = valueToYPixel(0);

      if (dataSet.length > 1) {
        if (seriesOptions.fillStyle && !has_null) {
          // Close up the fill region.
          context.lineTo(dimensions.width + seriesOptions.lineWidth + 1, lastY);
          // context.lineTo(dimensions.width + seriesOptions.lineWidth + 1, dimensions.height + seriesOptions.lineWidth + 1);
          // context.lineTo(firstX, dimensions.height + seriesOptions.lineWidth);
          context.lineTo(dimensions.width + seriesOptions.lineWidth + 1, y0);
          context.lineTo(firstX, y0);

          // RDW 20180302
          // context.fillStyle = chartOptions.grid.fillStyle;
          // context.fill();

          context.fillStyle = seriesOptions.fillStyle;
          context.fill();
        }

        if (seriesOptions.strokeStyle && seriesOptions.strokeStyle !== 'none') {
          context.stroke();
        }
        context.closePath();
      }
      context.restore();
    }

    // Draw the y0 - line
    context.save();
    context.lineWidth = chartOptions.grid.lineWidth;
    context.strokeStyle = chartOptions.grid.strokeStyleHor;
    context.beginPath();
    context.moveTo(0, y0);
    context.lineTo(dimensions.width, y0);
    context.stroke();
    context.closePath();
    context.restore();

    var maxValueString = "";
    var minValueString = "";
    var labelPos_max = NaN;
    var labelPos_min = NaN;

    var minValueRect = {left: 0, top: 0, width: 0, height: chartOptions.labels.fontSize};
    var maxValueRect = {left: 0, top: 0, width: 0, height: chartOptions.labels.fontSize};



    // Draw the axis values on the chart.
    if (!chartOptions.labels.disabled && !isNaN(this.valueRange.min) && !isNaN(this.valueRange.max)) {

        if (chartOptions.yMaxFormatter) {
            maxValueString = chartOptions.yMaxFormatter(this.valueRange.max, chartOptions.labels.precision);
            maxValueRect.width = context.measureText(maxValueString).width;
        }
        if (chartOptions.yMinFormatter) {
            minValueString = chartOptions.yMinFormatter(this.valueRange.min, chartOptions.labels.precision);
            minValueRect.width = context.measureText(minValueString).width;
        }
        context.fillStyle = chartOptions.labels.fillStyle;

        // console.log(context.measureText(maxValueString));
        // console.log(minValueString);

        if (maxValueString.length > 0) {
            labelPos_max = chartOptions.scrollBackwards ? 0 : dimensions.width - maxValueRect.width - 2;
            context.fillText(maxValueString, labelPos_max, chartOptions.labels.fontSize);
            maxValueRect.left += labelPos_max;
            maxValueRect.top += chartOptions.labels.fontSize;
        }
        if (minValueString.length > 0) {
            labelPos_min = chartOptions.scrollBackwards ? 0 : dimensions.width - minValueRect.width - 2;
            context.fillText(minValueString, labelPos_min, dimensions.height - 2);
            minValueRect.left += labelPos_min;
            minValueRect.top += dimensions.height - 2;

        }

    }

    // ... to here!
    // The code above (up to here) wasn't changed at all!
    // 20170105 RDW: The statement above meanwhile might not be valid anymore!

    // Below is an adaptation to left-align the timestamps rather that right-align
    // (as the original implementation does)

    function intersect(a, b) {
        return (a.left <= b.left + b.width &&
              b.left <= a.left + a.width &&
              a.top <= b.top + b.height &&
              b.top <= a.top + a.height);
    }


    // Display timestamps along x-axis at the bottom of the chart.
    if (chartOptions.timestampFormatter && vertical_dividers.length > 0) {
      // var textUntilX = chartOptions.scrollBackwards
      //   ? context.measureText(minValueString).width
      //   : dimensions.width - context.measureText(minValueString).width + 4;

      var vd_length = vertical_dividers.length;

      // var tls = chartOptions.timeLabelSeparation;
      // tls *= (chartOptions.scrollBackwards || chartOptions.timeLabelLeftAlign) ? 1 : -1;

      // var textUntilX;

      var textUntilX = (chartOptions.scrollBackwards || chartOptions.timeLabelLeftAlign) ? dimensions.width : 0;


      for (var i = 0; i < vd_length; i++) {

        t = vertical_dividers[i];

        // Formats the timestamp based on user specified formatting function
        // SmoothieChart.timeFormatter function above is one such formatting option
        var tx = new Date(t);
        var ts = chartOptions.timestampFormatter(tx);
        var tsRect = {left: 0, top: 0, width: context.measureText(ts).width, height: chartOptions.labels.fontSize};


        var gx = timeToXPixel(t);
        tsRect.top += y0 - 2;

        if (tsRect.top < tsRect.height) {
            tsRect.top += tsRect.height + 2 * 2;
        }

        if (chartOptions.scrollBackwards || chartOptions.timeLabelLeftAlign) {

            tsRect.left = gx + chartOptions.timeLabelSeparation + 2;

            if ((tsRect.left + tsRect.width) < textUntilX && !intersect(tsRect, minValueRect) && !intersect(tsRect, maxValueRect)) {
                context.fillStyle = chartOptions.labels.fillStyle;
                context.fillText(ts, tsRect.left, tsRect.top);
                textUntilX = tsRect.left + tsRect.width;
            }


        } else {

            tsRect.left = gx - tsRect.width - chartOptions.timeLabelSeparation - 2;

            if ((tsRect.left + tsRect.width) > textUntilX && !intersect(tsRect, minValueRect) && !intersect(tsRect, maxValueRect)) {
                context.fillStyle = chartOptions.labels.fillStyle;
                context.fillText(ts, tsRect.left, tsRect.top);
                textUntilX = tsRect.left + tsRect.width;
            }

        }




/*        // Only draw the timestamp if it won't overlap with the previously drawn one.
        if ((!chartOptions.scrollBackwards && gx < textUntilX) ||
            (chartOptions.scrollBackwards && gx > textUntilX) ||
            () ||
            () )  {


          // Original code:
          // textUntilX = chartOptions.scrollBackwards
          //   ? gx + tsWidth + 2
          //   : gx - tsWidth - 2;

          textUntilX = (chartOptions.scrollBackwards || chartOptions.timeLabelLeftAlign)
            ? gx + tsWidth + chartOptions.timeLabelSeparation + 2
            : gx - tsWidth - chartOptions.timeLabelSeparation - 2;

          context.fillStyle = chartOptions.labels.fillStyle;

          // Original code:
          // if(chartOptions.scrollBackwards) {
          //   context.fillText(ts, gx, dimensions.height - 2);
          // } else {
          //   context.fillText(ts, gx - tsWidth, dimensions.height - 2);
          // }

          if(chartOptions.scrollBackwards || chartOptions.timeLabelLeftAlign) {
            // context.fillText(ts, gx + chartOptions.timeLabelSeparation, dimensions.height - 2);
            context.fillText(ts, gx + chartOptions.timeLabelSeparation, y0 - 2);
          } else {
            // context.fillText(ts, gx - chartOptions.timeLabelSeparation - tsWidth, dimensions.height - 2);
            context.fillText(ts, gx - chartOptions.timeLabelSeparation - tsWidth, y0 - 2);
          }*/


      }
    }

    if (chartOptions.tooltip && this.mouseover === true) {
        //console.log(True);
      // Draw vertical bar to show tooltip position
      context.lineWidth = chartOptions.tooltipLine.lineWidth;
      context.strokeStyle = chartOptions.tooltipLine.strokeStyle;
      context.beginPath();
      context.moveTo(this.mouseX, 0);
      context.lineTo(this.mouseX, dimensions.height);
      context.closePath();
      context.stroke();
      this.updateTooltip();
    }

/*
    // draw the Title
    if (chartOptions.title.text.length > 0) {
        context.font = chartOptions.title.fontSize + 'px ' + chartOptions.title.fontFamily;

        var header_text = chartOptions.title.text;
        var htRect = {left: 0, top: 50,
            width: Math.max(context.measureText(header_text).width, chartOptions.title.width),
            height: chartOptions.title.fontSize};

        htRect.left = (dimensions.width - htRect.width) /2;

        context.fillStyle = chartOptions.title.backFillStyle;
        context.fillRect(htRect.left, htRect.top, htRect.width, htRect.height);
        context.textAlign = "center";
        context.fillStyle = chartOptions.labels.fillStyle;
        context.fillText(header_text, htRect.left, htRect.top);

    }
*/

    context.restore(); // See .save() above.


    // Bounding rectangle.
    if (chartOptions.grid.borderVisible) {

        context.save();

        var br = $(this.canvas).css('border-radius');
        br = parseFloat(br);
        context.lineWidth = 2;

        if (br === 0) {
          context.beginPath();
          context.strokeRect(0, 0, dimensions.width, dimensions.height);
          context.closePath();
        } else {
            var dw = dimensions.width;
            var dh = dimensions.height;
            context.beginPath();
            context.moveTo(br, 0);
            context.lineTo(dw - br, 0);
            context.quadraticCurveTo(dw, 0, dw, br);
            context.lineTo(dw, dh - br);
            context.quadraticCurveTo(dw, dh, dw - br, dh);
            context.lineTo(br, dh);
            context.quadraticCurveTo(0, dh, 0, dh - br);
            context.lineTo(0, br);
            context.quadraticCurveTo(0, 0, br, 0);
            context.closePath();
            context.stroke();
        }
        context.restore();
    }

    // Save the rendered chart to backup to allow clipping for optimisation in the next rendering loop.
    var backupContext = this.backupCanvas.getContext('2d');
    backupContext.drawImage(this.canvas, 0, 0);

    // return;
  };


/**
* Removes all <code>TimeSeries</code> from the chart.
*/
boxChart.prototype.removeAllTimeSeries = function() {

    while (this.seriesSet.length > 0)
    {
        this.removeTimeSeries(this.seriesSet[0].timeSeries);
    }

};

/**
* Adds a <code>TimeSeries</code> to this chart, with optional presentation options.
*
* Presentation options should be of the form (defaults shown):
*
* <pre>
* {
*   lineWidth: 1,
*   strokeStyle: '#ffffff',
*   fillStyle: undefined
* }
* </pre>
*/
boxChart.prototype.addTimeSeries = function(timeSeries, options) {
    var new_series = {timeSeries: timeSeries
                    , options: Util.extend({}, SmoothieChart.defaultSeriesPresentationOptions, options)
                    , bounds: {maxValue: NaN, minValue: NaN}
                    };
    this.seriesSet.push(new_series);

    // set flag to indicate the change of data!
    new_series.changed = true;

    if (timeSeries.options.resetBounds && timeSeries.options.resetBoundsInterval > 0) {
        timeSeries.resetBoundsFunction = function() {
                                            if (timeSeries.checkBounds) {
                                                var frameBounds = timeSeries.checkBounds(this.oldestValidTime);
                                            } else {
                                                timeSeries.resetBounds();
                                                var frameBounds = {
                                                    maxValue: timeSeries.maxValue,
                                                    minValue: timeSeries.minValue
                                                }
                                            }
                                            new_series.bounds = frameBounds;
                                        }.bind(this);
        timeSeries.resetBoundsTimerId = setInterval(timeSeries.resetBoundsFunction, timeSeries.options.resetBoundsInterval);
    }
};



/**
* update the chart with one call
*/
boxChart.prototype.setDisplay = function(options) {

    // copy paste from smoothie.js, from here ...
    var Util = {
        extend: function() {
            arguments[0] = arguments[0] || {};
            for (var i = 1; i < arguments.length; i++) {
                for (var key in arguments[i]) {
                    if (arguments[i].hasOwnProperty(key)) {
                        if (typeof(arguments[i][key]) === 'object') {
                            if (arguments[i][key] instanceof Array) {
                                arguments[0][key] = arguments[i][key];
                            } else {
                                arguments[0][key] = Util.extend(arguments[0][key], arguments[i][key]);
                            }
                        } else {
                            arguments[0][key] = arguments[i][key];
                        }
                    }
                }
            }
            return arguments[0];
        }
    };
    // ... to here!

    this.removeAllTimeSeries();

    this.options = Util.extend({}, this.options, options.chartOptions);
    var tsl = options.timeseries.length;

    for (var i = 0; i < tsl; ++i) {
        var ts = options.timeseries[i];
        if (ts.serie) {
            this.addTimeSeries(ts.serie, ts.options);
            if (ts.options.resetBounds) {
                ts.resetBoundsFunction();
            }
        }
    }

};

function boxTimeSeries(options)
{
    this.options = Util.extend({}, boxTimeSeries.defaultOptions, options);
    TimeSeries.call(this, options);
}

boxTimeSeries.defaultOptions = {
    dontDropOldData: false,
    nullTo0: true
};

boxTimeSeries.prototype = new TimeSeries();

boxTimeSeries.prototype.dropOldData = function(oldestValidTime, maxDataSetLength) {

    if (this.options.dontDropOldData) { return; }
    TimeSeries.prototype.dropOldData.call(this, oldestValidTime, maxDataSetLength);

    // set flag to indicate the change of data!
    this.changed = true;
};

/**
* Recalculate the min/max values for this <code>TimeSeries</code> object.
*
* This function differs from the original as it takes an oldestValidTime - parameter to
* determine the values within a given timeframe.
*
* This causes the graph to scale itself in the y-axis.
*/
boxTimeSeries.prototype.checkBounds = function(oldestValidTime) {

    var i = this.data.length;
    var frameBounds = {maxValue: NaN, minValue: NaN};

    if (i) {
        i--;
        this.maxValue = this.data[i][1];
        this.minValue = this.data[i][1];

        frameBounds.maxValue = this.maxValue;
        frameBounds.minValue = this.minValue;

        while (i > 0) {
            i--;
            var value = this.data[i][1];
            if (value > this.maxValue) {
                this.maxValue = value;
                if (this.data[i][0] >= oldestValidTime) {
                    frameBounds.maxValue = value;
                }
            }
            if (value < this.minValue) {
                this.minValue = value;
                if (this.data[i][0] >= oldestValidTime) {
                    frameBounds.minValue = value;
                }
            }

        }
    } else {
        // No data exists, so set min/max to NaN
        this.maxValue = Number.NaN;
        this.minValue = Number.NaN;
    }

    return frameBounds;
};

/*
function box_display(options) {
    this.options = Util.extend({}, box_display.defaultOptions, options)
}

box_display.defaultOptions = {

    chartOptions: SmoothieChart.defaultChartOptions,
    timeseries: []      // [ {serie: timeserie, options: {}}, {serie: ...}]
}

box_display.prototype.toChart(chart_name) = function() {

    var chart = $(chart_name)

    if (!chart.length) {
        return;
    }

    chart.removeAllTimeSeries();
    chart.mergeOptions(this.options.chartOptions);

    var tsl = this.options.timeseries.length;

    for (var i = 0; i < tsl; ++i) {
        var ts = this.option.timeseries[i];
        if (ts.serie) {
            chart.addTimeSeries(ts.serie, ts.options);
        }
    }
}
*/

boxTimeSeries.prototype.clear = function() {
    // set flag to indicate the change of data!
    this.changed = true;

    TimeSeries.prototype.clear.call(this);
};

boxTimeSeries.prototype.append = function(timestamp, value, sumRepeatedTimeStampValues) {
    // set flag to indicate the change of data!
    this.changed = true;
    TimeSeries.prototype.append.call(this, timestamp, value, sumRepeatedTimeStampValues);
};

