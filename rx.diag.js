var RxDiag = (function() {

    var rxDiag = {};

    // -- public --

    rxDiag.init = function (props) {
        this.props = props;

        this.svg = d3.select("body").append("svg")
            .attr("width", width)
            .attr("height", height);

        var evline1 = eventline(this.svg, 100);
        var evline2 = eventline(this.svg, 500);

        var cbox = combinator(this.svg, 310, "Delay(" + this.props.delay + ")");


        var input1 = [
            {shape: "marble", color: "blue", "tick": 1},
            {shape: "marble", color: "green", "tick": 3},
            {shape: "marble", color: "yellow", "tick": 4},
            {shape: "error", color: undefined, "tick": 8}
        ];

        var in1obs = Rx.Observable.from(input1).flatMap(function (e) {
            if (e.shape == 'complete') {
                return Rx.Observable.empty().delay(e.tick * 1000);
            } else if (e.shape == 'error') {
                return Rx.Observable.empty().delay(e.tick * 1000).concat(Rx.Observable.throw(new Error("Die!")));
            } else {
                return Rx.Observable.just(e).delay(e.tick * 1000);
            }
        });

        // combinator (delay)
        function transform() {
            return in1obs.delay(rxDiag.props.delay);
        }


        var outobs = transform();

        in1obs.subscribe(function (e) {
            console.info("in1: " + e.tick);
        }, function (e) {
        }, function (e) {
        });


        outobs.subscribe(function (e) {
            console.info("out: " + e.tick);
        }, function (e) {
        }, function (e) {
        });

        // render observables
        var ref = new Date().getTime();

        function frame(e) {
            return ((e.timestamp - ref) / 100).toFixed(0);
        }


        var svg1 = this.svg;

        in1obs.timestamp().subscribe(
            // onNext
            function (e) {
                var fr = frame(e);
                drawEv(svg1, e.value, 50 + 10 * fr, 100);
            },
            // onError
            function (e) {
                var frame = ((new Date().getTime() - ref) / 100).toFixed(0);
                error(svg1, 50 + 10 * frame, 100);
            },
            // onComplete
            function (e) {
                var frame = ((new Date().getTime() - ref) / 100).toFixed(0);
                complete(svg1, 50 + 10 * frame, 100);
            }
        );

        outobs.timestamp().subscribe(
            // onNext
            function (e) {
                var fr = frame(e);
                drawEv(svg1, e.value, 50 + 10 * fr, 500);
            },
            // onError
            function (e) {
                var frame = ((new Date().getTime() - ref) / 100).toFixed(0);
                error(svg1, 50 + 10 * frame, 500);
            },
            // onComplete
            function (e) {
                var frame = ((new Date().getTime() - ref) / 100).toFixed(0);
                complete(svg1, 50 + 10 * frame, 500);
            }
        );

    };

    // -- private --

    var width = 1280;
    var height = 620;

    var sw = 6;
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
        var r = 45;
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
        var d = 90;
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
        var d = 60;
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
        var dm = 90, r = dm / 2;

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
        var dm = 90, r = dm / 2;

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
            .attr("x1", 15).attr("x2", width - 15)
            .attr("y1", y).attr("y2", y)
            .style("stroke-width", sw)
            .style("stroke", "black")
            ;
    }

    function combinator(svg, y, text) {
        h = 130;
        w = width - 2 * 15;
        // @todo: make this a group
        rect = svg.append("rect")
            .attr("x", 15).attr("y", y - h / 2)
            .attr("height", h).attr("width", w)
            .attr("rx", r).attr("ry", r)
            .style("fill", "white")
            .style("stroke-width", sw)
            .style("stroke", "black")
        ;

        svg.append("text")
            .attr("x", width / 2).attr("y", y + 15)
            .text(text)
            .attr("font-family", "sans-serif")
            .attr("font-size", "48px")
            .attr("font-weight", "bold")
            .attr("text-anchor", "middle");

        return rect;

    }

    function complete(svg, x, y) {
        var v = 40;
        return svg.append("line")
            .attr("x1", x).attr("x2", x)
            .attr("y1", y - v).attr("y2", y + v)
            .style("stroke-width", sw)
            .style("stroke", "black")
            ;
    }

    function error(svg, x, y) {
        var v = 40;
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