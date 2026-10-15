//aqui vai ter um fetch do tipo POST

function criarController(repo) {
	
	return async function(req, res) {
		try {
			const resultado = await repo(req.body);
			return res.status(200).json({status: true, id: resultado.insertId});
		} catch (err) {
			return res.status(500).json({error: err.message});
		}
	}
}

module.exports = criarController;