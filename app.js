const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
//API 1
app.get(`/todos/`, async (request, response) => {
  const { status = "", priority = "", search_q = "" } = request.query;
  const getTodosQuery = `
    SELECT *
    FROM todo
    WHERE todo LIKE '%${search_q}%'
    AND priority LIKE '%${priority}%'
    AND status LIKE '%${status}%';
    `;
  const getTodosArray = await db.all(getTodosQuery);
  response.send(getTodosArray);
});
//API 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
  SELECT * 
  FROM todo
  WHERE id=${todoId};
  `;
  const getTodo = await db.get(getTodoQuery);
  response.send(getTodo);
});
//API 3
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const postTodoQuery = `
    INSERT INTO todo(id,todo,priority,status)
    VALUES(${id},'${todo}','${priority}','${status}');
    `;
  const postTodo = await db.run(postTodoQuery);
  response.send("Todo Successfully Added");
});
//API 4
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getprevtodoQuery = `
  SELECT * 
  FROM todo
  WHERE id=${todoId};
  `;
  const prevTodo = await db.get(getTodoQuery);
  const {
    todo = prevTodo.todo,
    priority = prevTodo.priority,
    status = prevTodo.status,
  } = request.body;
  const updateTodoQuery = `
  UPDATE todo
  SET todo=${todo},priority=${priority},status=${status}
  WHERE id=${todoId};
  `;
  const updateTodo = await db.run(updateTodoQuery);
  const requestUpdateValues = request.body;
  let updatedValue;
  switch (true) {
    case requestUpdateValues.status !== undefined:
      updatedValue = "Status";
      break;
    case requestUpdateValues.priority !== undefined:
      updatedValue = "Priority";
      break;
    case requestUpdateValues.todo !== undefined:
      updatedValue = "Todo";
      break;
  }
  response.send(`${updatedValue} Updated`);
});
//API 5
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
    DELETE FROM todo
    WHERE id=${todoId};
    `;
  const deleteTodo = await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});
module.exports = app;
