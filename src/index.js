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

function getUser(id) {
    const user = users.find((item) => {
        return item.id === id
    })

    return user
}

server.on('connect', (socket) => {
    console.log(`${socket.id} connected`)
})

server.on('connection', (socket) => {
    socket.on(Event.USER_CONNECT, (user) => {
        addUser(user)
        server.emit(Event.USER_CONNECT, user, users)
        console.log(`${Event.USER_CONNECT}: ${user} ${users}`)
    })

    socket.on(Event.USER_UPDATE, (newUser) => {
        const oldUser = getUser(newUser.id)
        updateUser(newUser)
        server.emit(Event.USER_UPDATE, oldUser, newUser, users)
        console.log(`${Event.USER_UPDATE}: ${oldUser} ${newUser} ${users}`)
    })

    socket.on(Event.USER_MESSAGE, (message) => {
        server.emit(Event.USER_MESSAGE, message)
        console.log(`${Event.USER_MESSAGE}: ${message}`)
    })

    socket.on('disconnect', () => {
        const user = getUser(socket.id)
        removeUser(socket.id)
        console.log(`${socket.id} disconnected`, user, users)
        server.emit(Event.USER_DISCONNECT, user, users)
    })
})


server.listen(PORT)
console.log(`SERVER STARTED AT ${PORT} PORT`)