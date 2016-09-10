const sx3 = 'ls'; // letter space
const sx7 = 'ws'; // word space
const sx20 = 'nl'; // sentance space == new line


Rx.Observable.prototype.spacer = function (unit, detector, sched) {

    var source = this,
        scheduler = sched || Rx.Scheduler.default,
        detector = detector || function(x) { return x.endsWith("up") || x.endsWith("end")};

    return Rx.Observable.create(function (observer) {

        var completed = false,
            error = false,
            last = null;

        return source.subscribe(
            // onNext
            function (x) {
                var time = scheduler.now();
                last = time;

                // send x
                scheduler.schedule(x, function(sched, x) {
                    if (!completed && !error) {
                        observer.onNext(x)
                    }
                });

                if (detector(x)) {
                    // schedule LS
                    scheduler.scheduleFuture(sx3, 3 * unit * 1.05, function (sched, x) {
                        if (!error && last != null && time == last) {
                            observer.onNext(x);
                        }
                    });

                    // schedule WS
                    scheduler.scheduleFuture(sx7, 7 * unit * 1.05, function (sched, x) {
                        if (!error && last != null && time == last) {
                            observer.onNext(x);
                        }
                    });

                    // schedule CR
                    scheduler.scheduleFuture(sx20, 20 * unit * 1.05, function (sched, x) {
                        if (!error && last != null && time == last) {
                            observer.onNext(x);
                            if (completed) {
                                observer.onCompleted();
                            }
                        }
                    });
                }

            },
            // onError
            function (e) {
                scheduler.schedule(e, function(sched, x) {
                    if (!completed && !error) {
                        error = true;
                        observer.onError(e);
                    }
                });

            },
            // onComplete
            function () {
                scheduler.schedule(null, function(sched, x) {
                    if (!completed && !error && last == null) {
                        observer.onCompleted();
                    }

                    if (!completed && !error) {
                        completed = true;
                    }
                });

            }
        );


    });

};