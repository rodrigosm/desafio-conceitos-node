const express = require("express");
const cors = require("cors");

// const { v4: uuid, validate: isUuid } = require('uuid'); // DEPRECATED

//Obtive essa forma de teste da versão 4 do 'uuid' através do site https://www.npmjs.com/package/uuid#uuidvalidatestr
const { v4: uuidv4, version: uuidVersion, validate: uuidValidate } = require('uuid');

const app = express();

app.use(express.json());
app.use(cors());

function validateRepositoryId(request, response, next) {
	const { id } = request.params;

	//Obtive essa forma de teste da versão 4 do 'uuid' através do site https://www.npmjs.com/package/uuid#uuidvalidatestr
	if(!(uuidValidate(id) && uuidVersion(id) === 4)) {
		return response.status(400).json({ error:'Invalid project ID.' });
	}

	return next();
}


function getRepositoryIndexById(response, id) {
	const repositoryIndex = repositories.findIndex(repository => repository.id == id);

	if(repositoryIndex < 0){
		return response.status(400).json({ error: 'Repository not found.' });
	}

	return repositoryIndex;
}

app.use('/repositories/:id', validateRepositoryId);

const repositories = [];

 /**
	*
	* Rota que lista todos os repositórios
  *
  */
app.get("/repositories", (request, response) => {

	//destruturando os parâmetros de query (cada parâmetro estará numa variável separada)
	const {title, url, techs} = request.query; //Query Params: Utilizados PRINCIPALMENTE/NORMALMENTE para filtros e paginação.

	//Utilizei o let para conseguir reatribuir o result após o segundo filtro (url) e o terceiro filtro (techs)
	let result = title
		? repositories.filter(repository => repository.title.includes(title))
		: repositories;

	//colocando o segundo filtro url
	result = url
	? result.filter(repository => repository.url.includes(url))
	: result;

	//colocando o terceiro filtro techs
	result = techs
	? result.filter(repository => repository.techs.includes(techs))
	: result;

	return response.json(result);
});

/**
 *
 *  A rota deve receber title, url e techs dentro do corpo da requisição, sendo a URL o link para
 *  o github desse repositório. Ao cadastrar um novo projeto, ele deve ser armazenado dentro de um
 *  objeto no seguinte formato:
 *  {
 *     id: "uuid",
 *     title: 'Desafio Node.js',
 *     url: 'http://github.com/...',
 *     techs: ["Node.js", "..."],
 *     likes: 0
 *  };
 *
 *  Certifique-se que o ID seja um UUID, e de sempre iniciar os likes como 0.
 *
 */
app.post("/repositories", (request, response) => {
	const { title, url, techs } = request.body;

	const repository = { id: uuidv4(), title, url, likes: 0, techs };
	repositories.push(repository);

	return response.json(repository);
});

/**
 *
 * A rota deve alterar apenas o title, a url e as techs do repositório que possua o id igual ao
 * id presente nos parâmetros da rota;
 *
 */
app.put("/repositories/:id", (request, response) => {
	const { id } = request.params;
	const { title, url, techs } = request.body;

	// const repositoryIndex = repositories.findIndex(repository => repository.id == id);

	// if(repositoryIndex < 0){
	// 	return response.status(400).json({ error: 'Repository not found.' });
	// }

	const repositoryIndex = getRepositoryIndexById(response, id);

	let repository = {
		id,
		title,
		url,
		techs
	};

	repository.likes = repositories[repositoryIndex].likes;
	repositories[repositoryIndex] = repository;

	return response.json(repository);

});

/**
 *
 * A rota deve deletar o repositório com o id presente nos parâmetros da rota;
 *
 */
app.delete("/repositories/:id", (request, response) => {
	const { id } = request.params;

	const repositoryIndex = getRepositoryIndexById(response, id);

	repositories.splice(repositoryIndex, 1);

	return response.status(204).send();
});

/**
 *
 * A rota deve aumentar o número de likes do repositório específico escolhido através do id presente
 * nos parâmetros da rota, a cada chamada dessa rota, o número de likes deve ser aumentado em 1;
 *
 */
app.post("/repositories/:id/like", (request, response) => {
	const { id } = request.params;

	const repositoryIndex = getRepositoryIndexById(response, id);

	repositories[repositoryIndex].likes++;

	return response.json(repositories[repositoryIndex]);

});

module.exports = app;
