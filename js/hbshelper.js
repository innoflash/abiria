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

    Handlebars.registerHelper('isPast', function (time) {
        if (time.indexOf('from now') !== -1) {
            return 'pending-convoy';
        }
    });

    Handlebars.registerHelper('stateColor', function (state) {
        if (state === 'accepted')
            return 'color-green';
        if (state === 'declined')
            return 'color-red';
        else
            return 'color-blue'
    });

    Handlebars.registerHelper('convoyState', function (state) {
        if (state === 'started')
            return 'color-green';
        else if (state === 'canceled')
            return 'color-red';
        else if (state === 'pending')
            return '';
        else
            return 'color-blue';
    });

    Handlebars.registerHelper('shortInvite', function (invite) {
        if (invite === 'accepted')
            return 'acc';
        else if (invite === 'declined')
            return 'dec';
        else
            return 'pdng';
    });

    Handlebars.registerHelper('isYou', function (user_id) {
        console.log('user_id', user_id);
        user = Cookies.getJSON(cookienames.user);
        if (user_id === user.id) {
            return '(You)';
        }
    });

    Handlebars.registerHelper('convoyInitial', function (state) {
        return state.charAt(0);
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

    Handlebars.registerHelper('speedCalculator', function(speed){
      if (speed === null) {
        return 'n/a'
      }else{
        speed = Math.round((speed/1000)/3600) + ' km/hr'
        return speed
      }
    })

    Handlebars.registerHelper('checkAuth', function (auth_type) {
        if (auth_type === "Abiri Direct") {
            return 'person';
        } else if (auth_type === "Facebook Auth") {
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
