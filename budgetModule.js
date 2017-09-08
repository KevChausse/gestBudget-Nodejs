var mysql = require('mysql');
var bcrypt = require('bcrypt');
const saltRounds = 10;

var connection = mysql.createConnection({
	host : 'localhost', // à renseigner
	port: 3307, // à renseigner
	user : 'root', // à renseigner
	password : 'root', // à renseigner
	database : 'DB_Budget' // à renseigner
});


connection.connect();





/***** GESTION USERS *****/


// Retourne le prenom d'une personne en passant son id en paramètre
var getName = function(idPers, retFunc){
	connection.query("SELECT nom_personne, prenom_personne FROM personnes WHERE id_personne='"+idPers+"'",function(error, results, fields) {
    	retFunc(results[0].prenom_personne);
   });
}


// Retourne l'id de la personne correspondant au login et mot de passe en paramètre
var tryLog = function(login, password, retFunc){
	connection.query("SELECT personne_connect FROM connect WHERE login_connect='"+login+"' AND password_connect='"+password+"'",function(error, results, fields) {
		
		retFunc(results);

	});	
}


// Retourne si une personne est un parent ou non avec son id en paramètre
var isParent = function(id_personne, retFunc){
	connection.query("SELECT is_parent FROM personnes WHERE id_personne = "+id_personne, function(error, results, fields){
		retFunc(results[0].is_parent);
	});
}


//  Retourne si un login passé en paramètre existe déjà ou non
var testLogin = function(login, retFunc){
	connection.query("SELECT login_connect FROM connect WHERE login_connect = '"+login+"'",function(error, results, fields) {
		if(results.length > 0){
			retFunc(true);
		}
    	else retFunc(false);
    }); 
}


// Ajoute un utilisateur dans la base de données
var addUser = function(id_personne, login, password, retFunc) {
	connection.query("INSERT INTO connect (login_connect, password_connect, personne_connect) VALUES ('"+login+"','"+password+"',"+id_personne+")",function(error, results, fields) {
		retFunc(0);
	});
}


// Retourne la liste des utilisateurs (si idUser=="all") ou un utilisateur en particulier suivant l'id renseigné en paramètres
var getUsers = function(idUser, retFunc){
	var query = "SELECT id_personne, nom_personne, prenom_personne, is_parent, login_connect, password_connect FROM personnes p LEFT JOIN connect c ON p.id_personne = c.personne_connect";
	if(idUser != 'all'){
		query += " WHERE id_personne = "+idUser;
	}
	query += " ORDER BY nom_personne";
	connection.query(query,function(error, results, fields) {
    	retFunc(results);
    }); 
}


// Modifie les données d'un utilisateur dans la base de données
var updUser = function(id_personne, nom, prenom, parent, login, password, retFunc) {
	var query1;
	if(login){ 
		query1 = "INSERT INTO connect (login_connect, password_connect, personne_connect) VALUES ('"+login+"','',"+id_personne+")";
	} else if(password) {
		query1 = "UPDATE connect SET password_connect = '"+password+"' WHERE personne_connect = '"+id_personne+"'";
	}

	var query2 = "UPDATE personnes SET nom_personne ='"+nom+"', prenom_personne = '"+prenom+"', is_parent = "+parent+" WHERE id_personne = "+id_personne;

	connection.query(query2 ,function(error, results, fields) {
		if(query1){
			connection.query(query1 ,function(error, results, fields) {
				retFunc('ok');
			});
		}
		else {
			retFunc('ok');
		}
	});
}


// Supprime un utilisateur ainsi que des dépenses et rentrées
var delUsers = function(idUser, retFunc){
	connection.query("DELETE FROM rentrees WHERE personne_rentree = "+idUser,function(error, results, fields) {
		connection.query("DELETE FROM depenses WHERE personne_depense = "+idUser,function(error, results, fields) {
			connection.query("DELETE FROM connect WHERE personne_connect = "+idUser,function(error, results, fields) {
				connection.query("DELETE FROM personnes WHERE id_personne = "+idUser,function(error, results, fields) {
    				retFunc(idUser);
    			}); 
			}); 
		}); 
    }); 
}


// Ajoute une nouvelle personne à la base de données et retourne son id
var addPersonne = function(nom, prenom, id_personne, is_parent, retFunc){
	if(id_personne == 0){
		connection.query("INSERT INTO personnes (nom_personne, prenom_personne, is_parent) VALUES ('"+nom+"','"+prenom+"',"+is_parent+")",function(error, results, fields) {
			retFunc(results.insertId);
		});
	}
	else {
		retFunc(id_personne);
	}
}


// retourne la liste des personnes
var getPersonnes = function(retFunc){
	connection.query("SELECT id_personne, nom_personne, prenom_personne, is_parent FROM personnes ORDER BY nom_personne",function(error, results, fields) {
    	retFunc(results);
    }); 
}

exports.getName = getName;
exports.tryLog = tryLog;
exports.isParent = isParent;
exports.testLogin = testLogin;
exports.addUser = addUser;
exports.getUsers = getUsers;
exports.updUser = updUser;
exports.delUsers = delUsers;
exports.addPersonne = addPersonne;
exports.getPersonnes = getPersonnes;





/***** GESTION DEPENSES *****/

// Ajoute une nouvelle dépense à la base de données et retourne son id
var addDepenses = function(montant, date, raison, pers, retFunc){
	connection.query("INSERT INTO depenses (montant_depense, date_depense, poste_depense, personne_depense) VALUES ('"+montant+"','"+date+"',"+raison+","+pers+")",function(error, results, fields) {
		retFunc(results.insertId);
	});
}


// Retourne la liste des dépenses (si idPers == "all") ou les dépenses d'une personne suivant l'id de cette personne donnée en paramètres
var getDepenses = function(idPers, retFunc){
	query = "SELECT id_depense, nom_poste, DATE_FORMAT(date_depense, '%Y-%m-%d') AS 'm_date_depense', prenom_personne, nom_personne, montant_depense FROM depenses d JOIN personnes p on d.personne_depense = p.id_personne JOIN poste_depenses pst ON d.poste_depense = pst.id_poste";
	if(idPers != 'all') {
		query += " WHERE personne_depense = "+idPers;
	}
	query += " ORDER BY (m_date_depense) DESC";
	connection.query(query,function(error, results, fields) {
	    retFunc(results);
	});
}


//Retourne une dépense suivant son id renseignée en paramètres
var getDepensesId = function(id_dep, retFunc){
	query = "SELECT id_depense, nom_poste, DATE_FORMAT(date_depense, '%Y-%m-%d') AS 'm_date_depense', prenom_personne, nom_personne, montant_depense, personne_depense, poste_depense FROM depenses d JOIN personnes p on d.personne_depense = p.id_personne JOIN poste_depenses pst ON d.poste_depense = pst.id_poste WHERE id_depense = "+id_dep;

	connection.query(query,function(error, results, fields) {
	    retFunc(results);
	});
}


// Met a jour les données d'une dépense en fonction de son id renseignée en paramètres et retourne cet id
var updDepenses = function(id_depense, montant, date, poste, pers, retFunc){
	var query ="UPDATE depenses SET montant_depense = "+montant+", date_depense = '"+date+"', poste_depense="+poste+", personne_depense="+pers+" WHERE id_depense = "+id_depense;
	connection.query(query ,function(error, results, fields) {
		retFunc(id_depense);
	});
}


// Supprime une dépense et retourne son id
var delDepenses = function(id_depense, retFunc){
	connection.query("DELETE FROM depenses WHERE id_depense = "+id_depense+";",function(error, results, fields) {
			retFunc(id_depense);
	});
}


//Ajoute un nouveau poste de dépense si celui ci n'existe pas déjà et retourne son id
var addPoste = function(textPoste, id_raison, retFunc){
	if(id_raison == 0){
		connection.query("SELECT id_poste FROM poste_depenses WHERE nom_poste = '"+textPoste+"'", function(error, results, fields){
			if(results.length <= 0){
				connection.query("INSERT INTO poste_depenses (nom_poste) VALUES ('"+textPoste+"')",function(error, results1, fields) {
					retFunc(results1.insertId);
				});
			}
			else retFunc(results[0].id_poste);
		});
	}
	else {
		retFunc(id_raison);
	}
}


// Retourne la liste des postes de dépenses
var getPoste = function(retFunc){
	connection.query("SELECT id_poste, nom_poste FROM poste_depenses",function(error, results, fields) {
    	retFunc(results);
    }); 
}


exports.addDepenses = addDepenses;
exports.getDepenses = getDepenses;
exports.getDepensesId = getDepensesId;
exports.updDepenses = updDepenses;
exports.delDepenses = delDepenses;
exports.addPoste = addPoste;
exports.getPoste = getPoste;





/***** GESTION RENTREES *****/


// Ajoute une nouvelle rentrée et retourne l'id de cette entrée
var addRentrees = function(montant, date, origine, pers, retFunc){
	connection.query("INSERT INTO rentrees (montant_rentree, date_rentree, origine_rentree, personne_rentree) VALUES ('"+montant+"','"+date+"',"+origine+","+pers+")",function(error, results, fields) {
		retFunc(results.insertId);
	});
}


// retourne la liste des rentrées (si idPers == "all") ou les rentrées d'une personne suivant l'id de cette personne donnée en paramètres
var getRentrees = function(idPers, retFunc){
	query = "SELECT id_rentree, nom_origine, DATE_FORMAT(date_rentree, '%Y-%m-%d') AS 'm_date_rentree', prenom_personne, nom_personne, montant_rentree FROM rentrees d JOIN personnes p on d.personne_rentree = p.id_personne JOIN origine_rentrees r ON d.origine_rentree = r.id_origine";
	if(idPers != 'all') {
		query += " WHERE personne_rentree = "+idPers;
	}
	query += " ORDER BY (m_date_rentree) DESC";
	connection.query(query,function(error, results, fields) {
	    retFunc(results);
	});
}


// Retourne une entrée en fonction de l'id donné en paramètres
var getRentreesId = function(id_rentree, retFunc){
	query = "SELECT id_rentree, nom_origine, DATE_FORMAT(date_rentree, '%Y-%m-%d') AS 'm_date_rentree', prenom_personne, nom_personne, montant_rentree, personne_rentree, origine_rentree FROM rentrees d JOIN personnes p on d.personne_rentree = p.id_personne JOIN origine_rentrees r ON d.origine_rentree = r.id_origine WHERE id_rentree = "+id_rentree;
	connection.query(query,function(error, results, fields) {
	    retFunc(results);
	});
}


// Met a jour une rentrée et retourne l'id de cette rentrée
var updRentrees = function(id_rentree, montant, date, origine, pers, retFunc){
	var query ="UPDATE rentrees SET montant_rentree = "+montant+", date_rentree = '"+date+"', origine_rentree="+origine+", personne_rentree="+pers+" WHERE id_rentree = "+id_rentree;
	connection.query(query ,function(error, results, fields) {
		retFunc(id_rentree);
	});
}


// supprime un rentrée et retourne son id
var delRentrees = function(id_rentree, retFunc){
	connection.query("DELETE FROM rentrees WHERE id_rentree = "+id_rentree+";",function(error, results, fields) {
			retFunc(id_rentree);
	});
}


// Ajoute une nouvelle origine si elle n'existe pas déjà et retourne son id
var addOrigine = function(textOrigine, id_origine, retFunc){
	if(id_origine == 0){
		connection.query("SELECT id_origine FROM origine_rentrees WHERE nom_origine = '"+textOrigine+"'", function(error, results, fields){
			if(results.length <= 0){
				connection.query("INSERT INTO origine_rentrees (nom_origine) VALUES ('"+textOrigine+"')",function(error, results1, fields) {
					retFunc(results1.insertId);
				});
			}
			else retFunc(results[0].id_origine);
		});
	}
	else {
		retFunc(id_origine);
	}
}


// retourne la liste des origines
var getOrigine = function(retFunc){
	connection.query("SELECT id_origine, nom_origine FROM origine_rentrees",function(error, results, fields) {
    	retFunc(results);
    }); 
}


exports.addRentrees = addRentrees;
exports.getRentrees = getRentrees;
exports.getRentreesId = getRentreesId;
exports.updRentrees = updRentrees;
exports.delRentrees = delRentrees;
exports.addOrigine = addOrigine;
exports.getOrigine = getOrigine;





/***** GESTION BUDGET *****/


// Ajoute un nouveau budget, une nouvelle dépense, une nouvelle rentrée et de nouveaux utilisateurs et retourne l'id de l'emetteur de la dépense
var addBudget = function(personne_e, nom_e, prenom_e, personne_r, nom_r, prenom_r, raisons, newRaison, montant, date, retFunc){
	addPersonne(nom_e, prenom_e, personne_e, 1, function(id_emet) {
		addPersonne(nom_r, prenom_r, personne_r, 1, function(id_rcpt) {
			addRaison(newRaison, raisons, function(id_raison, text_raison) {
				addOrigine(text_raison, 0, function(id_origine) {
					addPoste(text_raison, 0, function(id_poste) {
						addDepenses(montant, date, id_poste, id_emet, function(id_depense) { 
							addRentrees(montant, date, id_origine, id_rcpt, function(id_rentree) { 
								connection.query("INSERT INTO budgets (montant_budget, date_budget, emetteur_budget, recepteur_budget, depense_budget, rentree_budget, raison_budget) VALUES ("+montant+",'"+date+"', "+id_emet+", "+id_rcpt+", "+id_depense+", "+id_rentree+", "+id_raison+")",function(error, results, fields) {
								    retFunc(id_emet);
								});
							});
						});
					});
				});
			});
		});
	});
}


// Met a jour un budget, une dépense et une rentrée et retourne l'id de l'emetteur de la dépense
var updBudget = function(id_budget, personne_e, nom_e, prenom_e, personne_r, nom_r, prenom_r, raisons, newRaison, montant, date, retFunc){
	addPersonne(nom_e, prenom_e, personne_e, 1, function(id_emet) {
		addPersonne(nom_r, prenom_r, personne_r, 1, function(id_rcpt) {
			addRaison(newRaison, raisons, function(id_raison, text_raison) {
				addOrigine(text_raison, 0, function(id_origine) {
					addPoste(text_raison, 0, function(id_poste) {
						getBudgetId(id_budget, function(thisBudget) {
							updDepenses(thisBudget[0].depense_budget, montant, date, id_poste, id_emet, function(id_depense) { 
								updRentrees(thisBudget[0].rentree_budget, montant, date, id_origine, id_rcpt, function(id_rentree) { 
									connection.query("UPDATE budgets SET montant_budget = "+montant+", date_budget = '"+date+"', emetteur_budget = "+id_emet+", recepteur_budget = "+id_rcpt+", depense_budget = "+id_depense+", rentree_budget = "+id_rentree+", raison_budget = "+id_raison+" WHERE id_budget = "+id_budget, function(error, results, fields) {
									    retFunc(id_emet);
									});
								});
							});
						});
					});
				});
			});
		});
	});
}


// Retourne la liste des budgets (si idPers == "all") ou les budgets d'une personne suivant l'id de cette personne donnée en paramètres
var getBudget = function(idPers, retFunc){
	query = "SELECT id_budget, montant_budget, DATE_FORMAT(date_budget, '%Y-%m-%d') AS 'm_date_budget', e.nom_personne as emetteur_nom, e.prenom_personne as emetteur_prenom, r.nom_personne as recepteur_nom, r.prenom_personne as recepteur_prenom, nom_raison FROM `budgets` b LEFT JOIN rentrees re ON b.rentree_budget = re.id_rentree LEFT JOIN raison_budgets rb ON b.raison_budget = rb.id_raison LEFT JOIN personnes e on b.emetteur_budget = e.id_personne LEFT JOIN personnes r on b.recepteur_budget = r.id_personne ";
	if(idPers != 'all') {
		query += " WHERE emetteur_budget = "+idPers;
	}
	query += " ORDER BY (m_date_budget) DESC";
	connection.query(query,function(error, results, fields) {
	    retFunc(results);
	});
}


// Retourne un budget suivant l'id renseigné en paramètres
var getBudgetId = function(id_budget, retFunc){
	query = "SELECT id_budget, montant_budget, DATE_FORMAT(date_budget, '%Y-%m-%d') AS 'm_date_budget', emetteur_budget, recepteur_budget,raison_budget, e.nom_personne as emetteur_nom, e.prenom_personne as emetteur_prenom, r.nom_personne as recepteur_nom, r.prenom_personne as recepteur_prenom, nom_raison, depense_budget, rentree_budget FROM `budgets` b LEFT JOIN rentrees re ON b.rentree_budget = re.id_rentree LEFT JOIN raison_budgets rb ON b.raison_budget = rb.id_raison LEFT JOIN personnes e on b.emetteur_budget = e.id_personne LEFT JOIN personnes r on b.recepteur_budget = r.id_personne WHERE id_budget = "+id_budget;
	connection.query(query,function(error, results, fields) {
	    retFunc(results);
	});
}


// Supprime un budget ainsi que la dépense et la rentrée correspondante
var delBudget = function(id_budget, retFunc){
	connection.query('SELECT depense_budget, rentree_budget FROM budgets WHERE id_budget = '+id_budget, function(error, results, fields) {
		id_depense = results[0].depense_budget;
		id_rentree = results[0].rentree_budget;
		connection.query('DELETE FROM depenses WHERE id_depense = '+id_depense, function(error, results, fields){
			connection.query('DELETE FROM rentrees WHERE id_rentree = '+id_depense, function(error, results, fields){
				connection.query('DELETE FROM budgets WHERE id_budget = '+id_budget, function(error, results, fields){
					retFunc('ok');
				});
			});
		});
	});
}


// Ajoute une nouvelle raison et retourne l'id et le texte de cette raison
var addRaison = function(textRaison, idRaison, retFunc){
	if(idRaison == 0){
		connection.query("INSERT INTO raison_budgets (nom_raison) VALUES ('"+textRaison+"')",function(error, results, fields) {
			retFunc(results.insertId, textRaison);
		});
	}
	else {
		connection.query("SELECT nom_raison FROM raison_budgets WHERE id_raison = "+idRaison,function(error, results, fields) {
			retFunc(idRaison, results[0].nom_raison);
		});
	}
}


// retourne la liste des raisons
var getRaisons = function(retFunc){
	connection.query("SELECT id_raison, nom_raison FROM raison_budgets",function(error, results, fields) {
    	retFunc(results);
    }); 
}



exports.addBudget = addBudget;
exports.updBudget = updBudget;
exports.getBudget = getBudget;
exports.getBudgetId = getBudgetId;
exports.delBudget = delBudget;
exports.addRaison = addRaison;
exports.getRaisons = getRaisons;





/***** GESTION TRANSACTIONS *****/


// retourne la liste des transactions d'une personne entrée en paramètre
var getTransac = function(idPers, retFunc){
	var tab1, tab2;
	var query1 = "SELECT id_depense AS id, nom_poste AS nom_transac, DATE_FORMAT(date_depense, '%Y-%m-%d') AS 'm_date', prenom_personne, nom_personne, montant_depense AS montant_n FROM depenses d JOIN personnes p on d.personne_depense = p.id_personne JOIN poste_depenses pst ON d.poste_depense = pst.id_poste WHERE personne_depense = "+idPers;
	var query2 = "SELECT id_rentree AS id, nom_origine AS nom_transac, DATE_FORMAT(date_rentree, '%Y-%m-%d') AS 'm_date', prenom_personne, nom_personne, montant_rentree AS montant_p FROM rentrees d JOIN personnes p on d.personne_rentree = p.id_personne JOIN origine_rentrees r ON d.origine_rentree = r.id_origine WHERE personne_rentree = "+idPers;
	connection.query(query1,function(error, results, fields) {
	    tab1 = results;
	    connection.query(query2,function(error, results, fields) {
		    tab2 = results;

		    retFunc(tab1.concat(tab2).sort(function (a, b) {
			  return a.m_date < b.m_date;
			}));
		});
	});

}


// retourne le total des transactions d'une personne entrée en paramètres
var getTotalTransac = function(idPers, retFunc){
	connection.query("SELECT SUM(montant_depense) AS montant_n FROM depenses WHERE personne_depense = "+idPers,function(error, results, fields) {
	    sum_depenses = results[0].montant_n;
	    connection.query("SELECT SUM(montant_rentree) AS montant_p FROM rentrees WHERE personne_rentree = "+idPers,function(error, results, fields) {
		    sum_rentres = results[0].montant_p;

		    retFunc(sum_rentres - sum_depenses);
		});
	});
}


// retourne le total des transactions de chaque personnes
var getTotalAllTransac = function(retFunc){
	var total_tab = [];
	connection.query("SELECT COALESCE(SUM(montant_rentree), 0) as sum_rentrees, id_personne, nom_personne, prenom_personne FROM personnes p left JOIN rentrees r ON p.id_personne = r.personne_rentree GROUP BY id_personne ORDER BY nom_personne",function(error, results, fields) {
	    sum_rentrees = results;
	    connection.query("SELECT COALESCE(SUM(montant_depense), 0) as sum_depenses, id_personne, nom_personne, prenom_personne FROM personnes p left JOIN depenses d ON p.id_personne = d.personne_depense GROUP BY id_personne ORDER BY nom_personne",function(error, results, fields) {
		    sum_depenses = results;
		    for(var ind = 0; ind < sum_depenses.length; ind++){
		    	total_tab[ind] = { 'id': sum_depenses[ind].id_personne, 'nom': sum_depenses[ind].prenom_personne+" "+sum_depenses[ind].nom_personne, 'total': (sum_rentrees[ind].sum_rentrees-sum_depenses[ind].sum_depenses) };
		    }
		    retFunc(total_tab);
		});
	});
}



exports.getTransac = getTransac;
exports.getTotalTransac = getTotalTransac;
exports.getTotalAllTransac = getTotalAllTransac;

