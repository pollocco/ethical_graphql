const express = require('express')
const cors = require('cors')
const {graphqlHTTP} = require('express-graphql')
const gql = require('graphql-tag')
const {buildASTSchema} = require('graphql')
const {crops} = require('./crops.json')
const expressPlayground = require('graphql-playground-middleware-express')
  .default

const app = express()
app.use(cors())

const schema = buildASTSchema(gql `
    type Query {
        hello: String
        getUsers: [User]
        getCrops: [Crop]
        findCrop(filter: String): [Crop]
    }

    type Crop {
        id: ID
        name: String
        green: Int
        blue: Int 
        grey: Int 
    }

    type User {
        name: String
        email: String
        id: ID
    }
    
    type Mutation {
        newUser(name: String, email: String, id:Int): User
    }
`)

const USERS = new Map()
const CROPS = new Map()


class User {
    constructor(data){Object.assign(this, data)}
}

class Crop{
    constructor(data){Object.assign(this, data)}
}

cx = 0
crops.forEach(crop => {
    if(crop.name && crop.green && crop.blue && crop.grey){
        var {name, green, blue, grey} = crop
        CROPS.set(cx, new Crop({id:cx, name:name, green:parseInt(green), blue:parseInt(blue), grey:parseInt(grey)}))
        cx++
    }

})

const rootValue = {
    hello: () => 'Hello world!',
    newUser: async ({name, email, id}) =>{
        USERS.set(id, new User({name, email, id}))
        return USERS.get(id)
    },
    getUsers: () => USERS.values(),
    getCrops: () => CROPS.values(),
    findCrop: ({filter}) => {
        return new Map(
            [...CROPS].filter(([k, {name}]) => name.includes(filter)
            )
        ).values()
    }
}

app.use('/graphql', graphqlHTTP({schema, rootValue}))

app.get('/playground', expressPlayground({ endpoint: '/graphql' }))

const port = process.env.PORT || 4000
app.listen(port)

console.log(`Running GraphQL API server at localhost:${port}/graphql`)
console.log(`Running GraphQL API server at localhost:${port}/playground`)