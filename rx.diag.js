var RxDiag;
RxDiag = (function () {

    var rxDiag = {};

    // -- public --

    rxDiag.init = function (props, op, input) {
        this.props = props || {};

        var input1 = input || [];

        this.inObs = [];

        // set up combinator/operator
        this.op = op;

        // extract inputs
        var args = Array.prototype.slice.call(arguments, 2);

        // draw background and initialize draw surface

        var delta = (args.length - 1) * 60;

        var container = this.props.container;

        var context = d3.select("body");
        if (container) {
            context = d3.select(container);
        }

        this.svg = context.append("svg")
            .attr("width", width)
            .attr("height", height + delta);

        var svg1 = this.svg;

        args.forEach(function (ob, index) {
            eventline(svg1, 50 + index * 60 );
        });

        eventline(this.svg, 250 + delta) ;

        var cbox = combinator(this.svg, 155 + delta, (this.props.title || "..."));

        // initialize
        function project(in1) {
            return Rx.Observable.from(in1).flatMap(function (e) {
                if (e.shape == 'complete') {
                    return Rx.Observable.empty().delay(e.tick * 1000);
                } else if (e.shape == 'error') {
                    return Rx.Observable.empty().delay(e.tick * 1000).concat(Rx.Observable.throw(new Error("Die!")));
                } else {
                    return Rx.Observable.just(e).delay(e.tick * 1000);
                }
            });
        }


        this.inObs = args.map(project);

        // apply combinator
        function transform() {
            return rxDiag.op.apply(null, rxDiag.inObs);
        }

        var outobs = transform();

        /*
        this.inObs.forEach(function (obs, index) {
            obs.subscribe(function (e) {
                console.info("in" + index + ": " + e.tick);
            }, function (e) {
            }, function (e) {
            });
        });

        outobs.subscribe(function (e) {
            console.info("out: " + e.tick);
        }, function (e) {
        }, function (e) {
        });
        */



        // render observables
        var ref = new Date().getTime();

        var frame = function() {
            var timestamp = arguments.length == 0 ? new Date().getTime() : arguments[0].timestamp;
            return ((timestamp - ref) / 200).toFixed(0);
        };

        function x(fr) {
            return 25 + 10 * fr;
        }


        // subscribe and print
        this.inObs.forEach(function (obs, index) {
            var y = 50 + index*60;

            obs.timestamp().subscribe(
                // onNext
                function (i) {
                    var fr = frame(i);
                    drawEv(svg1, i.value, x(fr), y);
                },
                // onError
                function (e) {
                    var fr = frame();
                    error(svg1, x(fr), y);
                },
                // onComplete
                function () {
                    var fr = frame();
                    complete(svg1, x(fr), y);
                }
            );
        });

        // output y coordinate
        var y = 250 + delta;

        outobs.timestamp().subscribe(
        // onNext
            function (i) {
                var fr = frame(i);
                drawEv(svg1, i.value, x(fr), y);
            },
            // onError
            function (e) {
                var fr = frame();
                error(svg1, x(fr), y);
            },
            // onComplete
            function () {
                var fr = frame();
                complete(svg1, x(fr), y);
            }
        );


    };

    // -- private --

    var width = 640;
    var height = 320;

    var sw = 3;
    var r = 1;


    /*
     var defs = svg.append("defs");

     // shadow filter definition

     var filter = defs.append("filter")
     .attr("id", "shadow")
     .attr("height", "185%")
     .attr("width", "165%");

     filter.append("feOffset")
     .attr("in", "SourceAlpha")
     .attr("dx", -7)
     .attr("dy", 7)
     .attr("result", "offset");

     filter.append("feGaussianBlur")
     .attr("in", "offset")
     .attr("stdDeviation", 3)
     .attr("result", "blur");

     filter.append("feBlend")
     .attr("in", "SourceGraphic")
     .attr("in2", "blur")
     .attr("mode", "normal");

     */

    // elements

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
            .style("stroke", "black");

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
            .style("stroke", "black");

    }

    function eventline(svg, y) {
        return svg.append("line")
            .attr("x1", 6).attr("x2", width - 6)
            .attr("y1", y).attr("y2", y)
            .style("stroke-width", sw)
            .style("stroke", "black")
            ;
    }

    function combinator(svg, y, text) {
        h = 65;
        w = width - 2 * 7;
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

    function complete(svg, x, y) {
        var v = 20;
        return svg.append("line")
            .attr("x1", x).attr("x2", x)
            .attr("y1", y - v).attr("y2", y + v)
            .style("stroke-width", sw)
            .style("stroke", "black")
            ;
    }

    function error(svg, x, y) {
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
                marble(svg, x, y, s.color);
                break;
            case 'square':
                square(svg, x, y, s.color);
                break;
            case 'pentagon':
                pentagon(svg, x, y, s.color);
                break;
            case 'diamond':
                diamond(svg, x, y, s.color);
                break;
            case 'triangle':
                triangle(svg, x, y, s.color);
                break;
            default :
                console.error("unknown element" + e.shape);
        }
    }

    return rxDiag;
})();
