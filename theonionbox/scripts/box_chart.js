function box_chart(options)
{
    // to ensure that the new chartOptions (used for rendering) are handled correctly
    if (options.timeLabelLeftAlign === void 0) { options.timeLabelLeftAlign = false;}
    if (options.timeLabelSeparation === void 0) { options.timeLabelSeparation = 0;}

    SmoothieChart.call(this, options);

    if (options.yMinFormatter == null) {
        this.options.yMinFormatter = null;
    }

    if (options.yMaxFormatter == null) {
        this.options.yMaxFormatter = null;
    }

}

box_chart.prototype = new SmoothieChart();

// Alternative resizing method ... as the original code didn't work!
box_chart.prototype.resize = function() {

    // we're ignoring the "enableDpiScaling" option
    if (!window)
        return;

    // access the true (= computed) style as rendered in the page
    var cstyle = window.getComputedStyle(this.canvas, null);

    // check if both "width" values are the same
    var width = parseInt(cstyle.width);
    var att_width = parseInt(this.canvas.getAttribute('width'));    // this is the canvas internal width

    if (att_width != width)
    {
        //if not, align them!
        this.canvas.setAttribute('width', width.toString());
    }

    // check if both "height" values are the same
    var height = parseInt(cstyle.height);
    var att_height = parseInt(this.canvas.getAttribute('height'));    // this is the canvas internal height

    //console.log(att_height + " " + height);

    if (att_height != height)
    {
        //if not, align them!
        this.canvas.setAttribute('height', height.toString());
    }

    /*
    // THIS is the original Code
    // ... that doesn't work!!
    if (!this.options.enableDpiScaling || !window || window.devicePixelRatio === 1)
    { return; }

    var dpr = window.devicePixelRatio;
    var width = parseInt(this.canvas.getAttribute('width'));
    var height = parseInt(this.canvas.getAttribute('height'));

    if (!this.originalWidth || (Math.floor(this.originalWidth * dpr) !== width)) {
      this.originalWidth = width;
      this.canvas.setAttribute('width', (Math.floor(width * dpr)).toString());
      this.canvas.style.width = width + 'px';
      this.canvas.getContext('2d').scale(dpr, dpr);
    }


    if (!this.originalHeight || (Math.floor(this.originalHeight * dpr) !== height)) {
      this.originalHeight = height;
      this.canvas.setAttribute('height', (Math.floor(height * dpr)).toString());
      this.canvas.style.height = height + 'px';
      this.canvas.getContext('2d').scale(dpr, dpr);
    }
    */
};

/**
*    Added for TOB
*    Method to alter the delay on the fly
*/
box_chart.prototype.setDelay = function(delayMillis)
{
    this.delay = delayMillis;
};

// adaptation of the original smoothie code to allow for left-aligning the time labels
// rather than right-aligning (as it's the smoothie standard)

// This implementation supports two additional chartOptions:
// timeLabelLeftAlign = false;  true to RightAlign
// timeLabelSeparation = 0;     px, to alter the distance between vertical grid line & label

box_chart.prototype.render = function(canvas, time) {

    // no change from here ...
    var nowMillis = new Date().getTime();

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

    this.resize();

    this.lastRenderTimeMillis = nowMillis;

    canvas = canvas || this.canvas;
    time = time || nowMillis - (this.delay || 0);

    // Round time down to pixel granularity, so motion appears smoother.
    time -= time % this.options.millisPerPixel;

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

    this.updateValueRange();

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
        context.stroke();
        context.closePath();
    }
    // inserted to draw 'weekly', 'monthly' lines
    else if (chartOptions.grid.timeDividers) {

        var start_time = 0;

        if (chartOptions.grid.timeDividers == 'weekly') {
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
            }
        }
        else if (chartOptions.grid.timeDividers == 'monthly') {

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
            }
        }
        else if (chartOptions.grid.timeDividers == 'yearly') {

            this_year = new Date(time);
            this_year.setMinutes(0);
            this_year.setHours(0);
            this_year.setDate(1);
            this_year.setMonth(1);

            start_time = this_year.getTime();

            var next_time_div = function (t) {
                var ny = new Date(t);
                ny.setFullYear(ny.getFullYear() - 1);
                return ny.getTime();
            }
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
    // Bounding rectangle.
    if (chartOptions.grid.borderVisible) {
      context.beginPath();
      context.strokeRect(0, 0, dimensions.width, dimensions.height);
      context.closePath();
    }
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
        if (y_data != null) {
            y = valueToYPixel(y_data);
        } else {
            has_null = true;
        }

        // console.log(x + ", " + y);

        if (i === 0) {
          firstX = x;
          y = (y == null ? 0 : y)
          context.moveTo(x, y);
        } else if (y != null) {

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

      if (dataSet.length > 1) {
        if (seriesOptions.fillStyle && !has_null) {
          // Close up the fill region.
          context.lineTo(dimensions.width + seriesOptions.lineWidth + 1, lastY);
          context.lineTo(dimensions.width + seriesOptions.lineWidth + 1, dimensions.height + seriesOptions.lineWidth + 1);
          context.lineTo(firstX, dimensions.height + seriesOptions.lineWidth);
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

    // Draw the axis values on the chart.
    if (!chartOptions.labels.disabled && !isNaN(this.valueRange.min) && !isNaN(this.valueRange.max)) {

        if (chartOptions.yMaxFormatter) {
            var maxValueString = chartOptions.yMaxFormatter(this.valueRange.max, chartOptions.labels.precision);
        }
        if (chartOptions.yMinFormatter) {
            var minValueString = chartOptions.yMinFormatter(this.valueRange.min, chartOptions.labels.precision);
        }
        if (maxValueString) {
            var labelPos = chartOptions.scrollBackwards ? 0 : dimensions.width - context.measureText(maxValueString).width - 2;
        }
        else if (minValueString) {
            var labelPos = chartOptions.scrollBackwards ? 0 : dimensions.width - context.measureText(maxValueString).width - 2;
        }
        else {
            return;
        }
        context.fillStyle = chartOptions.labels.fillStyle;
        if (maxValueString) {
            context.fillText(maxValueString, labelPos, chartOptions.labels.fontSize);
        }
        if (minValueString) {
            context.fillText(minValueString, labelPos, dimensions.height - 2);
        }
    }

    // ... to here!
    // The code above (up to here) wasn't changed at all!

    // Below is an adaptation to left-align the timestamps rather that right-align
    // (as the original implementation does)

    // Display timestamps along x-axis at the bottom of the chart.
    if (chartOptions.timestampFormatter && vertical_dividers.length > 0) {
      var textUntilX = chartOptions.scrollBackwards
        ? context.measureText(minValueString).width
        : dimensions.width - context.measureText(minValueString).width + 4;

      var vd_length = vertical_dividers.length;

      for (var i = 0; i < vd_length; i++) {

        t = vertical_dividers[i];

        var gx = timeToXPixel(t);
        // Only draw the timestamp if it won't overlap with the previously drawn one.
        if ((!chartOptions.scrollBackwards && gx < textUntilX) || (chartOptions.scrollBackwards && gx > textUntilX))  {
          // Formats the timestamp based on user specified formatting function
          // SmoothieChart.timeFormatter function above is one such formatting option
          var tx = new Date(t),
            ts = chartOptions.timestampFormatter(tx),
            tsWidth = context.measureText(ts).width;

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
            context.fillText(ts, gx + chartOptions.timeLabelSeparation, dimensions.height - 2);
          } else {
            context.fillText(ts, gx - chartOptions.timeLabelSeparation - tsWidth, dimensions.height - 2);
          }

        }
      }
    }

    context.restore(); // See .save() above.

    return;
  };


/**
* Removes all <code>TimeSeries</code> from the chart.
*/
box_chart.prototype.removeAllTimeSeries = function() {

    while (this.seriesSet.length > 0)
    {
        this.removeTimeSeries(this.seriesSet[0].timeSeries)
    }

};

/**
* update the chart with one call
*/
box_chart.prototype.setDisplay = function(options) {

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
        }
    }
}

function box_timeseries(options)
{
    // to ensure that the new chartOptions (used for rendering) are handled correctly
    if (options.dontDropOldData === void 0) { options.dontDropOldData = false;}

    TimeSeries.call(this, options);
}

box_timeseries.prototype = new TimeSeries();

box_timeseries.prototype.dropOldData = function(oldestValidTime, maxDataSetLength) {

    if (this.options.dontDropOldData) { return; }
    TimeSeries.prototype.dropOldData.call(this, oldestValidTime, maxDataSetLength);
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