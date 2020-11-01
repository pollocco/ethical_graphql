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
        getIngredients: [Ingredient]
        getUsers: [User]
        getCrops: [Crop]
        getRecipes: [Recipe]
        findCrop(filter: String): [Crop]
    }

    type Recipe {
        id: ID
        name: String
        ingredients: [RecipeIngredient]
    }

    type Ingredient{
        name: String
    }

    input IngredientInput{
        name: String
    }

    type RecipeIngredient{
        recipe: Recipe
        ingredient: Ingredient
        amount: Float
        unit: String
    }

    input RecipeIngredientInput{
        ingredient: IngredientInput
        amount: Float
        unit: String
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
        newIngredient(name:String): Ingredient
        newRecipe(id: ID, name: String, ingredients: [RecipeIngredientInput]): Recipe
    }
`)

const USERS = new Map()
const CROPS = new Map()
const INGREDIENTS = new Map()
const RECIPES = new Map()
const RECIPEINGREDIENTS = new Map()


class User {
    constructor(data){Object.assign(this, data)}
}

class Crop{
    constructor(data){Object.assign(this, data)}
}

class Ingredient{
    constructor(data){Object.assign(this, data)}
}

class Recipe{
    constructor(data){Object.assign(this, data)}
}

class RecipeIngredient{
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
    ingredient: async({name})=>{
        return INGREDIENTS.get(name)
    },
    newUser: async ({name, email, id}) =>{
        USERS.set(id, new User({name, email, id}))
        return USERS.get(id)
    },
    newIngredient: async({name})=>{
        INGREDIENTS.set(name, new Ingredient({name}))
        return INGREDIENTS.get(name)
    },
    newRecipeIngredient: ({recipe, ingredient, amount, unit})=>{
        var new_recipe_ingredient = new RecipeIngredient({recipe, ingredient, amount, unit})
        if(INGREDIENTS.get(ingredient.name) == null){
            INGREDIENTS.set(ingredient.name, new Ingredient({name:ingredient.name}))
        }
        RECIPEINGREDIENTS.set(recipe+ingredient, new_recipe_ingredient)
        return RECIPEINGREDIENTS.get(recipe+ingredient)
    },
    newRecipe: async({id, name, ingredients})=>{
        RECIPES.set(id, new Recipe({id:id, name:name, ingredients:ingredients.map((ingredient)=>{
            return rootValue.newRecipeIngredient({recipe:name, ingredient:{name:ingredient.ingredient.name}, amount:ingredient.amount, unit:ingredient.unit})
        })}))
        console.log(JSON.stringify(RECIPES.get(id)))
        return RECIPES.get(id)
    },
    getUsers: () => USERS.values(),
    getCrops: () => CROPS.values(),
    getIngredients: () => INGREDIENTS.values(),
    getRecipes: () => RECIPES.values(),
    getRecipeIngredients: () => RECIPEINGREDIENTS.values(),
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