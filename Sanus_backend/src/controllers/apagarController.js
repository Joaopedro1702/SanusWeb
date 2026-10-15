// fetch de DELETE

function apagarController(repo) {
	return async function(req, res) {
		try {
			const resultado = await repo({ id: req.params.id });
				if (resultado.affectedRows === 0) {
					return res.status(404).json({ error: "Não encontrado" });
				}
return res.status(200).json({ status: true });
		} catch (err) {
			return res.status(500).json({error: err.message});
		}
	}
}

module.exports = apagarController;