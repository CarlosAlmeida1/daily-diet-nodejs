<h1 align="center">Daily Diet API</h1>

### Tecnologias Utilizadas

- Node.js
- Fastify
- TypeScript
- Vitest
- Supertest
- Knex
- SQLite

### Checklist das Regras da Aplicação

- [x] Deve ser possível' criar um usuário
- [x] Deve ser possível identificar o usuário entre as requisições
- [x] Deve ser possível registrar uma refeição feita, com as seguintes informações:
  - [x] Nome
  - [x] Descrição
  - [x] Data e Hora
  - [x] Está dentro ou não da dieta
- [x] As refeições devem ser relacionadas a um usuário
- [x] Deve ser possível editar uma refeição, podendo alterar todos os dados acima
- [x] Deve ser possível apagar uma refeição
- [x] Deve ser possível listar todas as refeições de um usuário
- [x] Deve ser possível visualizar uma única refeição
- [x] Deve ser possível recuperar as métricas de um usuário
  - [x] Quantidade total de refeições registradas
  - [x] Quantidade total de refeições dentro da dieta
  - [x] Quantidade total de refeições fora da dieta
  - [x] Melhor sequência de refeições dentro da dieta
- [x] O usuário só pode visualizar, editar e apagar as refeições o qual ele criou



### Rotas da Aplicação

- `POST /users`: Rota para criar um usuário

  - Request Body:

    ```json
    {
      "name": "John Doe",
      "email": "johndoe@gmail.com"
    }
    ```

- `POST /meals`: Rota para criar uma refeição

  - Request Body:

    ```json
    {
      "name": "Breakfast",
      "description": "Açai",
      "date": "2021-09-01T12:00:00.000Z",
      "is_diet": true
    }
    ```
- `GET /meals`: Rota para listar todas as refeições de um usuário

- `GET /meals/:id`: Rota para visualizar uma única refeição

- `PUT /meals/:id`: Rota para editar uma refeição

  - Request Body:

    ```json
    {
      "name": "Breakfast",
      "description": "Açai",
      "date": "2021-09-01T12:00:00.000Z",
      "is_diet": false
    }
    ```
- `DELETE /meals/:id`: Rota para apagar uma refeição

- `GET /metrics`: Rota para recuperar as métricas de um usuário

<h2 align="center"> Feito por Carlos Henrique ❤️</h2>
