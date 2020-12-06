import React from 'react';
import { graphql } from "react-apollo";

import TreeView from 'devextreme-react/tree-view';
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
      items: copyJSON(props.items),
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
      this.setState({ items: copyJSON(this.props.items) });
    }
  };

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

  setView = (view) => {
    this.setState({ view });
  };

  onItemSelection = (e) => {

    const { client } = this.props;

    let nodes = e.component.getNodes();
    let itemObj = {};

    nodes.forEach(v =>  {
      itemObj[ v.itemData.id ] = v.itemData;
    });

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

  get treeView() {
    return this.treeViewRef.current.instance;
  };

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

  editItem = (item) => {
    let items = copyJSON(this.state.items);

    for (let i = 0; i < items.length; i++) {
      if (items[i].id === item.id) {
        items[i].edit = true;
      }
    };

    this.setState({ items });
  };

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
  
            this.setState({ isInEditMode: false });
          }
        });
      }
    } else {
      nodeItem.edit = false;
      this.setState({ items });
    }
  };

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
        <TreeView
          id={"simple-treeview"}
          ref={this.treeViewRef}
          items={items}
          dataStructure={"plain"}
          width={500}
          selectNodesRecursive={false}
          selectByClick={false}
          showCheckBoxesMode={"normal"}
          selectionMode={"multiple"}
          onSelectionChanged={this.onItemSelection}
          itemRender={this.itemsRender}
          { ...propItems }
        />
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