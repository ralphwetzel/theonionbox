function box_chart(options)
{
    // to ensure that the new chartOptions (used for rendering) are handled correctly
    if (options.timeLabelLeftAlign === void 0) { options.timeLabelLeftAlign = false;}
    if (options.timeLabelSeparation === void 0) { options.timeLabelSeparation = 0;}

    SmoothieChart.call(this, options);
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
    // Vertical (time) dividers.
    if (chartOptions.grid.millisPerLine > 0) {
      context.beginPath();
      for (var t = time - (time % chartOptions.grid.millisPerLine);
           t >= oldestValidTime;
           t -= chartOptions.grid.millisPerLine) {
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
      var firstX = 0, lastX = 0, lastY = 0;
      for (var i = 0; i < dataSet.length && dataSet.length !== 1; i++) {
        var x = timeToXPixel(dataSet[i][0]),
            y = valueToYPixel(dataSet[i][1]);

        if (i === 0) {
          firstX = x;
          context.moveTo(x, y);
        } else {
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
              context.lineTo(x,lastY);
              context.lineTo(x,y);
              break;
            }
          }
        }

        lastX = x; lastY = y;
      }

      if (dataSet.length > 1) {
        if (seriesOptions.fillStyle) {
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
      var maxValueString = chartOptions.yMaxFormatter(this.valueRange.max, chartOptions.labels.precision),
          minValueString = chartOptions.yMinFormatter(this.valueRange.min, chartOptions.labels.precision),
          labelPos = chartOptions.scrollBackwards ? 0 : dimensions.width - context.measureText(maxValueString).width - 2;
      context.fillStyle = chartOptions.labels.fillStyle;
      context.fillText(maxValueString, labelPos, chartOptions.labels.fontSize);
      context.fillText(minValueString, labelPos, dimensions.height - 2);
    }

    // ... to here!
    // The code above (up to here) wasn't changed at all!

    // Below is an adaptation to left-align the timestamps rather that right-align
    // (as the original implementation does)

    // Display timestamps along x-axis at the bottom of the chart.
    if (chartOptions.timestampFormatter && chartOptions.grid.millisPerLine > 0) {
      var textUntilX = chartOptions.scrollBackwards
        ? context.measureText(minValueString).width
        : dimensions.width - context.measureText(minValueString).width + 4;
      for (var t = time - (time % chartOptions.grid.millisPerLine);
           t >= oldestValidTime;
           t -= chartOptions.grid.millisPerLine) {
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