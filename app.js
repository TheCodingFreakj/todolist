const express = require("express");
//let ejs = require('ejs');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { compile } = require("ejs");

mongoose.connect('mongodb://localhost:27017/listDB', {useNewUrlParser: true, useUnifiedTopology: true});

const app = express();

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

//const listItemsArray = ["This is list 1","This is list 2","This is list 3"];

const listSchema = new mongoose.Schema({
    name: String
  });
const Item = mongoose.model('Item', listSchema);

const item1 = new Item({ name: 'This is list 1' });
const item2 = new Item({ name: 'This is list 2' });
const item3 = new Item({ name: 'This is list 3' });

const itemsArray = [item1, item2, item3];

const customlistSchema = new mongoose.Schema({
   name: String,
   items: [listSchema]
 });

 const List = mongoose.model('List', customlistSchema);

app.get("/", function(req, res){
   //render the list page here

   //find all items in db
   Item.find({}, function(err, foundLists){

      

    //check if the array is empty 
    if(itemsArray.length === 0){
        //insert this document in db


        Item.insertMany( itemsArray, function(err){

         if(err){
            console.log(err);
         }else {
            console.log("Documents stored in Item collection");
         }
      } );
      res.redirect("/");
      console.log(foundLists);
    } else {
        res.render("list", {listTitle:"Today", listItemsArray:foundLists} );
    }

   });
   
});


//Dynamic Route

app.get("/:customListName", function(req, res){

   //console.log(req.params.customListName);

   const customListName= req.params.customListName;


   List.findOne({ name: customListName}, function(err, result){

      if(!err){
         if(!result){
           //create a new document

           const list = new List({ 
            name: customListName,
            items: itemsArray // Used the default array to prepopulate the items
         });
      
         list.save();
         res.redirect("/" + customListName);

         }else {
            //show the existing list

            res.render("list", {listTitle:result.name, listItemsArray:result.items} );  
         }
      }

   });

  

});



app.post("/", function(req, res){
const newAddedItem= req.body.itemAdd;
const customList= req.body.itemsAddButton;

//Creating new document as per button click parameter

const item = new Item({ name: newAddedItem });


if(customList === "Today"){

item.save();

//To show on page redirect to the route where we render document

res.redirect("/");

}else{

   List.findOne({name: customList}, function(err, result){
     result.items.push(item);

     result.save();
   //redirect to the /:customListName route to render
     res.redirect("/" + customList);
   })

}




});


app.post("/delete", function(req,res){

   console.log(req.body.checkbox);

   const checkedId = req.body.checkbox;

   Item.findByIdAndRemove(checkedId, function(err){

      if(!err){
         console.log("Ticked Item is deleted");
         res.redirect("/");
      }

   });

});
   

app.listen(3000, function(){

	console.log("Server is running at port 3000");
});
