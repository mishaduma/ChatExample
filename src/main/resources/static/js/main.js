'use strict';


var messageForm = document.querySelector('#messageForm');
var messageInput = document.querySelector('#message');
var messageArea = document.querySelector('#messageArea');
var usersArea = document.querySelector('#userArea');
var connectingElement = document.querySelector('#connecting');

var stompClient = null;
var username = null;

var messagesList = new XMLHttpRequest();
var usersList = new XMLHttpRequest();

function connect() {
    username = document.querySelector('#username').innerText.trim();

    var socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);

    stompClient.connect({}, onConnected, onError);
}

// Connect to WebSocket Server.
connect();

function onConnected() {
    // Subscribe to the Public Topic
    stompClient.subscribe('/topic/publicChatRoom', onMessageReceived);

    loadMessageHistory();

    // Tell your username to the server
    stompClient.send("/app/chat.addUser",
        {},
        JSON.stringify({sender: username, type: 'JOIN'})
    )

    connectingElement.classList.add('hidden');
}


function onError(error) {
    connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
    connectingElement.style.color = 'red';
}


function sendMessage(event) {
    var messageContent = messageInput.value.trim();
    if(messageContent && stompClient) {
        var chatMessage = {
            sender: username,
            content: messageInput.value,
            type: 'CHAT'
        };
        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
        messageInput.value = '';
    }
    event.preventDefault();
}


function onMessageReceived(payload) {
    var message = JSON.parse(payload.body);

    var messageElement = document.createElement('li');

    if(message.type === 'JOIN') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' вошёл!';
        listUsers();
    } else if (message.type === 'LEAVE') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' вышел!';
        listUsers();
    } else {
        messageElement.classList.add('chat-message');
        var usernameElement = document.createElement('strong');
        usernameElement.classList.add('nickname');
        var usernameText = document.createTextNode(message.sender);
        usernameElement.appendChild(usernameText);
        messageElement.appendChild(usernameElement);
    }

    var textElement = document.createElement('span');
    var messageText = document.createTextNode(message.content);
    textElement.appendChild(messageText);

    messageElement.appendChild(textElement);

    messageArea.appendChild(messageElement);
    messageArea.scrollTop = messageArea.scrollHeight;
}

function loadMessageHistory() {
    messagesList.open("GET", "/messages");
    messagesList.send();

    messagesList.onload = function() {
            var messages = JSON.parse(messagesList.response);
            for(var i in messages) {
                var messageElement = document.createElement('li');
                messageElement.classList.add('chat-message');
                var usernameElement = document.createElement('strong');
                usernameElement.classList.add('nickname');
                var usernameText = document.createTextNode(messages[i].sender);
                usernameElement.appendChild(usernameText);
                messageElement.appendChild(usernameElement);
                var textElement = document.createElement('span');
                var messageText = document.createTextNode(messages[i].content);
                textElement.appendChild(messageText);
                messageElement.appendChild(textElement);
                messageArea.prepend(messageElement);
            }
        }
}

function listUsers() {
    while (usersArea.firstChild) {
        usersArea.removeChild(usersArea.firstChild);
    }
    usersList.open("GET", "/users");
    usersList.send();

    usersList.onload = function() {
        var users = JSON.parse(usersList.response);
        for(var i in users) {
            var messageElement = document.createElement('li');
                messageElement.classList.add('chat-message');
                var usernameElement = document.createElement('strong');
                usernameElement.classList.add('nickname');
                var usernameText = document.createTextNode(users[i].name);
                usernameElement.appendChild(usernameText);
                messageElement.appendChild(usernameElement);
                usersArea.appendChild(messageElement);
        }
    }
}

messageForm.addEventListener('submit', sendMessage, true);
