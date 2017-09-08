var express = require('express');
var bodyParser = require('body-parser');
var budgetMod = require('./budgetModule');
var bcrypt = require('bcrypt');
const saltRounds = 10;

var app = express();

var serverPort = 8000; // à renseigner

var is_Log = 0, error_log=0, validForm = 0;
var whoIs = 0;
var listePersonnes="", listePostes="", listeDepenses="";
var last_pers = "", last_raison = "";



app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use( express.static( "public" ) );



// http://localhost:port/
app.get("/", function (req, res) {
	if(!is_Log){
		res.redirect('/login');
	}
	else {
		res.redirect('/index');
	}
});


// http://localhost:port/index
app.get("/index", function (req, res) { 
	 
	if(!is_Log){
		res.redirect('/login');
	}
	else {
	    budgetMod.getPersonnes(function(results) {
	    	listPersonnes = results;
			budgetMod.getName(whoIs, function(retFun) {
				budgetMod.getTransac(whoIs, function(tabTransac) {
					budgetMod.getTotalTransac(whoIs,function(totalTransac) {
						budgetMod.isParent(whoIs, function(is_parent){
	    					res.render('index.ejs', {listPersonnes:  listPersonnes, prenom:  retFun, tabTransac: tabTransac, totalTransac: totalTransac, whoIs: whoIs, is_parent: is_parent});
						});
	    			});
	    		});
			});
		});
	}
});


// http://localhost:port/index/:id
app.get("/index/:id", function (req, res) { 
	
	if(!is_Log){
		res.redirect('/login');
	}
	else {
	    budgetMod.getPersonnes(function(results) {
	    	listPersonnes = results;
			budgetMod.getName(whoIs, function(retFun) {
				if(req.params.id == "all"){
					budgetMod.getTotalAllTransac(function(totalTransac) {
						budgetMod.isParent(whoIs, function(is_parent){
	    					res.render('index_total.ejs', {listPersonnes:  listPersonnes, prenom:  retFun, totalTransac: totalTransac, whoami: whoIs, whoIs: req.params.id, is_parent: is_parent});
						});
	    			});
				}
				else {
					budgetMod.getTransac(req.params.id, function(tabTransac) {
						budgetMod.getTotalTransac(req.params.id,function(totalTransac) {
							budgetMod.isParent(whoIs, function(is_parent){
		    					res.render('index.ejs', {listPersonnes:  listPersonnes, prenom:  retFun, tabTransac: tabTransac, totalTransac: totalTransac, whoIs: req.params.id, is_parent: is_parent});
							});
		    			});
		    		});
				}
			});
		});
	}
});


// http://localhost:port/depenses
app.get("/depenses", function (req, res) { 
	
	if(!is_Log){
		res.redirect('/login');
	}
	else {
	    budgetMod.getPersonnes(function(results) {
	    	listePersonnes = results;

		    budgetMod.getPoste(function(results) {
		    	listeRaisons = results;

			    budgetMod.getDepenses(whoIs, function(results) {
				    	listeDepenses = results;

			    	budgetMod.getPersonnes(function(listPersonnes){
						budgetMod.isParent(whoIs, function(is_parent){
							res.render('depenses.ejs', {listePersonnes:  listePersonnes, listeRaisons:  listeRaisons, listeDepenses:  listeDepenses, validForm: validForm, is_parent: is_parent, whoIs: whoIs, listPersonnes: listPersonnes});
							validForm = 0;
						});
					});

			    });
		    });
	    });
	}
});


// http://localhost:port/depenses/:id
app.get("/depenses/:id", function (req, res) { 
	
	if(!is_Log){
		res.redirect('/login');
	}
	else {
	    budgetMod.getPersonnes(function(results) {
	    	listePersonnes = results;

		    budgetMod.getPoste(function(results) {
		    	listeRaisons = results;

			    budgetMod.getDepenses(req.params.id, function(results) {
				    	listeDepenses = results;

			    	budgetMod.getPersonnes(function(listPersonnes){
						budgetMod.isParent(whoIs, function(is_parent){
							res.render('depenses.ejs', {listePersonnes:  listePersonnes, listeRaisons:  listeRaisons, listeDepenses:  listeDepenses, validForm: validForm, is_parent: is_parent, whoIs: req.params.id, listPersonnes: listPersonnes});
							validForm = 0;
						});
					});

			    });
		    });
	    });
	}
});


// http://localhost:port/updDepenses/:id
app.get("/updDepenses/:id", function (req, res) { 
	
	if(!is_Log){
		res.redirect('/login');
	}
	else {
	    budgetMod.getPersonnes(function(results) {
	    	listePersonnes = results;

		    budgetMod.getPoste(function(results) {
		    	listeRaisons = results;

			    budgetMod.getDepensesId(req.params.id, function(results) {
				    listeDepenses = results;

					budgetMod.isParent(whoIs, function(is_parent){
						res.render('updDepenses.ejs', {listePersonnes:  listePersonnes, listeRaisons:  listeRaisons, listeDepenses:  listeDepenses, validForm: validForm, is_parent: is_parent, whoIs: req.params.id, listPersonnes: listPersonnes});
						validForm = 0;
					});
			    });
		    });
	    });
	}
});


// http://localhost:port/updateDepense/:id
app.post('/updateDepense/:id', function(req, res){
	var requete = req.body;
	if(!is_Log){
		res.redirect('/login');
	}
	else {
		budgetMod.addPersonne(requete.nom, requete.prenom, requete.personnes, 1, function(results) {
			last_pers = results;

			budgetMod.addPoste(requete.newRaison, requete.raisons, function(results) {
				last_origine = results;
				budgetMod.updDepenses(req.params.id, requete.montant, requete.date, last_origine, last_pers, function(results) {
					validForm = 1;
					res.redirect('/updDepenses/'+req.params.id);
				});
			});
		});
	}
});


// http://localhost:port/addDepenses
app.post('/addDepenses', function(req, res){
	var requete = req.body;
	if(!is_Log){
		res.redirect('/login');
	}
	else {
		budgetMod.addPersonne(requete.nom, requete.prenom, requete.personnes, 1, function(results) {
			last_pers = results;

			budgetMod.addPoste(requete.newRaison, requete.raisons, function(results) {
				last_raison = results;
				budgetMod.addDepenses(requete.montant, requete.date, last_raison, last_pers, function(results) {
				});
			});


		});
		

	}
	validForm = 1;
	res.redirect('/depenses/'+last_pers);
});


// http://localhost:port/delDepenses/:id
app.get("/delDepenses/:id", function (req, res) { 
	
	if(!is_Log){
		res.redirect('/login');
	}
	else {
	    budgetMod.delDepenses(req.params.id, function(results) {
			
	    });
	
	}
	validForm = 2;
	res.redirect('/depenses/all');
});


// http://localhost:port/rentrees
app.get("/rentrees", function (req, res) { 
	
	if(!is_Log){
		res.redirect('/login');
	}
	else {
	    budgetMod.getPersonnes(function(results) {
	    	listePersonnes = results;

		    budgetMod.getOrigine(function(results) {
		    	listeRaisons = results;

			    budgetMod.getRentrees(whoIs, function(results) {
				    listeRentrees = results;

					budgetMod.getPersonnes(function(listPersonnes){
						budgetMod.isParent(whoIs, function(is_parent){
							res.render('rentrees.ejs', {listePersonnes:  listePersonnes, listeRaisons:  listeRaisons, listeRentrees:  listeRentrees, validForm: validForm, whoIs: whoIs, is_parent: is_parent, listPersonnes: listPersonnes});
							validForm = 0;
						});
					});
			    });
		    });
	    });
	}
});


// http://localhost:port/rentrees/:id
app.get("/rentrees/:id", function (req, res) { 
	
	if(!is_Log){
		res.redirect('/login');
	}
	else {
	    budgetMod.getPersonnes(function(results) {
	    	listePersonnes = results;

		    budgetMod.getOrigine(function(results) {
		    	listeRaisons = results;

			    budgetMod.getRentrees(req.params.id, function(results) {

					budgetMod.getPersonnes(function(listPersonnes){
				    	listeRentrees = results;
						budgetMod.isParent(whoIs, function(is_parent){
							res.render('rentrees.ejs', {listePersonnes:  listePersonnes, listeRaisons:  listeRaisons, listeRentrees:  listeRentrees, validForm: validForm, whoIs: req.params.id, is_parent: is_parent, listPersonnes: listPersonnes});
							validForm = 0;
						});
					});
			    });
		    });
	    });
	}
});


// http://localhost:port/updRentrees/:id
app.get("/updRentrees/:id", function (req, res) { 
	
	if(!is_Log){
		res.redirect('/login');
	}
	else {
	    budgetMod.getPersonnes(function(results) {
	    	listePersonnes = results;

		    budgetMod.getOrigine(function(results) {
		    	listeRaisons = results;

			    budgetMod.getRentreesId(req.params.id, function(results) {
				    listeRentrees = results;

					budgetMod.isParent(whoIs, function(is_parent){
						res.render('updRentrees.ejs', {listePersonnes:  listePersonnes, listeRaisons:  listeRaisons, listeRentrees:  listeRentrees, validForm: validForm, whoIs: req.params.id, is_parent: is_parent, listPersonnes: listPersonnes});
						validForm = 0;
					});
			    });
		    });
	    });
	}
});


// http://localhost:port/updateRentree/:id
app.post('/updateRentree/:id', function(req, res){
	var requete = req.body;
	if(!is_Log){
		res.redirect('/login');
	}
	else {
		budgetMod.addPersonne(requete.nom, requete.prenom, requete.personnes, 1, function(results) {
			last_pers = results;

			budgetMod.addOrigine(requete.newRaison, requete.raisons, function(results) {
				last_origine = results;
				budgetMod.updRentrees(req.params.id, requete.montant, requete.date, last_origine, last_pers, function(results) {
					validForm = 1;
					res.redirect('/updRentrees/'+req.params.id);
				});
			});
		});
	}
});


// http://localhost:port/addRentrees
app.post('/addRentrees', function(req, res){
	var requete = req.body;
	if(!is_Log){
		res.redirect('/login');
	}
	else {
		budgetMod.addPersonne(requete.nom, requete.prenom, requete.personnes, 1, function(results) {
			last_pers = results;

			budgetMod.addOrigine(requete.newRaison, requete.raisons, function(results) {
				last_origine = results;
				budgetMod.addRentrees(requete.montant, requete.date, last_origine, last_pers, function(results) {

				});
			});


		});
	}
	validForm=1;
	res.redirect('/rentrees/'+last_pers);
});


// http://localhost:port/delRentrees/:id
app.get("/delRentrees/:id", function (req, res) { 
	
	if(!is_Log){
		res.redirect('/login');
	}
	else {
	    budgetMod.delRentrees(req.params.id, function(results) {
			
	    });
	
	}
	validForm = 2;
	res.redirect('/rentrees/'+req.params.id);
});


// http://localhost:port/budget
app.get("/budget", function (req, res) { 
	
	if(!is_Log){
		res.redirect('/login');
	}
	else {
		budgetMod.isParent(whoIs, function(is_parent){
			if(is_parent){
		    budgetMod.getPersonnes(function(results) {
		    	listePersonnes = results;

			    budgetMod.getRaisons(function(results) {
			    	listeRaisons = results;

				    budgetMod.getBudget(whoIs, function(results) {
					    listeBudget = results;

						budgetMod.getPersonnes(function(listPersonnes){
							budgetMod.isParent(whoIs, function(is_parent){
								res.render('budgets.ejs', {listePersonnes:  listePersonnes, listeRaisons:  listeRaisons, listeBudget:  listeBudget, validForm: validForm, whoIs: whoIs, is_parent: is_parent, listPersonnes: listPersonnes});
								validForm = 0;
							});
						});
				    });
			    });
		    });
			}
			else {
				res.redirect('/index');
			}
		});
	}
});


// http://localhost:port/budget/:id
app.get("/budget/:id", function (req, res) { 
	
	if(!is_Log){
		res.redirect('/login');
	}
	else {
		budgetMod.isParent(whoIs, function(is_parent){
			if(is_parent){
		    	budgetMod.getPersonnes(function(results) {
		    	listePersonnes = results;

			    budgetMod.getRaisons(function(results) {
			    	listeRaisons = results;

				    budgetMod.getBudget(req.params.id, function(results) {
					    listeBudget = results;

						budgetMod.getPersonnes(function(listPersonnes){
								res.render('budgets.ejs', {listePersonnes:  listePersonnes, listeRaisons:  listeRaisons, listeBudget:  listeBudget, validForm: validForm, whoIs: req.params.id, is_parent: is_parent, listPersonnes: listPersonnes});
								validForm = 0;
							});
						});
				    });
			    });
			}
			else {
				res.redirect('/index');
			}
	    });
	}
});



// http://localhost:port/updBudget/:id
app.get("/updBudget/:id", function (req, res) { 
	
	if(!is_Log){
		res.redirect('/login');
	}
	else {
		budgetMod.isParent(whoIs, function(is_parent){
			if(is_parent){
		    	budgetMod.getPersonnes(function(results) {
		    	listePersonnes = results;

			    budgetMod.getRaisons(function(results) {
			    	listeRaisons = results;

				    budgetMod.getBudgetId(req.params.id, function(results) {
					    listeBudgets = results;

							res.render('updBudgets.ejs', {listePersonnes:  listePersonnes, listeRaisons:  listeRaisons, listeBudgets:  listeBudgets, validForm: validForm, whoIs: req.params.id, is_parent: is_parent});
							validForm = 0;
						});
				    });
			    });
			}
			else {
				res.redirect('/index');
			}
	    });
	}
});


// http://localhost:port/updateBudget/:id
app.post('/updateBudget/:id', function(req, res){
	var requete = req.body;
	if(!is_Log){
		res.redirect('/login');
	}
	else {
		budgetMod.isParent(whoIs, function(is_parent){
			if(is_parent){
				budgetMod.updBudget(req.params.id, requete.personnes_e, requete.nom_e, requete.prenom_e, requete.personnes_r, requete.nom_r, requete.prenom_r, requete.raisons, requete.newRaison, requete.montant, requete.date, function(results) {
					validForm = 1;
					res.redirect('/updBudget/'+req.params.id);
				});
			}
			else {
				res.redirect('/index');
			}
	    });
	}
});


// http://localhost:port/addBudget
app.post('/addBudget', function(req, res){
	var requete = req.body;
	if(!is_Log){
		res.redirect('/login');
	}
	else {
		budgetMod.isParent(whoIs, function(is_parent){
			if(is_parent){
				budgetMod.addBudget(requete.personnes_e, requete.nom_e, requete.prenom_e, requete.personnes_r, requete.nom_r, requete.prenom_r, requete.raisons, requete.newRaison, requete.montant, requete.date, function(results) {
					last_pers = results;
					validForm=1;
					res.redirect('/budget/'+last_pers);
				});
			}
			else {
				res.redirect('/index');
			}
	    });
	}
});


// http://localhost:port/delBudget/:id
app.get("/delBudget/:id", function (req, res) { 
	
	if(!is_Log){
		res.redirect('/login');
	}
	else {
		budgetMod.isParent(whoIs, function(is_parent){
			if(is_parent){
			    budgetMod.delBudget(req.params.id, function(results) {
					validForm = 2;
					res.redirect('/budget/all');
			    });
			}
			else {
				res.redirect('/index');
			}
	    });
	
	}
});


// http://localhost:port/users
app.get("/users", function (req, res) { 
	
	if(!is_Log){
		res.redirect('/login');
	}
	else {
		budgetMod.isParent(whoIs, function(is_parent){
			if(is_parent){
		    budgetMod.getUsers('all',function(results) {
		    	listeUsers = results;
			    	res.render('users.ejs', {listeUsers:  listeUsers, validForm: validForm, is_parent: is_parent, whoIs: whoIs});
					validForm = 0;
				});
			}
			else {
				res.redirect('/index');
			}
	    });
	}
});


// http://localhost:port/updUsers/:id
app.get("/updUsers/:id", function (req, res) { 
	
	if(!is_Log){
		res.redirect('/login');
	}
	else {
		budgetMod.isParent(whoIs, function(is_parent){
			if(is_parent){
		   	 budgetMod.getUsers(req.params.id,function(results) {
		    	listeUsers = results;
			    	res.render('updUser.ejs', { listeUsers:  listeUsers, validForm: validForm, is_parent: is_parent, whoIs: whoIs});
					validForm = 0;
				});
			}
			else {
				res.redirect('/index');
			}
	    });
	}
});


// http://localhost:port/updateUser/:id
app.post('/updateUser/:id', function(req, res){
	var requete = req.body;
	if(!is_Log){
		res.redirect('/login');
	}
	else {
		budgetMod.isParent(whoIs, function(is_parent){
			if(is_parent){
				if(requete.parent == 'on') {
					requete.parent = 1;
				}
				else requete.parent = 0;
				budgetMod.updUser(req.params.id, requete.nom, requete.prenom, requete.parent, requete.login, requete.pass1, function(results) {
					validForm = 1;
					res.redirect('/updUsers/'+req.params.id);
				});
			}
			else {
				res.redirect('/index');
			}
	    });
	}
});


// http://localhost:port/addUser
app.post('/addUser', function(req, res){
	var requete = req.body;
	if(!is_Log){
		res.redirect('/login');
	}
	else {
		budgetMod.isParent(whoIs, function(is_parent){
			if(is_parent){
				if(requete.parent == 'on') {
					requete.parent = 1;
				}
				else requete.parent = 0;
				budgetMod.addPersonne(requete.nom, requete.prenom, 0, requete.parent, function(results) {
					last_pers = results;

					budgetMod.addUser(last_pers, requete.login, requete.pass1, function(results) {
						if(results == 0){
							validForm = 1;
						}
						else validForm = 3;
						res.redirect('/users');
					});
				});
			}
			else {
				res.redirect('/index');
			}
	    });
	}
});


// http://localhost:port/delUsers/:id
app.get("/delUsers/:id", function (req, res) { 
	
	if(!is_Log){
		res.redirect('/login');
	}
	else {
		budgetMod.isParent(whoIs, function(is_parent){
			if(is_parent){
			    budgetMod.delUsers(req.params.id, function(results) {
					validForm = 2;
					res.redirect('/users');
			    });
			}
			else {
				res.redirect('/index');
			}
		});
	}
});


// http://localhost:port/trylogin
app.post('/trylogin', function(req, res){

	budgetMod.tryLog(req.body.login, req.body.password, function(results) {
    	if(results.length > 0){
			is_Log = 1;
			error_log = 0;
			whoIs = results[0].personne_connect;
			res.redirect('/index');
		}
		else {
			res.redirect('/login');
			error_log = 1;
		}
	});

});


// http://localhost:port/login
app.get('/login', function(req, res){
	if(is_Log){
		res.redirect('/index');
	}
	else {
		if(error_log){
			res.render('login.ejs', {error: true});
		}
		else res.render('login.ejs', {error: false});
	}
});


// http://localhost:port/logout
app.get('/logout', function(req, res){
	is_Log = 0;
	res.redirect('/login');
});


// En cas de page introuvable
app.use(function(req, res, next){
	res.setHeader('Content-Type','text/plain');
	res.send(404,'Page introuvable!');
});


// Socket pour tester l'existance ou non d'un login et renvoie la réponse
var http = require('http');
var fs = require('fs');
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(serverPort);

io.sockets.on('connection', function (socket){
	socket.on('testLog', function(message){
		budgetMod.testLogin(message, function(logRes) {
			socket.emit('logRes',logRes);
	    });

	});
});
