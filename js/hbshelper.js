define(['handlebars'], function (Handlebars) {
    Handlebars.registerHelper('isDefault', function (car_id) {
        if (functions.hasCookie(cookienames.default_car)) {
            car = Cookies.getJSON(cookienames.default_car);
            if (car.id == car_id) {
                return '<span class="badge color-blue">Default</span>';
            } else {
                return 'View';
            }
        } else {
            return 'View';
        }
    });

    Handlebars.registerHelper('journeyFinished', function (finished) {
        console.log(finished);
        if (finished == 0) {
            return 'Journey not marked finished';
        } else {
            return 'Journey finshed';
        }
    });

    Handlebars.registerHelper('totalTollgatesBill', function (tollgates, car) {
        var total = 0;
        tollgates.forEach(function (tollgate) {
            if (car.car_class == 1) {
                total += +tollgate.class_1_fee;
            } else if (car.car_class == 2) {
                total += +tollgate.class_2_fee;
            } else if (car.car_class == 3) {
                total += +tollgate.class_3_fee;
            } else {
                total += +tollgate.class_4_fee;
            }
        });
        return 'R ' + total.toFixed(2);
    });

    Handlebars.registerHelper('chooseClass', function (c1, c2, c3, c4) {
        var car = Cookies.getJSON(cookienames.default_car);
        if (car.car_class == 1) {
            return c1;
        } else if (car.car_class == 2) {
            return c2;
        } else if (car.car_class == 3) {
            return c3;
        } else {
            return c4;
        }
    });

    Handlebars.registerHelper('checkAuth', function (auth_type) {
        if (auth_type == "Abiri Direct") {
            return 'person';
        } else if (auth_type == "Facebook Auth") {
            return 'social_facebook';
        } else {
            return 'social_googleplus';
        }
    });

    Handlebars.registerHelper('compare', function (lvalue, operator, rvalue, options) {

        var operators, result;

        if (arguments.length < 3) {
            throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
        }

        if (options === undefined) {
            options = rvalue;
            rvalue = operator;
            operator = "===";
        }

        operators = {
            '==': function (l, r) {
                return l === r;
            },
            '===': function (l, r) {
                return l === r;
            },
            '!=': function (l, r) {
                return l !== r;
            },
            '!==': function (l, r) {
                return l !== r;
            },
            '<': function (l, r) {
                return l < r;
            },
            '>': function (l, r) {
                return l > r;
            },
            '<=': function (l, r) {
                return l <= r;
            },
            '>=': function (l, r) {
                return l >= r;
            },
            '%': function (l, r) {
                return (l % r) === 0;
            },
            'typeof': function (l, r) {
                return typeof l === r;
            }
        };

        if (!operators[operator]) {
            throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);
        }

        result = operators[operator](lvalue, rvalue);

        if (result) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }

    });
});