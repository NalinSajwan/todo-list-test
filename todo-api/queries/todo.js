// Internal Services.
const TodoService = require('./../services/todo')
  , todoService = new TodoService();

const todoResolver = {
  Query: {
    Todo: function() {
      return {
        get: async() => {
          return await todoService.getAll();
        }
      }
    }
  }
};

module.exports = todoResolver;