# ethical_graphql

Run <code>npm install</code> followed by <code>node .</code>. Playground is accessible at <code>localhost:4000/playground</code>, endpoint for GraphQL instance set to  <code>localhost:4000/graphql</code>.

## Sample playground input:

    query SayHello {
      hello
    }

    mutation AddUser1{
      newUser(name:"Connor", email:"pollocco@oregonstate.edu", id:24){
        name 
        email 
      }
    }

    mutation AddUser2{
      newUser(name:"Mr. P", email:"dodo@gmail.com", id:6){
        name
        email
      }
    }

    query GetUsers{
      getUsers{
        name
        email
      }
    }

    query GetAllCrops{
      getCrops{
        name
        green
        blue
        grey
        id
      }
    }

    query SearchForWheat{
      findCrop(filter:"Wheat"){
        name
        green
        blue
        grey
      }
    }
