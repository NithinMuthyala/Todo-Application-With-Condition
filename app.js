const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const format = require("date-fns/format");
const isValid = require("date-fns/isValid");
const isMatch = require("date-fns/isMatch");

const app = express();
app.use(express.json());

let db;
const dbpath = path.join(__dirname, "todoApplication.db");
const initialize = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running at .......");
    });
  } catch (e) {
    console.log("DBErrpr");
  }
};
initialize();

const hasStatusProperty = (propertyvalue) => {
  return propertyvalue.status !== undefined;
};
//console.log(db);
const hasPriorityandStatus = (requestdetails) => {
  return (
    requestdetails.priority !== undefined && requestdetails.status !== undefined
  );
};
const hasCategoryandStatus = (requestdetails) => {
  return (
    requestdetails.category !== undefined && requestdetails.status !== undefined
  );
};
const hasCategoryandPriority = (requestdetails) => {
  return (
    requestdetails.category !== undefined &&
    requestdetails.priority !== undefined
  );
};
const hasStatus = (requestdetails) => {
  return requestdetails.status !== undefined;
};
const hasPriority = (requestdetails) => {
  return requestdetails.priority !== undefined;
};
const hasCategory = (requestdetails) => {
  return requestdetails.category !== undefined;
};
const hasSearch = (requestdetails) => {
  return requestdetails.search_q !== undefined;
};
let statusArray = ["TO DO", "IN PROGRESS", "DONE"];
let priorityArray = ["HIGH", "MEDIUM", "LOW"];
let categoryArray = ["WORK", "HOME", "LEARNING"];

const converttoCamelcase = (eachobj) => {
  return {
    id: eachobj.id,
    todo: eachobj.todo,
    priority: eachobj.priority,
    status: eachobj.status,
    category: eachobj.category,
    dueDate: eachobj.due_date,
  };
};

// api1
app.get("/todos/", async (request, response) => {
  const requestdetails = request.query;
  const { priority, status, category, search_q = "" } = requestdetails;
  switch (true) {
    case hasPriorityandStatus(requestdetails):
      if (priorityArray.includes(priority)) {
        if (statusArray.includes(status)) {
          console.log(priority);
          console.log(status);
          const dbquery = `select * from todo where status = "${status}"
           and priority = "${priority}"`;
          const dbresponse = await db.all(dbquery);

          const convertedarray = dbresponse.map((eachobj) => {
            return converttoCamelcase(eachobj);
          });
          response.status(200);
          response.send(convertedarray);
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        respoonse.send("Invalid Todo Priority");
      }
      break;
    case hasCategoryandStatus(requestdetails):
      if (categoryArray.includes(category)) {
        if (statusArray.includes(status)) {
          const dbquery = `select * from todo
                             where category = "${category}"
                             and status = "${status}"`;
          const dbresponse = await db.all(dbquery);
          const convertedarray = dbresponse.map((eachobj) => {
            return converttoCamelcase(eachobj);
          });
          response.status(200);
          response.send(convertedarray);
        } else {
          response.status(400);
          response.send("Invalid Todo Category");
        }
      } else {
        response.send(400);
        response.status("Invalid Todo Status");
      }
      break;
    case hasCategoryandPriority(requestdetails):
      if (categoryArray.includes(category)) {
        if (priorityArray.includes(priority)) {
          const dbquery = `SELECT * FROM todo WHERE category = "${category}"
                                         AND priority = "${priority}";`;
          const dbresponse = await db.all(dbquery);
          const convertedarray = dbresponse.map((eachobj) => {
            return converttoCamelcase(eachobj);
          });
          response.status(200);
          response.send(convertedarray);
        } else {
          response.status(400);
          response.send("Invalid Todo Category");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case hasStatus(requestdetails):
      if (statusArray.includes(status)) {
        const dbquery = `SELECT * FROM todo WHERE status = "${status}";`;
        const dbresponse = await db.all(dbquery);
        const convertedarray = dbresponse.map((eachobj) => {
          return converttoCamelcase(eachobj);
        });
        response.status(200);
        response.send(convertedarray);
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case hasPriority(requestdetails):
      console.log(hasPriority(requestdetails));
      console.log(priorityArray.includes(priority));
      if (priorityArray.includes(priority)) {
        const dbquery = `select * from todo where priority = "${priority}";`;
        const dbresponse = await db.all(dbquery);
        console.log(dbresponse);
        const convertedarray = dbresponse.map((eachobj) => {
          return converttoCamelcase(eachobj);
        });
        response.status(200);
        response.send(convertedarray);
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case hasCategory(requestdetails):
      if (categoryArray.includes(category)) {
        const dbquery = `SELECT * FROM todo WHERE category = "${category}"`;
        const dbresponse = await db.all(dbquery);
        const convertedarray = dbresponse.map((eachobj) => {
          return converttoCamelcase(eachobj);
        });
        response.status(200);
        response.send(convertedarray);
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case hasSearch(requestdetails):
      const dbquery = `SELECT * FROM todo WHERE todo like "%${search_q}%"`;
      const dbresponse = await db.all(dbquery);
      const convertedarray = dbresponse.map((eachobj) => {
        return converttoCamelcase(eachobj);
      });
      response.status(200);
      response.send(convertedarray);
  }
});

// api2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const dbquery = `SELECT * FROM todo WHERE id = ${todoId};`;
  const dbresponse = await db.get(dbquery);

  response.send(converttoCamelcase(dbresponse));
});

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;

  //console.log(await isMatch(date));
  try {
    const userdate = new Date(date);
    const result = isValid(userdate);
    const formmated = format(new Date(userdate), "yyyy-MM-dd");
    if (result) {
      const dbquery = `select * from todo where due_date = "${formmated}";`;
      const dbresponse = await db.all(dbquery);
      const convert = dbresponse.map((eachobj) => {
        return converttoCamelcase(eachobj);
      });
      response.status(200);
      response.send(convert);
    } else {
      response.status(400);
      response.send("Invalid Due Date");
    }
  } catch (e) {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;

  if (priorityArray.includes(priority)) {
    if (statusArray.includes(status)) {
      if (categoryArray.includes(category)) {
        try {
          const userdate = new Date(dueDate);
          console.log(userdate);
          const result = isValid(userdate);
          console.log(result);
          console.log(isMatch(dueDate, "yyyy-MM-dd"));
          const formmated = format(new Date(userdate), "yyyy-MM-dd");

          if (result) {
            const dbquery = `INSERT INTO todo 
                                                (id,todo,priority,status,category,due_date)
                                                VALUES(${id},"${todo}","${priority}","${status}",
                                                "${category}","${dueDate}");`;
            const dbresponse = await db.run(dbquery);
            response.send("Todo Successfully Added");
          } else {
            response.status(400);
            response.send("Invalid Due Date");
          }
        } catch (e) {
          response.status(400);
          response.send("Invalid Due Date");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else {
    response.status(400);
    response.send("Invalid Todo Priority");
  }
});

app.put("/todos/:todoId/", async (request, response) => {
  const requestbody = request.body;
  const { todoId } = request.params;
  const dbquery = `SELECT * FROM todo  WHERE id =${todoId};`;
  const dbresponse = await db.get(dbquery);
  console.log(dbresponse);
  const {
    todo = dbresponse.todo,
    priority = dbresponse.priority,
    status = dbresponse.status,
    category = dbresponse.category,
    dueDate = dbresponse.due_date,
  } = request.body;
  //console.log(request.body);
  switch (true) {
    case requestbody.status !== undefined:
      if (statusArray.includes(status)) {
        const query = `UPDATE todo SET todo="${todo}'", 
                    priority= "${priority}", 
                    status="${status}",
                    category="${category}",
                    due_date="${dueDate}" 
                    WHERE id = ${todoId};`;
        // responsetext = "Status Updated";
        const dbresponserece = await db.run(query);
        response.send("Status Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;

    case requestbody.priority !== undefined:
      if (priorityArray.includes(priority)) {
        const query = `UPDATE todo SET todo="${todo}'", 
                    priority= "${priority}", 
                    status="${status}",
                    category="${category}",
                    due_date="${dueDate}" 
                    WHERE id = ${todoId};`;
        //  responsetext = "Priority Updated";
        const dbresponserece = await db.run(query);
        response.send("Priority Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case requestbody.category !== undefined:
      if (categoryArray.includes(category)) {
        const query = `UPDATE todo SET todo="${todo}'", 
                    priority= "${priority}", 
                    status="${status}",
                    category="${category}",
                    due_date="${dueDate}" 
                    WHERE id = ${todoId};`;
        responsetext = "Category Updated";
        const dbresponserece = await db.run(query);
        response.send("Category Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case requestbody.todo !== undefined:
      const query = `UPDATE todo SET todo="${todo}'", 
                    priority= "${priority}", 
                    status="${status}",
                    category="${category}",
                    due_date="${dueDate}" 
                    WHERE id = ${todoId};`;
      responsetext = "Todo Updated";
      const dbresponserece = await db.run(query);
      response.send("Todo Updated");

      break;
    case requestbody.dueDate !== undefined:
      const result = isValid(new Date(dueDate));
      if (result) {
        const query = `UPDATE todo SET todo="${todo}'", 
                    priority= "${priority}", 
                    status="${status}",
                    category="${category}",
                    due_date="${dueDate}" 
                    WHERE id = ${todoId};`;
        //  responsetext = "Due Date Updated";
        const dbresponserece = await db.run(query);
        response.send("Due Date Updated");
      } else {
        response.status(400);
        response.send("Invalid Due Date");
      }
      break;
  }
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const dbquery = `DELETE FROM todo WHERE id = ${todoId}`;
  const dbresponse = await db.run(dbquery);
  response.send("Todo Deleted");
});

module.exports = app;
