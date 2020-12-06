import React from 'react';
import { graphql } from "react-apollo";

import TreeView from 'devextreme-react/tree-view';
import Sortable from 'devextreme-react/sortable';

import isEqual from 'lodash/isEqual';

import { copyJSON } from './../../constants/CommonFunctions';

import './../../styles/treeView.css';

import {
  GET_ALL_TODOS,
  DELETE_TODO_MUTATION,
  DELETE_COMPLETED_TODO_MUTATION,
  UPDATE_TODO_MUTATION,
  UPDATE_COMPLETION_TODO_MUTATION
} from "./../../constants/AppQueries";

class TreeViewComp extends React.Component {

  constructor(props) {
    super(props);

    this.treeViewRef = React.createRef();

    this.state = {
      items: copyJSON(props.items).map(v => { v.expanded = true; return v; }),
      view: "all"
    };

    this.displayExpr = "name";
    this.parentIdExpr = "parentId";
    this.keyExpr = "id";
    this.selectedExpr = "complete";
  };

  componentDidUpdate(prevProps) {
    let itemsEqual = isEqual(prevProps.items, this.props.items);

    if (!itemsEqual) {
      this.setState({ items: copyJSON(this.props.items).map(v => { v.expanded = true; return v; }) });
    }
  };

  /**
   * Filters todo list items based on view.
   * @param {string} view Filter view of todo list.
   * @returns {array}
   */
  getFilteredItems = (view) => {

    let items = copyJSON(this.state.items);

    switch (view) {
      case "active":
        items = items.filter(item => item[ this.selectedExpr ] === false);
        break;
    
      case "completed":
        items = items.filter(item => item[ this.selectedExpr ] === true);
        break;
    };

    return items;
  };

  /**
   * Set filter view.
   * @param {string} view View of todo list.
   */
  setView = (view) => {
    this.setState({ view });
  };

  /**
   * Sets "complete" field of items.
   * @param {array} nodes All todo list items.
   * @param {*} selected All selected items,
   */
  setCompletion = (nodes, selected) => {

    let selectedItems = {};

    // Setting ids that are completed;
    for (let i = 0; i < selected.length; i++) {
      selectedItems[ selected[i].key ] = true;
    };

    // Set completion for child.
    for (let i = 0; i < nodes.length; i++) {
      if (selectedItems[ nodes[i].id ]) {
        nodes[i].complete = true;
      } else {
        nodes[i].complete = false;
      }
    };

    return nodes;
  };

  /**
   * Function to handle selection of items.
   * @param {*} e TreeView Event.
   */
  onItemSelection = (e) => {

    const { client } = this.props;

    let nodes = copyJSON(this.state.items);
    let itemObj = {};

    let selected = e.component.getSelectedNodes();

    nodes = this.setCompletion(nodes, selected);

    for (let i = 0; i < nodes.length; i++) {
      itemObj[ nodes[i].id ] = nodes[i];
    };

    let propItems = copyJSON(this.props.items);

    let status = { "complete": [], "notComplete": [] };

    for (let i = 0; i < propItems.length; i++) {
      let item = propItems[i];

      if (itemObj[ item.id ] !== undefined && item.complete !== itemObj[ item.id ].complete) {
        if (itemObj[ item.id ].complete) {
          status.complete.push(item.id);
        } else {
          status.notComplete.push(item.id);
        }
      }
    };

    if (status.complete.length === 0) delete status.complete;
    if (status.notComplete.length === 0) delete status.notComplete;

    if (Object.keys(status).length > 0) {
      client.mutate({
        mutation: UPDATE_COMPLETION_TODO_MUTATION,
        variables: status,
        update: (cache, { data: { Todo } }) => {
          const data = cache.readQuery({ query: GET_ALL_TODOS });
          data.Todo.get = Todo.updateCompletion;
          cache.writeQuery({ query: GET_ALL_TODOS, data });
        }
      });
    } else {
      console.log("[onItemSelection] ==> No data updates");
    }
  };

  /**
   * Returns treeview instance.
   */
  get treeView() {
    return this.treeViewRef.current.instance;
  };

  /**
   * Removes items from todo list.
   * @param {*} item Item to remove.
   */
  removeItem = (item) => {

    const { client } = this.props;
    let itemCopy = copyJSON(item);

    client.mutate({
      mutation: DELETE_TODO_MUTATION,
      variables: { id: itemCopy.id },
      update: (cache, { data: { Todo } }) => {
        const data = cache.readQuery({ query: GET_ALL_TODOS });
        const todoList = data.Todo.get.filter(t => t.id !== itemCopy.id);
        cache.writeQuery({ query: GET_ALL_TODOS, data: { Todo: { get: todoList } } });
      }
    });
  };

  /**
   * Remvoe all completed items from list.
   */
  removeCompletedItems = () => {

    const { client } = this.props;

    client.mutate({
      mutation: DELETE_COMPLETED_TODO_MUTATION,
      update: (cache, { data: { Todo } }) => {
        const data = cache.readQuery({ query: GET_ALL_TODOS });
        const todoList = data.Todo.get.filter(t => t.complete === false);
        cache.writeQuery({ query: GET_ALL_TODOS, data: { Todo: { get: todoList } } });
      }
    });
  };

  /**
   * Edit and item.
   * @param {*} item Item to edit.
   */
  editItem = (item) => {
    let items = copyJSON(this.state.items);

    for (let i = 0; i < items.length; i++) {
      if (items[i].id === item.id) {
        items[i].edit = true;
      }
    };

    this.setState({ items });
  };

  /**
   * Update item's name.
   * @param {*} item Item to update.
   * @param {boolean} save Whether to save change or not.
   */
  updateItemText = (item, save) => {

    const { client, notify } = this.props;

    let items = copyJSON(this.state.items);

    let nodeItem;

    for (let i = 0; i < items.length; i++) {
      if (items[i].id === item.id) {
        nodeItem = items[i];
      }
    };

    if (save) {

      let newText = "";
      let elm = document.getElementById(`item-input-${item.id}`);

      if (elm !== null) {
        if (typeof elm.value === "string") {
          newText = elm.value.trim();
        }
      }

      if (newText === "") {
        notify.error(`Item's name cannot be empty`, 'Empty item name', 3000);
      } else {
        nodeItem[this.displayExpr] = newText;
        nodeItem.edit = false;

        this.setState({ items });

        client.mutate({
          mutation: UPDATE_TODO_MUTATION,
          variables: { id: nodeItem.id, name: nodeItem.name },
          update: (cache, { data: { Todo } }) => {
            const data = cache.readQuery({ query: GET_ALL_TODOS });
            const updated = Todo.update;
  
            const changedIndex = data.Todo.get.findIndex(
              t => t.id === updated.id
            );
            data.Todo.get[changedIndex] = updated;
            cache.writeQuery({ query: GET_ALL_TODOS, data });
          }
        });
      }
    } else {
      nodeItem.edit = false;
      this.setState({ items });
    }
  };

  /**
   * Triggers whether to update text or not based on key pressed.
   * @requires this.updateItemText
   * @param {*} event Browser event.
   * @param {*} item Item to handle.
   */
  handleKeyDown = (event, item) => {
    
    event.stopPropagation();

    switch (event.key) {
      case "Enter":
        this.updateItemText(item, true);  
        break;
      
      case "Escape":
        this.updateItemText(item, false);
        break;
    };
  };

  /**
   * Function to render an item.
   * @param {*} item Item to render.
   */
  itemsRender = (item) => {

    let _this = this;

    return (
      <div className={`custom-nav-item`}>
        <i className={`dx-icon ${ item.icon }`} />
        {
          item.edit
          ?
          (
            <React.Fragment>
              <input className={"border"} id={`item-input-${item.id}`} defaultValue={item[ _this.displayExpr ]} onKeyDown={(e) => this.handleKeyDown(e, item)} />
              <span className={"nav-item-action"}>
                <i className={"icon dx-icon-close"} title={"Cancel"} style={{ color: "red" }} onClick={() => _this.updateItemText(item, false)} />
                <i className={"icon dx-icon-check"} title={"Save"} style={{ color: "green" }} onClick={() => _this.updateItemText(item, true)} />
              </span>
            </React.Fragment>
          )
          :
          (
            <React.Fragment>
              <span>{ item[ _this.displayExpr ] }</span>
              <span className={"nav-item-action"}>
                <i className={"icon dx-icon-edit"} title={"Edit"} onClick={() => _this.editItem(item)} />
                <i className={"icon dx-icon-trash"} title={"Delete"} style={{ color: "red" }} onClick={() => _this.removeItem(item)} />
              </span>
            </React.Fragment>
          )
        }
      </div>
    );
  };

  /**
   * Handle drop of an item inside other.
   * @param {*} e TreeView event.
   */
  onDragEnd = (e) => {

    let _this = this;

    if (e.fromIndex === e.toIndex) {
      return;
    }

    let viewNodes = this.treeView.element().querySelectorAll('.dx-treeview-node');

    const fromId = viewNodes[e.fromIndex].getAttribute('data-item-id');
    const toId = viewNodes[e.toIndex].getAttribute('data-item-id');

    let items = copyJSON(this.state.items);

    let node = items.find(v => v.id === fromId);
    let parentId = "none";

    if (e.dropInsideItem) {
      parentId = toId;
    }

    let { client } = _this.props;

    client.mutate({
      mutation: UPDATE_TODO_MUTATION,
      variables: { id: node.id, name: node.name, parentId },
      update: (cache, { data: { Todo } }) => {

        const data = cache.readQuery({ query: GET_ALL_TODOS });
        const updated = Todo.update;

        const changedIndex = data.Todo.get.findIndex(t => t.id === updated.id);

        data.Todo.get[changedIndex] = updated;
        cache.writeQuery({ query: GET_ALL_TODOS, data });
      }
    });
  };

  render() {

    const { view } = this.state;
    const items = this.getFilteredItems(view);

    let itemCount = { left: 0, complete: 0 };

    for (let i = 0; i < this.state.items.length; i++) {
      if (this.state.items[i].complete) {
        itemCount.complete += 1;
      } else {
        itemCount.left += 1;
      }
    };

    const propItems = {
      noDataText: "No completed items"
      , displayExpr: this.displayExpr
      , parentIdExpr: this.parentIdExpr
      , keyExpr: this.keyExpr
      , selectedExpr: this.selectedExpr
    };
    
    return (
      <div className="form" style={{ position: "relative" }}>
        <Sortable
          filter=".dx-treeview-item"
          group="shared"
          data="item"
          allowDropInsideItem={true}
          allowReordering={true}
          onDragChange={this.onDragChange}
          onDragEnd={this.onDragEnd}
        >
          <TreeView
            id={"simple-treeview"}
            ref={this.treeViewRef}
            items={items}
            dataStructure={"plain"}
            width={500}
            selectNodesRecursive={true}
            selectByClick={false}
            showCheckBoxesMode={"normal"}
            selectionMode={"multiple"}
            onSelectionChanged={this.onItemSelection}
            itemRender={this.itemsRender}
            { ...propItems }
          />
        </Sortable>
        <div className={"filters-section"}>
          <span className="todo-count">
            <strong>{ itemCount.left }</strong> <span>{ (itemCount.left === 1) ? "item" : "items" } left</span>
          </span>
          <ul className={"filters"}>
            <li>
              <a
                className={`${(view === "all") ? 'selected' : ''}`}
                onClick={() => this.setView("all")}
              >
                All
              </a>
            </li>
            <li>
              <a
                className={`${(view === "active") ? 'selected' : ''}`}
                onClick={() => this.setView("active")}
              >
                Active
              </a>
            </li>
            <li>
              <a
                className={`${(view === "completed") ? 'selected' : ''}`}
                onClick={() => this.setView("completed")}
              >
                Completed
              </a>
            </li>
          </ul>
          {
            itemCount.complete > 0 && (
              <a className={"clear-completed"} onClick={this.removeCompletedItems}>
                Clear completed
              </a>
            )
          }
        </div>
      </div>
    );
  };
};

const TodoListItemWithMutation = graphql(
  DELETE_TODO_MUTATION,
  DELETE_COMPLETED_TODO_MUTATION,
  UPDATE_TODO_MUTATION,
  UPDATE_COMPLETION_TODO_MUTATION
)(TreeViewComp);

export default TodoListItemWithMutation;