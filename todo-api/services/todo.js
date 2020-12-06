const {
    ApolloError
  } = require('apollo-server')
  , TodoModel = require("./../models/todo");

class Todo {

  /**
   * Get all todo items from collection.
   */
  async getAll() {

    const todos = TodoModel.find().exec();

    if (!todos) {
      throw new ApolloError(`Unable to find todo in collection.`, "DB_FAILURE", { response: todos });
    }

    return todos;
  };

  /**
   * Add item to Todo collection.
   * @param {{name: string}} params
   */
  async addItem(params) {

    const tModel = new TodoModel(params);

    const now = new Date();

    tModel.modifiedAt = now;
    tModel.createdAt = now;
    tModel.complete = false;

    const todoModel = await tModel.save();

    if (!todoModel) {
      throw new ApolloError(`Unable to add todo item in collection.`, "DB_FAILURE", { response: todoModel });
    }

    return todoModel;
  };

  /**
   * Remove item from Todo collection.
   * @param {{id: string}} params
   */
  async removeItem(params) {

    let removeError
      , removedItem;
    
    try {
      removedItem = await TodoModel.findByIdAndRemove({ _id: params.id }).exec();
    } catch (err) {
      removeError = err;
    }

    if (removeError) {
      let errTxt = removeError.toString();

      if (errTxt.startsWith("CastError: Cast to ObjectId failed")) {
        removedItem = "Invalid id provided";
      } else {
        throw new ApolloError(`Unable to remove todo item in collection.`, "UNKNOWN_ERROR", { response: removeError });
      }
    }

    if (typeof removedItem === "object") {
      removedItem = `Removed item with id "${removedItem.id}"`;
    }

    if (removedItem === null) {
      removedItem = "Item does not exist in collection";
    }

    return removedItem;
  };

  /**
   * Remove completed items from Todo collection.
   */
  async removeCompletedItems() {

    let res = await TodoModel.deleteMany({ complete: true }).exec();
    let msg = `Removed ${res.deletedCount} items from collection.`;

    return msg;
  };

  /**
   * Update item in Todo collection.
   * @param {{id: string, name: string, complete: booloean, parentId: string}} params
   */
  async updateItem(params) {

    let toUpdate = {
      name: params.name
    };

    if (typeof params.complete === "boolean") {
      toUpdate[ "complete" ] = params.complete;
    }

    if (typeof params.parentId === "string" && params.parentId.trim() !== "") {
      toUpdate[ "parentId" ] = (params.parentId === "none") ? null : params.parentId;
    }

    let updateError
      , updateItem;

    try {
      updateItem = await TodoModel.findByIdAndUpdate({ _id: params.id }, { $set: toUpdate }, { new: true });
    } catch (err) {
      updateError = err;
    }

    if (updateError) {
      let errTxt = updateError.toString();

      if (errTxt.startsWith("CastError: Cast to ObjectId failed")) {
        throw new ApolloError(`Invalid id provided.`, "UNKNOWN_ERROR", { response: updateError });
      } else {
        throw new ApolloError(`Unable to update todo item in collection.`, "UNKNOWN_ERROR", { response: updateError });
      }
    }

    if (updateItem === null) {
      throw new ApolloError(`Item does not exist in collection.`, "UNKNOWN_ERROR", { response: updateItem });
    }

    return updateItem;
  };

  /**
   * Update todo items completion.
   * @param {{complete: [string], notComplete: [string]}} params
   */
  async updateItemsCompletion(params) {

    let completedQ
      , notCompeledQ;

    if (params.complete instanceof Array && params.complete.length > 0) {
      completedQ = {
        _id: {
          "$in": params.complete
        }
      };
    }

    if (params.notComplete instanceof Array && params.notComplete.length > 0) {
      notCompeledQ = {
        _id: {
          "$in": params.notComplete
        }
      };
    }

    if (completedQ !== undefined) {
      await TodoModel.updateMany(completedQ, { $set: { complete: true } }).exec();
    }

    if (notCompeledQ !== undefined) {
      await TodoModel.updateMany(notCompeledQ, { $set: { complete: false } }).exec();
    }

    return await this.getAll();
  };

};

module.exports = Todo;