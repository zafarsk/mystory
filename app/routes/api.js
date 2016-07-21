var User = require('../models/user');
var Story = require('../models/story');
var config = require('../../config');
var jsonWebToken = require('jsonwebtoken');

var secretKey = config.secretKey;

function createToken(user) {

    var token = jsonWebToken.sign({
        _id: user._id,
        name: user.name,
        username: user.username
    }, secretKey, {
            expiresIn: 1440
        });

    return token;
}

module.exports = function (app, express, io) {
    var api = express.Router();

    api.get('/all_stories', function (err, res) {
        Story.find({}, function (err, stories) {
            if (err) {
                res.send(err);
                return;
            }
            res.json(stories);
        });
    });

    api.post('/signup', function (req, res) {

        var user = new User({
            name: req.body.name,
            username: req.body.username,
            password: req.body.password
        });

        user.save(function (err) {
            if (err) {
                res.send(err);
                return;
            }
            var token = createToken(user);
            res.json({
                success: true,
                message: "User is created.",
                token: token
            });
        });

    });

    api.get('/users', function (req, res) {
        User.find({}, function (err, users) {
            if (err) {
                res.send(err);
                return;
            }
            res.json(users);
        });
    });

    api.post('/login', function (req, res) {

        User.findOne({
            username: req.body.username
        })
            .select('password name username')
            .exec(function (err, user) {
                if (err) throw err;

                if (!user) {
                    res.send({ message: "User not found." });
                }
                else if (user) {

                    var validatePassword = user.comparePassword(req.body.password);

                    if (!validatePassword) {
                        res.send({ message: "Invalid credential." });
                    }
                    else {
                        // Token create    

                        var token = createToken(user);
                        res.json({
                            success: true,
                            message: "successfully login",
                            token: token
                        });
                    }
                }
            });
    });

    api.use(function (req, res, next) {
        console.log("Some one logged in.");
        var token = req.body.token || req.params['token'] || req.headers['x-access-token'];

        if (token) {
            jsonWebToken.verify(token, secretKey, function (err, decoded) {
                if (err) {
                    res.status(403).send({ success: false, message: "Failed to authenticate user." });
                } else {
                    req.decoded = decoded;
                    next();
                }
            });
        }
        else {
            res.status(403).send({ success: false, message: "No token provided." });
        }
    });

    api.route("/")
        .post(function (req, res) {
            var story = new Story({
                creator: req.decoded._id,
                content: req.body.content
            });

            story.save(function (err, newStory) {
                if (err) {
                    res.send(err);
                    return;
                }
                io.emit('story', newStory);
                res.json({ success: true, message: "New Story created." })
            });
        })
        .get(function (req, res) {
            console.log("Decoder");
            console.log(req.decoded._id);
            Story.find({ creator: req.decoded._id }, function (err, stories) {

                if (err) {
                    res.send(err);
                    return;
                }
                res.send(stories);
            });
        });

    api.get('/me', function (req, res) {
        res.send(req.decoded);
    });


    return api;
};