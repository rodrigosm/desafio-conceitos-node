const request = require("supertest");
const app = require("../app");
const { validate: isUuid } = require("uuid");

describe("Repositories", () => {

	/**
	 * Para que esse teste passe, sua aplicação deve permitir que um repositório seja criado,
	 * e retorne um json com o projeto criado.
	 */
  it("should be able to create a new repository", async () => {
    const response = await request(app)
      .post("/repositories")
      .send({
        url: "https://github.com/Rocketseat/umbriel",
        title: "Umbriel",
        techs: ["Node", "Express", "TypeScript"]
      });

    expect(isUuid(response.body.id)).toBe(true);

    expect(response.body).toMatchObject({
      url: "https://github.com/Rocketseat/umbriel",
      title: "Umbriel",
      techs: ["Node", "Express", "TypeScript"],
      likes: 0
    });
  });

	/**
	 * Para que esse teste passe, sua aplicação deve permitir que seja retornado um array
	 * com todos os repositórios que foram criados até o momento.
	 */
  it("should be able to list the repositories", async () => {
    const repository = await request(app)
      .post("/repositories")
      .send({
        url: "https://github.com/Rocketseat/umbriel",
        title: "Umbriel",
        techs: ["Node", "Express", "TypeScript"]
      });

    const response = await request(app).get("/repositories");

    expect(response.body).toEqual(
      expect.arrayContaining([
        {
          id: repository.body.id,
          url: "https://github.com/Rocketseat/umbriel",
          title: "Umbriel",
          techs: ["Node", "Express", "TypeScript"],
          likes: 0
        }
      ])
    );
  });

	/**
	 * Para que esse teste passe, sua aplicação deve permitir que sejam alterados apenas os campos
	 * url, title e techs.
	 */
  it("should be able to update repository", async () => {
    const repository = await request(app)
      .post("/repositories")
      .send({
        url: "https://github.com/Rocketseat/umbriel",
        title: "Umbriel",
        techs: ["Node", "Express", "TypeScript"]
      });

    const response = await request(app)
      .put(`/repositories/${repository.body.id}`)
      .send({
        url: "https://github.com/Rocketseat/unform",
        title: "Unform",
        techs: ["React", "ReactNative", "TypeScript", "ContextApi"]
      });

    expect(isUuid(response.body.id)).toBe(true);

    expect(response.body).toMatchObject({
      url: "https://github.com/Rocketseat/unform",
      title: "Unform",
      techs: ["React", "ReactNative", "TypeScript", "ContextApi"]
    });
  });

	/**
	 * Para que esse teste passe, você deve validar na sua rota de update se o id do repositório
	 * enviado pela url existe ou não. Caso não exista, retornar um erro com status 400.
	 */
  it("should not be able to update a repository that does not exist", async () => {
    await request(app).put(`/repositories/123`).expect(400);
  });

	/**
	 * Para que esse teste passe, você não deve permitir que sua rota de update altere diretamente
	 * os likes desse repositório, mantendo o mesmo número de likes que o repositório já possuia antes
	 * da atualização. Isso porque o único lugar que deve atualizar essa informação é a rota responsável
	 * por aumentar o número de likes.
	 */
  it("should not be able to update repository likes manually", async () => {
    const repository = await request(app)
      .post("/repositories")
      .send({
        url: "https://github.com/Rocketseat/umbriel",
        title: "Umbriel",
        techs: ["React", "ReactNative", "TypeScript", "ContextApi"]
      });

    await request(app)
    .post(`/repositories/${repository.body.id}/like`);

    const response = await request(app)
      .put(`/repositories/${repository.body.id}`)
      .send({
        likes: 15
      });

    expect(response.body).toMatchObject({
      likes: 1
    });
  });

	/**
	 * Para que esse teste passe, você deve permitir que a sua rota de delete exclua um projeto,
	 * e ao fazer a exclusão, ele retorne uma resposta vazia, com status 204.
	 */
  it("should be able to delete the repository", async () => {
    const response = await request(app)
      .post("/repositories")
      .send({
        url: "https://github.com/Rocketseat/umbriel",
        title: "Umbriel",
        techs: ["Node", "Express", "TypeScript"]
      });

    await request(app).delete(`/repositories/${response.body.id}`).expect(204);

    const repositories = await request(app).get("/repositories");

    const repository = repositories.body.find((r) => r.id === response.body.id);

    expect(repository).toBe(undefined);
  });

	/**
	 * Para que esse teste passe, você deve validar na sua rota de delete se o id do repositório
	 * enviado pela url existe ou não. Caso não exista, retornar um erro com status 400.
	 */
  it("should not be able to delete a repository that does not exist", async () => {
    await request(app).delete(`/repositories/123`).expect(400);
  });
});
