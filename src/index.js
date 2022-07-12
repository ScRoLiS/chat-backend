import { Server } from 'socket.io'
import { Event } from './events.js'

const PORT = process.env.PORT || 4000

const server = new Server({
    cors: {
        origin: "*"
    }
})

let users = []

function addUser(user) {
    users.push(user)
}

function updateUser(user) {
    users.forEach((item, index) => {
        if (item.id === user.id)
            users[index] = user
    })
}

function removeUser(id) {
    users = users.filter((user) => {
        return user.id !== id
    })
}

server.on('connect', (socket) => {
    console.log(`${socket.id} connected`)
})

server.on('connection', (socket) => {
    socket.on(Event.USER_CONNECT, (user) => {
        user.id = socket.id
        addUser(user)
        server.emit(Event.USER_CONNECT, users)
        console.log(`${Event.USER_CONNECT}: ${users}`)
    })

    socket.on(Event.USER_UPDATE, (user) => {
        updateUser(user)
        server.emit(Event.USER_UPDATE, users)
        console.log(`${Event.USER_UPDATE}: ${user}`)
    })

    socket.on(Event.USER_MESSAGE, (user, message) => {
        updateUser(user)
        server.emit(Event.USER_MESSAGE, user, message)
        console.log(`${Event.USER_MESSAGE}: ${user} ${message}`)
    })

    socket.on('disconnect', () => {
        removeUser(socket.id)
        console.log(`${socket.id} disconnected`, users)
        server.emit(Event.USER_DISCONNECT, users)
    })
})


server.listen(PORT)
console.log(`SERVER STARTED AT ${PORT} PORT`)