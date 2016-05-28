var RxDiag;
RxDiag = (function () {

    var rxDiag = {};

    // -- public --

    rxDiag.init = function (props, op, input) {
        props = props || {};

        var title = props.title || '...';
        var container = props.container;
        var inputs = Array.prototype.slice.call(arguments, 2);

        var animator = new RxAnimator(title, container, op, inputs)
    };


    function RxAnimator (title, container, op, inputs) {

        // current reference point
        const ref = new Date().getTime();

        var self = this; // for closures

        var delta = (inputs.length - 1) * 60;

        // draw background and initialize draw surface
        this.surface(container, delta);

        // set up ombinator/operator
        this.op = op;

        // inputs eventlines
        inputs.forEach(function (ob, index) {
            self.eventline(50 + index * 60);
        });

        // output eventline
        this.eventline(250 + delta) ;

        // combinator box
        this.combinator(155 + delta, title);


        // projection in time
        var inobs = inputs.map(function (in1) {
            return Rx.Observable.from(in1).flatMap(function (e) {
                if (e.shape == 'complete') {
                    return Rx.Observable.empty().delay(e.tick * 1000);
                } else if (e.shape == 'error') {
                    return Rx.Observable.empty().delay(e.tick * 1000).concat(Rx.Observable.throw(new Error("Die!")));
                } else {
                    return Rx.Observable.just(e).delay(e.tick * 1000);
                }
            });
        });

        // transformation
        var outobs = this.transform(inobs);


        var frame = function() {
            var timestamp = arguments.length == 0 ? new Date().getTime() : arguments[0].timestamp;
            return ((timestamp - ref) / 200).toFixed(0);
        };

        var ex = function(fr, index) {
            return 25 + 10 * fr - (index == undefined ? 0 : index);
        };

        var ey = function() {
            return arguments.length == 0 ? 250 + delta : 50 + arguments[0]*60;
        };

        var ay = function() {
            return arguments.length == 0 ? 130 + inputs.length*60 : 120 + delta;
        };




        // subscribe inputs to projected inputs
        inobs.forEach(function (obs, index) {

            obs.timestamp().subscribe(
                // onNext
                function (i) {
                    var fr = frame(i);
                    var x = ex(fr);
                    var y = ey(index);
                    self.next(x, y, i.value);

                    var y1 = y + 20 + sw;
                    var y2 = ay(index);
                    self.arrow(x, y1, x, y2);
                },
                // onError
                function (e) {
                    var fr = frame();
                    var x = ex(fr);
                    var y = ey(index);
                    self.error(x, y);

                    var y1 = y + 20 + sw;
                    var y2 = ay(index);
                    self.arrow(x, y1, x, y2);
                },
                // onComplete
                function () {
                    var fr = frame();
                    var x = ex(fr);
                    var y = ey(index);
                    self.complete(x, y);

                    var y1 = y + 20 + sw;
                    var y2 = ay(index);
                    self.arrow(x, y1, x, y2);
                }
            );
        });

        // subscribe to output
        outobs.timestamp().subscribe(
            // onNext
            function (i) {
                var fr = frame(i);
                var x = ex(fr);
                var y = ey();
                self.next(ex(fr), ey(), i.value);

                var y1 = ay();
                var y2 = y - 20 - sw;
                self.arrow(x, y1, x, y2);
            },
            // onError
            function (e) {
                var fr = frame();
                var x = ex(fr);
                var y = ey();
                self.error(x, y);

                var y1 = ay();
                var y2 = y - 20 - sw;
                self.arrow(x, y1, x, y2);
            },
            // onComplete
            function () {
                var fr = frame();
                var x = ex(fr);
                var y = ey();
                self.complete(x, y);

                var y1 = ay();
                var y2 = y - 20 - sw;
                self.arrow(x, y1, x, y2);
            }
        );


        //Rx.Observable.empty().delay(15*1000).subscribe(
        //    function (x) {
        //        //
        //    },
        //    function (e) {
        //        //
        //    },
        //    function () {
        //        alert("!");
        //    }
        //);


        //this.inobs.forEach(function (obs, index) {
        //    obs.subscribe(function (e) {
        //        console.info("in" + index + ": " + e.tick);
        //    }, function (e) {
        //    }, function (e) {
        //    });
        //});
        //
        //outobs.subscribe(function (e) {
        //    console.info("out: " + e.tick);
        //}, function (e) {
        //}, function (e) {
        //});




    }

    RxAnimator.prototype.transform = function (inObs) {
        return this.op.apply(null, inObs);
    };

    RxAnimator.prototype.surface = function (container, delta) {
       this.canvas = canvas(container, delta);
    };

    RxAnimator.prototype.combinator = function (y, title) {
        drawCombinator(this.canvas, y, (title || "..."));
    };

    RxAnimator.prototype.eventline = function(y) {
        drawEventline(this.canvas, y) ;
    };

    RxAnimator.prototype.arrow = function (x1, y1, x2, y2) {
        drawArrow(this.canvas, x1, y1, x2, y2, "black");
    };

    RxAnimator.prototype.next = function (x, y, shape) {
        drawEv(this.canvas, shape, x, y);
    };

    RxAnimator.prototype.error = function (x, y) {
        drawError(this.canvas, x, y);
    };

    RxAnimator.prototype.complete = function (x, y) {
        drawComplete(this.canvas, x, y);
    };





    // -- private --

    var width = 640;
    var height = 320;

    var sw = 3;
    var r = 1;

    // elements

    function canvas(container, delta) {
        var context = d3.select("body");
        if (container) {
            context = d3.select(container);
        }

        var svg = context.append("svg")
            .attr("width", width)
            .attr("height", height + delta);

        var defs = svg.append("defs");

        var marker = defs.append("marker")
            .attr("id", "mArrow")
            .attr('markerHeight', 13)
            .attr('markerWidth', 13)
            //.attr('markerUnits', 2)
            .attr('orient', 'auto')
            .attr('refX', 10)
            .attr('refY', 6);

        marker.append("path")
            .attr("d", "M2,2 L2,10 L10,6 L2,2 Z")
            .style("stroke", "black");

        return svg;
    }


    function marble(svg, x, y, color) {
        var r = 22;
        return svg.append("circle")
            .attr("cx", x).attr("cy", y)
            .attr("r", r)
            .style("fill", color)
            .style("stroke-width", sw)
            .style("stroke", "black")
            //.style("filter", "url(#shadow)")
            ;
    }

    function square(svg, x, y, color) {
        var d = 45;
        return svg.append("rect")
            .attr("x", x - d / 2).attr("y", y - d / 2)
            .attr("height", d).attr("width", d)
            .attr("rx", r).attr("ry", r)
            .style("fill", color)
            .style("stroke-width", sw)
            .style("stroke", "black")
            //.style("filter", "url(#shadow)")
            ;
    }

    function diamond(svg, x, y, color) {
        var d = 30;
        return svg.append("rect")
            .attr("x", x - d / 2).attr("y", y - d / 2)
            .attr("height", d).attr("width", d)
            .attr("rx", r).attr("ry", r)
            .attr("transform", "rotate(45, " + (x) + ", " + (y) + ")")
            .style("fill", color)
            .style("stroke-width", sw)
            .style("stroke", "black")
            //.style("filter", "url(#shadow)")
            ;
    }

    function pentagon(svg, x, y, color) {
        var dm = 45, r = dm / 2;

        var a = Math.round(r * 0.8);
        var b = Math.round(r * 0.59);
        var c = Math.round(r * 0.2);
        var d = Math.round(r * 0.98);

        var points =
            x + "," + (y - r) + ", " +
            (x - d) + "," + (y - c) + ", " +
            (x - b) + "," + (y + a) + ", " +
            (x + b) + "," + (y + a) + ", " +
            (x + d) + "," + (y - c);


        return svg.append("polygon")
            .attr("points", points)
            .style("fill", color)
            .style("stroke-linejoin", "round")
            .style("stroke-width", sw)
            .style("stroke", "black")
            ;

    }

    function triangle(svg, x, y, color) {
        var dm = 45, r = dm / 2;

        var s = r * 2 * 0.86;

        var a = Math.round(s * 0.86 - r);
        var b = Math.round(s * 0.5);

        var points =
            (x + b) + "," + (y - a) + ", " +
            (x) + "," + (y + r) + ", " +
            (x - b) + "," + (y - a);


        return svg.append("polygon")
            .attr("points", points)
            .style("fill", color)
            .style("stroke-linejoin", "round")
            .style("stroke-width", sw)
            .style("stroke", "black")
            ;

    }

    function drawEventline(svg, y) {
        return svg.append("line")
            .attr("x1", 6).attr("x2", width - 6)
            .attr("y1", y).attr("y2", y)
            .style("stroke-width", sw)
            .style("stroke", "black")
            ;
    }

    function drawCombinator(svg, y, text) {
        var h = 65;
        var w = width - 2 * 7;
        // @todo: make this a group
        rect = svg.append("rect")
            .attr("x", 7).attr("y", y - h / 2)
            .attr("height", h).attr("width", w)
            .attr("rx", r).attr("ry", r)
            .style("fill", "white")
            .style("stroke-width", sw)
            .style("stroke", "black")
            ;

        svg.append("text")
            .attr("x", width / 2).attr("y", y + 6)
            .text(text)
            .attr("font-family", "sans-serif")
            .attr("font-size", "24px")
            .attr("font-weight", "bold")
            .attr("text-anchor", "middle");

        return rect;

    }

    function drawComplete(svg, x, y) {
        var v = 20;
        return svg.append("line")
            .attr("x1", x).attr("x2", x)
            .attr("y1", y - v).attr("y2", y + v)
            .style("stroke-width", sw)
            .style("stroke", "black")
            ;
    }

    function drawArrow(svg, x1, y1, x2, y2, color) {
        var g = svg.append("g");
        g.append("path")
            .attr("d", "M" + x1 + "," + y1 + "L" + x2 + "," + y2)
            .attr("stroke-dasharray", "2,7")
            .style("stroke-width", sw - 2 > 0 ? sw - 2 : 1)
            .style("stroke", "black")
            .style("marker-end", "url(#mArrow)");

        return g;

    }

    function drawError(svg, x, y) {
        var v = 20;
        var g = svg.append("g");
        g.append("line")
            .attr("x1", x - v).attr("x2", x + v)
            .attr("y1", y - v).attr("y2", y + v);
        g.append("line")
            .attr("x1", x + v).attr("x2", x - v)
            .attr("y1", y - v).attr("y2", y + v);

        return g.style("stroke-width", sw)
            .style("stroke", "black");

    }

    function drawEv(svg, s, x, y) {
        switch (s.shape) {
            case 'marble':
                return marble(svg, x, y, s.color);
            case 'square':
                return square(svg, x, y, s.color);
            case 'pentagon':
                return pentagon(svg, x, y, s.color);
            case 'diamond':
                return diamond(svg, x, y, s.color);
            case 'triangle':
                return triangle(svg, x, y, s.color);
            default :
                console.error("unknown element" + s.shape);
        }
    }

    return rxDiag;
})();
