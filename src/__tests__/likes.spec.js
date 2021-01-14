const request = require("supertest");
const app = require("../app");

describe("Likes", () => {

	/**
	 * Para que esse teste passe, sua aplicação deve permitir que um repositório
	 * com o id informado possa receber likes. O valor de likes deve ser incrementado
	 * em 1 a cada requisição, e como resultado, retornar um json contendo o repositório
	 * com o número de likes atualizado.
	 */
  it("should be able to give a like to the repository", async () => {
    const repository = await request(app)
      .post("/repositories")
      .send({
        url: "https://github.com/Rocketseat/umbriel",
        title: "Umbriel",
        techs: ["Node", "Express", "TypeScript"]
      });

    let response = await request(app).post(
      `/repositories/${repository.body.id}/like`
    );

    expect(response.body).toMatchObject({
      likes: 1
    });

    response = await request(app).post(
      `/repositories/${repository.body.id}/like`
    );

    expect(response.body).toMatchObject({
      likes: 2
    });
  });

	/**
	 * Para que esse teste passe, você deve validar na sua rota de like se o id do repositório
	 * enviado pela url existe ou não. Caso não exista, retornar um erro com status 400.
	 */
  it("should not be able to like a repository that does not exist", async () => {
    await request(app)
      .post(`/repositories/123/like`)
      .expect(400);
  });
});
