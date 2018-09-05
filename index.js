const apiai = require('apiai');
const uuid = require('uuid');
// const uuid2 = require('node-uuid');
const request = require('request');
const JSONbig = require('json-bigint');
const async = require('async');

var express = require('express');
var bodyParser = require('body-parser')
var app = express();
var pg = require('pg');

const REST_PORT = (process.env.PORT || 5000);
const APIAI_ACCESS_TOKEN = "f36148c6e15e4a07bd33558e836c71a7";
const APIAI_LANG = 'es';
const FB_VERIFY_TOKEN = 'verysecret';
const FB_PAGE_ACCESS_TOKEN = 'EAAa8JMjM1akBAGfwe7zuXr6Oldo3Q30tTRlVgQ5wCgKGJYSYXbFp95DCEgbg7XpuogUMS3UeSRdz2LmzihRZB0mBY91taj1hgb7BnE794zNP9L1V0ufXbUQhMeFvWe8MaYAnNsOhQ6ezK6cG1sYfwtKvYsqv02EomXTdDjZB7CEhDYvp81';
const FB_TEXT_LIMIT = 640;

const FACEBOOK_LOCATION = "FACEBOOK_LOCATION";
const FACEBOOK_WELCOME = "FACEBOOK_WELCOME";

var apiAiService = apiai(APIAI_ACCESS_TOKEN, {language: APIAI_LANG, requestSource: "fb"});
var sessionIds= new Map();

app.set('port', (process.env.PORT || 5000));

//app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index')
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

app.post('/requestsAPI', function (req, res) {
	console.log('==========================INICIO post requestsAPI==========================');
	var originalReq = req.body;//originalRequest.data;
	var str = JSON.stringify(originalReq, null, 2);
	console.log('==========================req==========================');
	console.log(str);
	console.log('======================================================');

	var id = req.body.originalRequest.data.sender.id;
    // var message = req.body.originalRequest.data.message.text;
	var sid = JSON.stringify(id, null, 2);
    // var smessage = JSON.stringify(message, null, 2);

	console.log('==========================id==========================');
	console.log(sid + "\n");
    // console.log(smessage + "\n");
	console.log('======================================================');
	
	var context1 = req.body.result.contexts[0].name;
    // var context2 = req.body.result.contexts[2].name;
    // var scontext1 = JSON.stringify(context1, null, 2);
    // var scontext2 = JSON.stringify(context2, null, 2);
	console.log('==========================context==========================');
	// console.log(scontext1 + "\n");
 //    console.log(scontext2 + "\n");
	console.log('======================================================');


	var intent = req.body.result.metadata.intentName;
	// console.log("body" + req + "\n")
	console.log("intent >> " + intent);

	// var originalReq = req.body;//originalRequest.data;
	// var str = JSON.stringify(originalReq, null, 2);
	// console.log("--------------- "str);
		
	if (intent == "1.3.ubicacion.inmueble") {
		
		var latitude = JSON.stringify(req.body.originalRequest.data.postback.data.lat, null, 2);
		var longitude = JSON.stringify(req.body.originalRequest.data.postback.data.long, null, 2);
		console.log("request " + req.body.originalRequest + "\n");
		console.log("latitud " + latitude + "\n");
		console.log("latitud " + longitude + "\n");

		if (latitude && longitude){

			MLRequest(latitude, longitude).then((linmuebles) =>
			{
				var inmuebles = JSON.parse(linmuebles);
				
				res.setHeader('Content-Type', 'application/json');
				res.send(JSON.stringify({
					"speech": "any speech",
					"displayText": "Any text",
					"data": {
						"facebook": {
							"attachment": {
								"type": "template",
								"payload": {
									"template_type": "generic",
									"elements": [
										{
											"title": fixString(inmuebles.results[0].title),
											"image_url": inmuebles.results[0].thumbnail.substring(0, inmuebles.results[0].thumbnail.length - 5) + "F.jpg",
											"subtitle": "Precio: $" + inmuebles.results[0].price,
											"buttons": [
												{
													"type": "web_url",
													"title": "Ver publicación",
													"url" : inmuebles.results[0].permalink
												},
												{
													"type": "web_url",
													"title": "Ubicación",
													"url" : "http://maps.google.com/maps?q=" + inmuebles.results[0].location.latitude + "," + inmuebles.results[0].location.longitude + "&ll=" + inmuebles.results[0].location.latitude + "," + inmuebles.results[0].location.longitude + "&z=19"
												},
												{
													"type": "postback",
													"title": "Favoritos",
													"payload": "IDML: " + inmuebles.results[0].id.substring(3)
												}
											]
										},
										{
											"title": fixString(inmuebles.results[1].title),
											"image_url": inmuebles.results[1].thumbnail.substring(0, inmuebles.results[1].thumbnail.length - 5) + "F.jpg",
											"subtitle": "Precio: $" + inmuebles.results[1].price,
											"buttons": [
												{
													"type": "web_url",
													"title": "Ver publicación",
													"url": inmuebles.results[1].permalink
												},
												{
													"type": "web_url",
													"title": "Ubicación",
													"url": "http://maps.google.com/maps?q=" + inmuebles.results[1].location.latitude + "," + inmuebles.results[1].location.longitude + "&ll=" + inmuebles.results[1].location.latitude + "," + inmuebles.results[1].location.longitude + "&z=19"
												},
												{
													"type": "postback",
													"title": "Favoritos",
													"payload": "IDML: " + inmuebles.results[1].id.substring(3)
												}
											]
										},
										{
											"title": fixString(inmuebles.results[2].title),
											"image_url": inmuebles.results[2].thumbnail.substring(0, inmuebles.results[2].thumbnail.length - 5) + "F.jpg",
											"subtitle": "Precio: $" + inmuebles.results[2].price,
											"buttons": [
												{
													"type": "web_url",
													"title": "Ver publicación",
													"url": inmuebles.results[2].permalink
												},
												{
													"type": "web_url",
													"title": "Ubicación",
													"url": "http://maps.google.com/maps?q=" + inmuebles.results[2].location.latitude + "," + inmuebles.results[2].location.longitude + "&ll=" + inmuebles.results[2].location.latitude + "," + inmuebles.results[2].location.longitude + "&z=19"
												},
												{
													"type": "postback",
													"title": "Favoritos",
													"payload": "IDML: " + inmuebles.results[2].id.substring(3)
												}
											]
										},
										{
											"title": fixString(inmuebles.results[3].title),
											"image_url": inmuebles.results[3].thumbnail.substring(0, inmuebles.results[3].thumbnail.length - 5) + "F.jpg",
											"subtitle": "Precio: $" + inmuebles.results[3].price,
											"buttons": [
												{
													"type": "web_url",
													"title": "Ver publicación",
													"url": inmuebles.results[3].permalink
												},
												{
													"type": "web_url",
													"title": "Ubicación",
													"url": "http://maps.google.com/maps?q=" + inmuebles.results[3].location.latitude + "," + inmuebles.results[3].location.longitude + "&ll=" + inmuebles.results[3].location.latitude + "," + inmuebles.results[3].location.longitude + "&z=19"
												},
												{
													"type": "postback",
													"title": "Favoritos",
													"payload": "IDML: " + inmuebles.results[3].id.substring(3)
												}
											]
										}
									]
								}

							}
						}
					},
					"source": "Facebook",
				}));
			});
		}
	}
	else if (intent == "1.1.Quiero.departamento") {

		var id_user_fb = req.body.originalRequest.data.sender.id;

		if (id_user_fb) {
			userInfoRequest(id_user_fb).then((userInfo) => {
				var usr = JSON.parse(userInfo);
				var answer = "Gracias " + usr.first_name + ". Los puntos acumulados que tienes son: 180 y corresponden a un crédito de: $1,600,000. ¿Te gustaría que te recomiende inmuebles con base en tu ubicación?";

				res.setHeader('Content-Type', 'application/json');
				res.send(JSON.stringify({
					"speech": answer,
					"displayText": answer,
					"data": {
						"facebook": {
							"text": answer,
							"quick_replies": [
								{
									"content_type": "text",
									"title": "Si",
									"payload": "SI",
									"image_url": "http://lp2.hm.com/hmprod?set=source[/fabric/2017/B96776AA-46A1-4323-8085-B83615683C64.jpg],type[FABRICSWATCH]&hmver=0&call=url[file:/product/fabricsmall]"
								},
								{
									"content_type": "text",
									"title": "No",
									"payload": "NO",
									"image_url": "http://lp2.hm.com/hmprod?set=source[/fabric/2017/B7EFBC78-C844-4535-A6A2-F0AC5CEBBBC4.jpg],type[FABRICSWATCH]&hmver=0&call=url[file:/product/fabricsmall]"
								}
							]
						}
					},
					"source": "Facebook"
				}));
			}).catch(err => {
				console.error("ERROR: " + err);
			});
		}
	}
	else if (intent == "Bienvenida") {

		var id_user_fb = req.body.originalRequest.data.sender.id;

		if (id_user_fb) {
			userInfoRequest(id_user_fb).then((userInfo) => {
				var usr = JSON.parse(userInfo);
				var ans = "Hola " + usr.first_name + ", ¿En qué puedo ayudarte?";
				
				res.setHeader('Content-Type', 'application/json');
				res.send(JSON.stringify({
					"speech": ans,
					"displayText": ans,
					"data": {
						"facebook": {
							"text": ans,
						}
					},
					"source": "Facebook"
				}));
			}).catch(err => {
				console.error("ERROR: " + err);
			});
		}
	}
	else if (intent == "1.3.2.Agregar a favoritos") {
		
		var id_user_fb = req.body.originalRequest.data.sender.id;
		var id_product_ml = req.body.result.parameters.number;

		pg.connect(process.env.DATABASE_URL, function (err, client, done) {
			var query = "INSERT INTO public.userfb_inmueble(id_userfb, id_inmueble) VALUES ('" + id_user_fb + "', 'MLM" + id_product_ml + "');"
			client.query(query, function (err, result) {
				done();
				if (err) {
					console.error(err);
					res.send("Error al agregar favorito " + err);
				}
				else {
					res.setHeader('Content-Type', 'application/json');
					res.send(JSON.stringify({
						"speech": "El inmueble ha sido agregado a tus favoritos",
						"displayText": "El inmueble ha sido agregado a tus favoritos",
						"data": {
							"facebook": {
								"text": "El inmueble ha sido agregado a tus favoritos"
							}
						},
						"source": "Facebook"
					}));
				}
			});
		});
	}
	else if (intent == "3.1.Ver.Recomendados") {
		var id_user_fb = req.body.originalRequest.data.sender.id;
		var queryInmuebles = [];
		var dataInmueble = [];
		pg.connect(process.env.DATABASE_URL, function (err, client, done) {
			var query = "select distinct * from userfb_inmueble where id_userfb = '" + id_user_fb + "'order by idfavs desc limit 4;"
			client.query(query, function (err2, result2) {
				done();
				if (err2) {
					console.error(err2);
					results.send("Error al consultar favoritos " + err2);
				}
				else {
					var out = "Se agregó el inmueble a tus favoritos! <br/>";
					for (var i = 0; i < result2.rows.length; i++) {
						out += result2.rows[i].id_userfb + "\t|\t" + result2.rows[i].id_inmueble + "<br/>";
						queryInmuebles[i] = result2.rows[i].id_inmueble;
					}

					MLRequestArticles(queryInmuebles, res);
				}
			});
		});


	}
	console.log('==========================FIN post requestsAPI==========================');
});

function userInfoRequest(userId) {
    return new Promise((resolve, reject) => {
        request({
                method: 'GET',
                uri: "https://graph.facebook.com/v2.9/" + userId +
				"?fields=first_name,last_name,profile_pic,locale,timezone,gender&" + 	"access_token=EAAa8JMjM1akBAGfwe7zuXr6Oldo3Q30tTRlVgQ5wCgKGJYSYXbFp95DCEgbg7XpuogUMS3UeSRdz2LmzihRZB0mBY91taj1hgb7BnE794zNP9L1V0ufXbUQhMeFvWe8MaYAnNsOhQ6ezK6cG1sYfwtKvYsqv02EomXTdDjZB7CEhDYvp81"
            },
            function (error, response) {
                if (error) {
                    console.error('Error while userInfoRequest: ', error);
                    reject(error);
                } else {
                    console.log('userInfoRequest result: ', response.body);
                    resolve(response.body);
                }
            });
    });
}

function MLRequest(lat, long) {
    return new Promise((resolve, reject) => {
		request({
			method: 'GET', uri: "https://api.mercadolibre.com/sites/MLM/search?item_location=lat:" + (lat - .01) + "_" + (lat + .01) + ",lon:" + (long - .01) + "_" + (long + .01) + "&category=MLM1459&limit=4"
		},
		function (error, response) {
			if (error) {
				console.error('Error while userInfoRequest: ', error);
				reject(error);
			} else {
				resolve(response.body);
			}
		});
	});

	// uri: "https://api.mercadolibre.com/sites/MLA/search?item_location=lat:" + lat + "_" + (lat + 5) + ",lon:" + long + "_" + (long + 5) + "&category=MLA1459&limit=4"
	// uri: "https://api.mercadolibre.com/sites/MLA/search?item_location=lat:-37.987148_-30.987148,lon:-57.5483864_-50.5483864&category=MLA1459&limit=2"
}

function MLRequestArticle(idarticle) {
	return new Promise((resolve, reject) => {
		request({
			method: 'GET', uri: "https://api.mercadolibre.com/items/" + idarticle
		},
		function (error, response) {
			if (error) {
				console.error('Error while userInfoRequest: ', error);
				reject(error);
			} else {
				resolve(response.body);
			}
		});
	});
}

function MLRequestArticles(articles,res) {
	var arts = [];
	var elements = [];
	for (var i = 0; i < articles.length; i++) {
		request({
			method: 'GET', uri: "https://api.mercadolibre.com/items/" + articles[i]
		},
		function (error, response) {
			if (error) {
				console.error('Error while userInfoRequest: ', error);
				reject(error);
			} else {
				arts[i] = JSON.parse(response.body);
				
				var element = {
					"title": fixString(arts[i].title),
					"image_url": arts[i].thumbnail.substring(0, arts[i].thumbnail.length - 5) + "F.jpg",
					"subtitle": "Precio: $" + arts[i].price,
					"buttons": [
						{
							"type": "web_url",
							"title": "Ver publicación",
							"url": arts[i].permalink
						},
						{
							"type": "web_url",
							"title": "Ubicación",
							"url": "http://maps.google.com/maps?q=" + arts[i].location.latitude + "," + arts[i].location.longitude + "&ll=" + arts[i].location.latitude + "," + arts[i].location.longitude + "&z=19"
						}
					]
				}
				elements.push(element);
				
				if (elements.length == articles.length) {
					console.log('entre');
					res.setHeader('Content-Type', 'application/json');
					res.send(JSON.stringify({
						"speech": "any speech",
						"displayText": "Any text",
						"data": {
							"facebook": {
								"attachment": {
									"type": "template",
									"payload": {
										"template_type": "generic",
										"elements": elements
									}

								}
							}
						},
						"source": "Facebook",

					}));
					console.log('sali');
				}
			}

		});
	}
}

function fixString(s) {
	return s.replace(/&amp;/g, '&')
			.replace(/&aacute;/g,"á")
			.replace(/&eacute;/g,"é")
			.replace(/&iacute;/g,"í")
			.replace(/&oacute;/g,"ó")
			.replace(/&uacute;/g,"ú")
			.replace(/&ntilde;/g,"ñ");
		// agregar más ??*/
}

app.get('/VideoStream', function (request, response) {
	response.render('VideoStream/index');
});

app.get('/VideoStream/sample', function (request, response) {
	response.render('VideoStream/minivid2');
});