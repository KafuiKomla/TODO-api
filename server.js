/**
 * Created by kafui on 6/16/2016.
 */
var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId =1;

app.use(bodyParser.json());

app.get('/', function(req,res){
    res.send('TODO API root!');
});


//GET /todos?completed=true
app.get('/todos', function(req,res){
    var queryParams = req.query;
    var filteredTodos = todos;
    if(queryParams.hasOwnProperty('complete') && queryParams.complete === 'true'){
        filteredTodos = _.where(filteredTodos,{complete:true});
    }else if(queryParams.hasOwnProperty('complete') && queryParams.complete === 'false'){
        filteredTodos = _.where(filteredTodos,{scomplete:false});
    }


    res.json(filteredTodos);
});


//GET /todos/:id
app.get('/todos/:id',function(req,res){
    var todoId = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos,{id: todoId});
    if(matchedTodo){
        res.json(matchedTodo);
    }else{
        res.status(404).send();
    }
    //res.send('Asking for todos with id of: ' + req.params.id);
});

//POST /todos/
app.post('/todos',function(req,res){
    var body = _.pick(req.body,'description','complete','id');
    if(!_.isBoolean(body.complete) || !_.isString(body.description) || body.description.trim().length === 0){
        return res.status(400).send();
    }

    body.description = body.description.trim();
    //add id
    body.id = todoNextId;
    todoNextId++;
    //push todo
    todos.push(body);
    res.json(body);
});

app.delete('/todos/:id', function(req,res){
    var todoId = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos,{id:todoId});
    if(!matchedTodo){
        res.status(404).json({"error": "Request could not be completed!"})
    }else{
        todos = _.without(todos,matchedTodo);
        res.json(matchedTodo);
    }
});

app.put('/todos/:id', function(req,res){
    var todoId = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos,{id:todoId});
    var body = _.pick(req.body,'description','complete');
    var validAttributes = {};

    if(!matchedTodo){
        return res.status(404).send();
    }

    if(body.hasOwnProperty('complete') && _.isBoolean(body.complete)){
        validAttributes.complete = body.complete;
    }else if (body.hasOwnProperty('complete')){
        return res.status(404).send();
    }

    if(body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0){
        validAttributes.description = body.description;
    }else if(body.hasOwnProperty('description')){
        return res.status(404).send();
    }

    _.extend(matchedTodo,validAttributes);
    res.json(matchedTodo);
});

app.listen(PORT, function(){
    console.log('Express Listening on port: '+ PORT + '!');
});