// Internal Services.
const TodoService = require('./../services/todo')
  , todoService = new TodoService();

module.exports = {
  Mutation: {
    Todo: () => {
      return {
        /**
         * Add mutation resolver.
         * @param {{name: string}} params
         */
        add: async (params) => {
          const msg = await todoService.addItem(params);
          return msg;
        },

        /**
         * Remove mutation resolver.
         * @param {{id: string}} params
         */
        remove: async (params) => {
          const msg = await todoService.removeItem(params);
          return msg;
        },

        /**
         * Remove completed items mutation resolver.
         */
        removeCompleted: async () => {
          const msg = await todoService.removeCompletedItems();
          return msg;
        },

        /**
         * Update mutation resolver.
         * @param {{id: string, name: string, complete: booloean, parentId: string}} params
         */
        update: async (params) => {
          const msg = await todoService.updateItem(params);
          return msg;
        },

        /**
         * Update completion mutation resolver.
         * @param {{complete: [string], notComplete: [string]}} params
         */
        updateCompletion: async (params) => {
          const msg = await todoService.updateItemsCompletion(params);
          return msg;
        }
      };
    }
  }
};